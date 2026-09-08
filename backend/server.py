from dotenv import load_dotenv
load_dotenv()

import os
import csv
import io
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, Response, UploadFile, File
from fastapi.responses import StreamingResponse, Response as RawResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "sixnema")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
# ponytail: motor client is lazy (no I/O until first query), so module-level is fine for serverless cold starts.
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
JWT_ALGORITHM = "HS256"

app = FastAPI(title="SIXNEMA API")
api = APIRouter(prefix="/api")

# ---------- Models ----------
class LoginInput(BaseModel):
    email: str
    password: str

class RegisterInput(BaseModel):
    email: str
    role: str
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    title: str
    role: str
    student_id: Optional[str] = None

class StudentInput(BaseModel):
    name: str
    nis: str
    class_name: str = Field(alias="class")

class GradeInput(BaseModel):
    theory: float = Field(ge=0, le=100)
    artwork: float = Field(ge=0, le=100)
    notes: Optional[str] = ""

class JournalInput(BaseModel):
    topic: str
    summary: str

class ArtworkInput(BaseModel):
    title: str
    url: str
    description: str

class FeedbackInput(BaseModel):
    text: str
    target_role: str = "pembina"

class AttendanceInput(BaseModel):
    date: str
    records: Dict[str, str]

# ---------- Utils ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def public_user(user: Dict[str, Any]) -> Dict[str, Any]:
    return {"id": user["id"], "email": user["email"], "name": user["name"],
            "title": user["title"], "role": user["role"], "student_id": user.get("student_id")}

def token_for(user: Dict[str, Any]) -> str:
    return jwt.encode({"sub": user["id"], "type": "access",
                       "exp": datetime.now(timezone.utc) + timedelta(hours=8)}, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def current_user(request: Request) -> Dict[str, Any]:
    token = request.cookies.get("access_token")
    if not token:
        header = request.headers.get("Authorization", "")
        token = header[7:] if header.startswith("Bearer ") else ""
    if not token:
        raise HTTPException(401, "Sesi belum aktif")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    except (jwt.InvalidTokenError, KeyError):
        user = None
    if not user:
        raise HTTPException(401, "Sesi tidak valid atau sudah berakhir")
    return user

def require_roles(*roles: str):
    async def checker(user: Dict[str, Any] = Depends(current_user)):
        if user["role"] not in roles:
            raise HTTPException(403, "Akses tidak sesuai peran")
        return user
    return checker

def compute_total(theory: float, artwork: float) -> float:
    return round(theory * 0.4 + artwork * 0.6, 1)

# ---------- Seed data ----------
# Only the 3 demo accounts are seeded; no students/journals/artworks/feedback.
async def seed_users():
    accounts = [
        {"id": "user-pembina", "email": os.environ.get("DEMO_PEMBINA_EMAIL", "pembina@sixnema.id"), "password": os.environ.get("DEMO_PEMBINA_PASSWORD", "demo-pembina"), "name": "Ustadz Arifin, S.Pd", "title": "Pembina Ekskul Fotografi & Videografi", "role": "pembina"},
        {"id": "user-siswa",   "email": os.environ.get("DEMO_SISWA_EMAIL", "siswa@sixnema.id"),   "password": os.environ.get("DEMO_SISWA_PASSWORD", "demo-siswa"),   "name": "Ahmad Zaki Al-Farizi", "title": "Siswa Ekskul (Kelas 8A)", "role": "siswa", "student_id": "student-1"},
        {"id": "user-waka",    "email": os.environ.get("DEMO_WAKA_EMAIL", "waka@sixnema.id"),    "password": os.environ.get("DEMO_WAKA_PASSWORD", "demo-waka"),    "name": "Drs. H. M. Fauzi", "title": "Waka Kesiswaan SMP Muhammadiyah 6 Surabaya", "role": "waka"},
    ]
    for account in accounts:
        doc = {**account, "password_hash": bcrypt.hashpw(account.pop("password").encode(), bcrypt.gensalt()).decode()}
        await db.users.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)

# Seeding & index creation moved to seed.py (run once manually against Atlas).
# serverless: no startup lifecycle guarantees.

# ---------- Auth ----------
@api.get("/health")
async def health():
    return {"status": "ok", "app": "sixnema"}

@api.post("/auth/login", response_model=UserOut)
async def login(payload: LoginInput, response: Response):
    user = await db.users.find_one({"email": payload.email.strip().lower()}, {"_id": 0})
    if not user or not bcrypt.checkpw(payload.password.encode(), user["password_hash"].encode()):
        raise HTTPException(401, "Email atau kata sandi salah")
    response.set_cookie("access_token", token_for(user), httponly=True, secure=True, samesite="none", max_age=28800)
    return public_user(user)

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"ok": True}

ROLE_TITLES = {
    "pembina": "Pembina Ekskul Fotografi & Videografi",
    "siswa": "Siswa Ekskul",
    "waka": "Waka Kesiswaan",
}

@api.post("/auth/register", response_model=UserOut)
async def register(payload: RegisterInput, response: Response):
    email = payload.email.strip().lower()
    if payload.role not in ROLE_TITLES:
        raise HTTPException(400, "Peran tidak valid")
    if len(payload.password) < 6:
        raise HTTPException(400, "Kata sandi minimal 6 karakter")
    if await db.users.find_one({"email": email}, {"_id": 0}):
        raise HTTPException(409, "Email sudah terdaftar")
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": email.split("@")[0],
        "title": ROLE_TITLES[payload.role],
        "role": payload.role,
        "password_hash": bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode(),
    }
    await db.users.insert_one(user)
    response.set_cookie("access_token", token_for(user), httponly=True, secure=True, samesite="none", max_age=28800)
    return public_user(user)

@api.get("/auth/me", response_model=UserOut)
async def me(user=Depends(current_user)):
    return public_user(user)

# ---------- Students ----------
@api.get("/students")
async def list_students(user=Depends(current_user)):
    return await db.students.find({}, {"_id": 0}).sort("name", 1).to_list(500)

@api.post("/students")
async def create_student(payload: StudentInput, user=Depends(require_roles("pembina"))):
    student = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(by_alias=True),
        "theory": 75, "artwork": 75,
        "total": compute_total(75, 75),
        "notes": "Siswa baru bergabung di ekstrakurikuler.",
    }
    await db.students.insert_one(student)
    student.pop("_id", None)
    return student

@api.delete("/students/{student_id}")
async def delete_student(student_id: str, user=Depends(require_roles("pembina"))):
    result = await db.students.delete_one({"id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Siswa tidak ditemukan")
    await db.grade_snapshots.delete_many({"student_id": student_id})
    return {"ok": True}

@api.patch("/students/{student_id}/grades")
async def update_grades(student_id: str, payload: GradeInput, user=Depends(require_roles("pembina"))):
    total = compute_total(payload.theory, payload.artwork)
    update = {"theory": payload.theory, "artwork": payload.artwork, "total": total}
    if payload.notes:
        update["notes"] = payload.notes
    result = await db.students.update_one({"id": student_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(404, "Siswa tidak ditemukan")
    await db.grade_snapshots.insert_one({
        "id": str(uuid.uuid4()),
        "student_id": student_id,
        "theory": payload.theory,
        "artwork": payload.artwork,
        "total": total,
        "created_at": now_iso(),
    })
    return await db.students.find_one({"id": student_id}, {"_id": 0})

@api.get("/students/{student_id}/grade-history")
async def grade_history(student_id: str, user=Depends(current_user)):
    if user["role"] == "siswa" and user.get("student_id") != student_id:
        raise HTTPException(403, "Hanya dapat melihat riwayat nilai sendiri")
    snapshots = await db.grade_snapshots.find({"student_id": student_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    monthly: Dict[str, Dict[str, Any]] = {}
    for s in snapshots:
        key = s["created_at"][:7]  # YYYY-MM
        m = monthly.setdefault(key, {"month": key, "theory_sum": 0.0, "artwork_sum": 0.0, "total_sum": 0.0, "count": 0})
        m["theory_sum"] += s["theory"]
        m["artwork_sum"] += s["artwork"]
        m["total_sum"] += s["total"]
        m["count"] += 1
    monthly_avg = [
        {
            "month": k,
            "theory": round(v["theory_sum"] / v["count"], 1),
            "artwork": round(v["artwork_sum"] / v["count"], 1),
            "total": round(v["total_sum"] / v["count"], 1),
        }
        for k, v in sorted(monthly.items())
    ]
    return {"snapshots": snapshots, "monthly": monthly_avg}

# ---------- Journals ----------
async def compute_attendance_summary() -> str:
    latest = await db.attendance.find_one({}, sort=[("created_at", -1)])
    if not latest:
        return "Belum ada data absensi tercatat"
    counts = {"Hadir": 0, "Tidak Hadir": 0, "Sakit": 0}
    for status in latest.get("records", {}).values():
        counts[status] = counts.get(status, 0) + 1
    return f"Hadir: {counts['Hadir']}, Tidak Hadir: {counts['Tidak Hadir']}, Sakit: {counts['Sakit']}"

@api.get("/journals")
async def journals(user=Depends(current_user)):
    return await db.journals.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)

@api.post("/journals")
async def create_journal(payload: JournalInput, user=Depends(require_roles("pembina"))):
    now = datetime.now(timezone.utc)
    data = {
        "id": str(uuid.uuid4()),
        "topic": payload.topic,
        "summary": payload.summary,
        "date": now.date().isoformat(),
        "attendance_summary": await compute_attendance_summary(),
        "created_at": now.isoformat(),
    }
    await db.journals.insert_one(data)
    data.pop("_id", None)
    return data

# ---------- Artworks ----------
@api.get("/artworks")
async def artworks(user=Depends(current_user)):
    query = {"student_id": user.get("student_id")} if user["role"] == "siswa" else {}
    return await db.artworks.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)

@api.post("/artworks")
async def create_artwork(payload: ArtworkInput, user=Depends(require_roles("siswa"))):
    data = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "student_id": user["student_id"],
        "student_name": user["name"],
        "status": "Pending Review",
        "created_at": now_iso(),
    }
    await db.artworks.insert_one(data)
    data.pop("_id", None)
    return data

# ---------- Feedback ----------
@api.get("/feedback")
async def feedback(user=Depends(current_user)):
    return await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)

@api.post("/feedback")
async def create_feedback(payload: FeedbackInput, user=Depends(require_roles("waka", "pembina"))):
    data = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "author": user["name"],
        "author_role": user["role"],
        "created_at": now_iso(),
    }
    await db.feedback.insert_one(data)
    data.pop("_id", None)
    return data

# ---------- Attendance ----------
@api.get("/attendance")
async def list_attendance(user=Depends(require_roles("pembina", "waka"))):
    return await db.attendance.find({}, {"_id": 0}).sort("date", -1).to_list(500)

@api.post("/attendance")
async def create_attendance(payload: AttendanceInput, user=Depends(require_roles("pembina"))):
    data = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": now_iso(),
    }
    await db.attendance.update_one({"date": payload.date}, {"$set": data}, upsert=True)
    return data

# ---------- Exports ----------
def stream_csv(rows: List[List[Any]], filename: str) -> StreamingResponse:
    buf = io.StringIO()
    writer = csv.writer(buf)
    for r in rows:
        writer.writerow(r)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

@api.get("/export/ranking.csv")
async def export_ranking(user=Depends(require_roles("pembina", "waka"))):
    students = await db.students.find({}, {"_id": 0}).to_list(500)
    students.sort(key=lambda s: s.get("total", 0), reverse=True)
    rows = [["Rank", "Nama", "NIS", "Kelas", "Teori (40%)", "Karya (60%)", "Total"]]
    for i, s in enumerate(students, start=1):
        rows.append([i, s["name"], s["nis"], s["class"], s["theory"], s["artwork"], s.get("total", 0)])
    return stream_csv(rows, "sixnema-ranking.csv")

@api.get("/export/attendance.csv")
async def export_attendance(user=Depends(require_roles("pembina", "waka"))):
    records = await db.attendance.find({}, {"_id": 0}).sort("date", 1).to_list(500)
    students = await db.students.find({}, {"_id": 0}).sort("name", 1).to_list(500)
    student_map = {s["id"]: s["name"] for s in students}
    rows = [["Tanggal", "Siswa", "NIS", "Kelas", "Status"]]
    for rec in records:
        for sid, status in rec.get("records", {}).items():
            student = next((s for s in students if s["id"] == sid), None)
            rows.append([
                rec["date"],
                student_map.get(sid, sid),
                student["nis"] if student else "-",
                student["class"] if student else "-",
                status,
            ])
    return stream_csv(rows, "sixnema-absensi.csv")

@api.get("/export/journals.csv")
async def export_journals(user=Depends(require_roles("pembina", "waka"))):
    journals = await db.journals.find({}, {"_id": 0}).sort("created_at", 1).to_list(500)
    rows = [["Tanggal", "Topik", "Ringkasan", "Kehadiran"]]
    for j in journals:
        rows.append([j.get("date", ""), j.get("topic", ""), j.get("summary", ""), j.get("attendance_summary", "")])
    return stream_csv(rows, "sixnema-jurnal.csv")

# ---------- Media (Flipbook) ----------
FLIPBOOK_KEY = "flipbook-active"
CHUNK_SIZE = 255 * 1024  # 255KB per chunk (GridFS standard)

async def _upload_pdf(data: bytes, filename: str, uploaded_by: str):
    import hashlib
    from bson import ObjectId
    await db.fs.chunks.delete_many({"files_id": FLIPBOOK_KEY})
    await db.fs.files.delete_one({"_id": FLIPBOOK_KEY})
    chunks = [data[i:i+CHUNK_SIZE] for i in range(0, len(data), CHUNK_SIZE)] or [b""]
    for idx, chunk in enumerate(chunks):
        await db.fs.chunks.insert_one({"files_id": FLIPBOOK_KEY, "n": idx, "data": chunk})
    await db.fs.files.insert_one({
        "_id": FLIPBOOK_KEY, "filename": filename, "length": len(data),
        "chunkSize": CHUNK_SIZE, "uploadDate": now_iso(),
        "metadata": {"content_type": "application/pdf", "uploaded_by": uploaded_by,
                     "original_name": filename, "size": len(data)},
    })

async def _download_pdf() -> bytes:
    file_doc = await db.fs.files.find_one({"_id": FLIPBOOK_KEY})
    if not file_doc:
        return b""
    cursor = db.fs.chunks.find({"files_id": FLIPBOOK_KEY}).sort("n", 1)
    chunks = [c["data"] async for c in cursor]
    return b"".join(chunks) if chunks else b""

async def _delete_pdf():
    await db.fs.chunks.delete_many({"files_id": FLIPBOOK_KEY})
    deleted = await db.fs.files.delete_one({"_id": FLIPBOOK_KEY})
    return deleted.deleted_count > 0

@api.get("/media/flipbook")
async def get_flipbook():
    data = await _download_pdf()
    if not data:
        raise HTTPException(404, "Belum ada flipbook")
    file_doc = await db.fs.files.find_one({"_id": FLIPBOOK_KEY})
    name = (file_doc or {}).get("filename", "flipbook")
    return RawResponse(content=data, media_type="application/pdf",
                       headers={"Content-Disposition": f'inline; filename="{name}"',
                                "Cache-Control": "public, max-age=3600"})

@api.post("/media/flipbook")
async def upload_flipbook(file: UploadFile = File(...), user=Depends(require_roles("pembina", "waka"))):
    content = await file.read()
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(413, "File terlalu besar, maksimal 15MB")
    await _upload_pdf(content, file.filename or "flipbook.pdf", user["id"])
    return {"ok": True, "filename": file.filename, "size": len(content)}

@api.delete("/media/flipbook")
async def delete_flipbook(user=Depends(require_roles("pembina", "waka"))):
    if not await _delete_pdf():
        raise HTTPException(404, "Tidak ada flipbook untuk dihapus")
    return {"ok": True}

app.include_router(api)
app.add_middleware(CORSMiddleware, allow_origins=[FRONTEND_ORIGIN], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
