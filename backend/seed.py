"""One-shot seeding for MongoDB Atlas.

Usage (from backend/):
    MONGO_URL=mongodb+srv://user:pass@cluster.../sixnema python seed.py

Loads env from a local .env if present, then seeds users + flipbook.
Idempotent-safe (upserts / guarded inserts).
"""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from server import db, seed_users, FLIPBOOK_KEY, CHUNK_SIZE, now_iso  # noqa: E402

PDF_PATH = Path(__file__).resolve().parent.parent / "frontend" / "public" / "media" / "Sittah-edisi-13.pdf"


async def seed_flipbook() -> None:
    if not PDF_PATH.exists():
        print(f"[flipbook] PDF tidak ditemukan: {PDF_PATH}")
        return
    existing = await db.fs.files.find_one({"_id": FLIPBOOK_KEY})
    if existing:
        print("[flipbook] Sudah ada, skip.")
        return
    data = PDF_PATH.read_bytes()
    chunks = [data[i:i+CHUNK_SIZE] for i in range(0, len(data), CHUNK_SIZE)] or [b""]
    for idx, chunk in enumerate(chunks):
        await db.fs.chunks.insert_one({"files_id": FLIPBOOK_KEY, "n": idx, "data": chunk})
    await db.fs.files.insert_one({
        "_id": FLIPBOOK_KEY, "filename": PDF_PATH.name, "length": len(data),
        "chunkSize": CHUNK_SIZE, "uploadDate": now_iso(),
        "metadata": {"content_type": "application/pdf", "uploaded_by": "seed",
                     "original_name": PDF_PATH.name, "size": len(data)},
    })
    print(f"[flipbook] Seeded {PDF_PATH.name} ({len(data) / 1024:.0f}KB).")


async def main() -> None:
    await db.users.create_index("email", unique=True)
    await seed_users()
    await seed_flipbook()
    print(f"Seeded 3 demo users + flipbook into DB '{os.environ.get('DB_NAME', 'sixnema')}' at {os.environ.get('MONGO_URL', 'localhost')[:40]}...")


if __name__ == "__main__":
    asyncio.run(main())
