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
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
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
INITIAL_STUDENTS = [
    {"id": "student-1",  "name": "Ahmad Zaki Al-Farizi", "nis": "2024001", "class": "8A", "theory": 88, "artwork": 92, "notes": "Sangat antusias dalam teknik pencahayaan low-key portrait."},
    {"id": "student-2",  "name": "Siti Nur Haliza",      "nis": "2024002", "class": "8A", "theory": 90, "artwork": 95, "notes": "Karya videografi sinematik pendek sangat kreatif dan rapi."},
    {"id": "student-3",  "name": "Rizky Ramadhan",       "nis": "2024003", "class": "8B", "theory": 82, "artwork": 85, "notes": "Perlu latihan lebih konsisten pada exposure manual."},
    {"id": "student-4",  "name": "Dewi Lestari",         "nis": "2024004", "class": "8B", "theory": 85, "artwork": 88, "notes": "Komposisi rule of thirds sudah sangat baik."},
    {"id": "student-5",  "name": "Muhammad Farel",       "nis": "2024005", "class": "9A", "theory": 78, "artwork": 80, "notes": "Tingkatkan ketepatan waktu pengumpulan link karya."},
    {"id": "student-6",  "name": "Aisyah Zahra",         "nis": "2024006", "class": "9A", "theory": 92, "artwork": 96, "notes": "Talenta luar biasa di bidang editing video dokumenter sekolah."},
    {"id": "student-7",  "name": "Budi Santoso",         "nis": "2024007", "class": "7C", "theory": 75, "artwork": 78, "notes": "Aktif bertanya saat sesi teori kamera."},
    {"id": "student-8",  "name": "Nabila Putri",         "nis": "2024008", "class": "7C", "theory": 88, "artwork": 90, "notes": "Fotografi makro bunga di halaman sekolah sangat tajam."},
    {"id": "student-9",  "name": "Dimas Anggara",        "nis": "2024009", "class": "8C", "theory": 80, "artwork": 82, "notes": "Konsisten hadir dan disiplin dalam perawatan lensa."},
    {"id": "student-10", "name": "Zahra Salsabila",      "nis": "2024010", "class": "8C", "theory": 86, "artwork": 89, "notes": "Paham betul teknik panning dan shutter speed."},
    {"id": "student-11", "name": "Rehan Pratama",        "nis": "2024011", "class": "9B", "theory": 79, "artwork": 81, "notes": "Karya videografi vlog kegiatan pramuka cukup menghibur."},
    {"id": "student-12", "name": "Safira Maharani",      "nis": "2024012", "class": "9B", "theory": 91, "artwork": 94, "notes": "Sangat teliti dalam color grading video pendek."},
    {"id": "student-13", "name": "Aditya Pratama",       "nis": "2024013", "class": "7A", "theory": 77, "artwork": 75, "notes": "Perlu bimbingan ekstra untuk pemahaman diafragma."},
    {"id": "student-14", "name": "Intan Permata",        "nis": "2024014", "class": "7A", "theory": 84, "artwork": 87, "notes": "Sudah mahir menggunakan stabilizer / gimbal."},
    {"id": "student-15", "name": "Yoga Saputra",         "nis": "2024015", "class": "8A", "theory": 83, "artwork": 85, "notes": "Kreatif mencari sudut pengambilan gambar yang unik."},
]

INITIAL_JOURNALS = [
    {"id": "journal-1", "date": "2026-01-24", "topic": "Teknik Pencahayaan 3-Point Lighting di Studio",
     "summary": "Mempelajari key light, fill light, dan back light untuk portrait tajam dan dramatis.",
     "attendance_summary": "Hadir: 14, Tidak Hadir: 0, Sakit: 1", "created_at": "2026-01-24T09:00:00+00:00"},
    {"id": "journal-2", "date": "2026-01-17", "topic": "Pengenalan Shutter Speed dan Aperture",
     "summary": "Praktik langsung membekukan gerakan air dan efek blur menggunakan mode manual DSLR.",
     "attendance_summary": "Hadir: 15, Tidak Hadir: 0, Sakit: 0", "created_at": "2026-01-17T09:00:00+00:00"},
    {"id": "journal-3", "date": "2026-01-10", "topic": "Dasar Pengoperasian Gimbal dan Stabilizer Video",
     "summary": "Latihan pergerakan kamera smooth (pan, tilt, tracking shot) untuk video sinematik.",
     "attendance_summary": "Hadir: 13, Tidak Hadir: 1, Sakit: 1", "created_at": "2026-01-10T09:00:00+00:00"},
]

INITIAL_ARTWORKS = [
    {"id": "artwork-1", "student_id": "student-1", "student_name": "Ahmad Zaki Al-Farizi",
     "title": "Siluet Senja di Lapangan SMP Musix",
     "description": "Mengambil momen senja di lapangan basket sekolah menggunakan teknik high shutter speed.",
     "url": "https://images.unsplash.com/photo-1513031300226-c8fb12de9ade",
     "status": "Approved", "created_at": "2026-01-20T09:00:00+00:00"},
    {"id": "artwork-2", "student_id": "student-2", "student_name": "Siti Nur Haliza",
     "title": "Profil Guru Teladan SMP Musix",
     "description": "Video dokumenter berdurasi 2 menit tentang dedikasi guru pengajar.",
     "url": "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea",
     "status": "Approved", "created_at": "2026-01-22T09:00:00+00:00"},
    {"id": "artwork-3", "student_id": "student-6", "student_name": "Aisyah Zahra",
     "title": "Kehidupan Lab Komputer Sekolah",
     "description": "Fotografi jurnalistik suasana siswa belajar editing video di lab.",
     "url": "https://images.unsplash.com/photo-1567531708788-4c44105d00ff",
     "status": "Approved", "created_at": "2026-01-25T09:00:00+00:00"},
]

INITIAL_FEEDBACK = [
    {"id": "feedback-1", "author": "Drs. H. M. Fauzi", "author_role": "waka", "target_role": "pembina",
     "text": "Mohon jurnal praktik luar ruangan ditingkatkan dokumentasinya untuk publikasi majalah sekolah.",
     "created_at": "2026-01-23T09:00:00+00:00"},
    {"id": "feedback-2", "author": "Ustadz Arifin, S.Pd", "author_role": "pembina", "target_role": "waka",
     "text": "Siap Ustadz, agenda minggu depan pengambilan video kegiatan Pondok Ramadhan / Pesantren Kilat.",
     "created_at": "2026-01-23T10:00:00+00:00"},
]

async def seed_users():
    accounts = [
        {"id": "user-pembina", "email": os.environ.get("DEMO_PEMBINA_EMAIL", "pembina@sixnema.id"), "password": os.environ.get("DEMO_PEMBINA_PASSWORD", "demo-pembina"), "name": "Ustadz Arifin, S.Pd", "title": "Pembina Ekskul Fotografi & Videografi", "role": "pembina"},
        {"id": "user-siswa",   "email": os.environ.get("DEMO_SISWA_EMAIL", "siswa@sixnema.id"),   "password": os.environ.get("DEMO_SISWA_PASSWORD", "demo-siswa"),   "name": "Ahmad Zaki Al-Farizi", "title": "Siswa Ekskul (Kelas 8A)", "role": "siswa", "student_id": "student-1"},
        {"id": "user-waka",    "email": os.environ.get("DEMO_WAKA_EMAIL", "waka@sixnema.id"),    "password": os.environ.get("DEMO_WAKA_PASSWORD", "demo-waka"),    "name": "Drs. H. M. Fauzi", "title": "Waka Kesiswaan SMP Muhammadiyah 6 Surabaya", "role": "waka"},
    ]
    for account in accounts:
        doc = {**account, "password_hash": bcrypt.hashpw(account.pop("password").encode(), bcrypt.gensalt()).decode()}
        await db.users.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)

async def seed_students():
    # Force-refresh canonical demo students so the app always ships with realistic grades.
    for s in INITIAL_STUDENTS:
        doc = {**s, "total": compute_total(s["theory"], s["artwork"])}
        await db.students.update_one({"id": s["id"]}, {"$set": doc}, upsert=True)

async def seed_grade_history():
    """Seed 3 monthly historical grade snapshots per student to demonstrate progression."""
    if await db.grade_snapshots.count_documents({}) > 0:
        return
    base_date = datetime(2025, 11, 15, tzinfo=timezone.utc)
    for s in INITIAL_STUDENTS:
        # Simulate a gentle upward trend leading into the current grade.
        for i, offset in enumerate([0, 30, 60]):
            theory = round(max(0.0, s["theory"] - (2 - i) * 4), 1)
            artwork = round(max(0.0, s["artwork"] - (2 - i) * 5), 1)
            snap = {
                "id": str(uuid.uuid4()),
                "student_id": s["id"],
                "theory": theory,
                "artwork": artwork,
                "total": compute_total(theory, artwork),
                "created_at": (base_date + timedelta(days=offset)).isoformat(),
            }
            await db.grade_snapshots.insert_one(snap)

async def seed_journals():
    for j in INITIAL_JOURNALS:
        await db.journals.update_one({"id": j["id"]}, {"$setOnInsert": j}, upsert=True)

async def seed_artworks():
    for a in INITIAL_ARTWORKS:
        await db.artworks.update_one({"id": a["id"]}, {"$setOnInsert": a}, upsert=True)

async def seed_feedback():
    for f in INITIAL_FEEDBACK:
        await db.feedback.update_one({"id": f["id"]}, {"$setOnInsert": f}, upsert=True)

# Seeding & index creation moved to seed.py (run once manually against Atlas).
# Kept here as importable helpers. serverless: no startup lifecycle guarantees.

# ---------- Auth ----------
@api.get("/health")
async def health():
    return {"status": "ok", "app": "sixnema"}

@api.post("/auth/login", response_model=UserOut)
async def login(payload: LoginInput, response: Response):
    user = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if not user or not bcrypt.checkpw(payload.password.encode(), user["password_hash"].encode()):
        raise HTTPException(401, "Email atau kata sandi salah")
    response.set_cookie("access_token", token_for(user), httponly=True, secure=True, samesite="none", max_age=28800)
    return public_user(user)

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"ok": True}

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

app.include_router(api)
app.add_middleware(CORSMiddleware, allow_origins=[FRONTEND_ORIGIN], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
