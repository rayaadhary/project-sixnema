from dotenv import load_dotenv
load_dotenv()

import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, Response
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
JWT_ALGORITHM = "HS256"

app = FastAPI(title="SIXNEMA API")
api = APIRouter(prefix="/api")

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

async def seed_users():
    accounts = [
        {"id": "user-pembina", "email": os.environ["DEMO_PEMBINA_EMAIL"], "password": os.environ["DEMO_PEMBINA_PASSWORD"], "name": "Ustadz Arifin, S.Pd", "title": "Pembina Ekskul Fotografi & Videografi", "role": "pembina"},
        {"id": "user-siswa", "email": os.environ["DEMO_SISWA_EMAIL"], "password": os.environ["DEMO_SISWA_PASSWORD"], "name": "Ahmad Zaki Al-Farizi", "title": "Siswa Ekskul (Kelas 8A)", "role": "siswa", "student_id": "student-1"},
        {"id": "user-waka", "email": os.environ["DEMO_WAKA_EMAIL"], "password": os.environ["DEMO_WAKA_PASSWORD"], "name": "Drs. H. M. Fauzi", "title": "Waka Kesiswaan SMP Muhammadiyah 6 Surabaya", "role": "waka"},
    ]
    for account in accounts:
        doc = {**account, "password_hash": bcrypt.hashpw(account.pop("password").encode(), bcrypt.gensalt()).decode()}
        await db.users.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_users()
    await db.students.update_one({"id": "student-1"}, {"$setOnInsert": {"id": "student-1", "name": "Ahmad Zaki Al-Farizi", "nis": "2024001", "class": "8A", "theory": 0, "artwork": 0, "notes": "Belum ada catatan."}}, upsert=True)

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

@api.get("/students")
async def list_students(user=Depends(current_user)):
    return await db.students.find({}, {"_id": 0}).sort("name", 1).to_list(500)

@api.post("/students")
async def create_student(payload: StudentInput, user=Depends(require_roles("pembina"))):
    student = {"id": str(uuid.uuid4()), **payload.model_dump(by_alias=True), "theory": 0, "artwork": 0, "notes": "Belum ada catatan."}
    await db.students.insert_one(student)
    student.pop("_id", None)
    return student

@api.patch("/students/{student_id}/grades")
async def update_grades(student_id: str, payload: GradeInput, user=Depends(require_roles("pembina"))):
    total = round(payload.theory * .4 + payload.artwork * .6, 1)
    await db.students.update_one({"id": student_id}, {"$set": {"theory": payload.theory, "artwork": payload.artwork, "total": total, "notes": payload.notes}}, upsert=True)
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student: raise HTTPException(404, "Siswa tidak ditemukan")
    return student

async def save_item(collection: str, data: Dict[str, Any]):
    data = {"id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat(), **data}
    await db[collection].insert_one(data)
    data.pop("_id", None)
    return data

@api.get("/journals")
async def journals(user=Depends(current_user)): return await db.journals.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)

@api.post("/journals")
async def create_journal(payload: JournalInput, user=Depends(require_roles("pembina"))): return await save_item("journals", payload.model_dump())

@api.get("/artworks")
async def artworks(user=Depends(current_user)):
    query = {"student_id": user.get("student_id")} if user["role"] == "siswa" else {}
    return await db.artworks.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)

@api.post("/artworks")
async def create_artwork(payload: ArtworkInput, user=Depends(require_roles("siswa"))):
    return await save_item("artworks", {**payload.model_dump(), "student_id": user["student_id"], "student_name": user["name"], "status": "Pending Review"})

@api.get("/feedback")
async def feedback(user=Depends(current_user)): return await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)

@api.post("/attendance")
async def create_attendance(payload: AttendanceInput, user=Depends(require_roles("pembina"))):
    return await save_item("attendance", payload.model_dump())

@api.post("/feedback")
async def create_feedback(payload: FeedbackInput, user=Depends(require_roles("waka", "pembina"))):
    return await save_item("feedback", {**payload.model_dump(), "author": user["name"], "author_role": user["role"]})

app.include_router(api)
app.add_middleware(CORSMiddleware, allow_origins=[os.environ["FRONTEND_ORIGIN"]], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("shutdown")
async def shutdown(): client.close()