"""One-shot seeding for MongoDB Atlas.

Usage (from backend/):
    MONGO_URL=mongodb+srv://user:pass@cluster.../sixnema python seed.py

Loads env from a local .env if present, then seeds users/students/history/journals/
artworks/feedback and creates indexes. Idempotent-safe (upserts / guarded inserts).
"""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from server import db, seed_users  # noqa: E402  (env must be set before importing server)

FLIPBOOK_KEY = "flipbook-active"
PDF_PATH = Path(__file__).resolve().parent.parent / "frontend" / "public" / "media" / "Sittah-edisi-13.pdf"


async def seed_flipbook() -> None:
    if not PDF_PATH.exists():
        print(f"[flipbook] PDF tidak ditemukan: {PDF_PATH}")
        return
    from gridfs import AsyncIOMotorGridFSBucket
    bucket = AsyncIOMotorGridFSBucket(db)
    old = await bucket.find({"filename": FLIPBOOK_KEY}).to_list(10)
    if old:
        print(f"[flipbook] Sudah ada {len(old)} file, skip.")
        return
    data = PDF_PATH.read_bytes()
    await bucket.upload_from_stream(
        FLIPBOOK_KEY, iter([data]),
        metadata={"content_type": "application/pdf", "uploaded_by": "seed",
                  "original_name": PDF_PATH.name, "size": len(data)},
    )
    print(f"[flipbook] Seeded {PDF_PATH.name} ({len(data) / 1024:.0f}KB) ke GridFS.")


async def main() -> None:
    await db.users.create_index("email", unique=True)
    await seed_users()
    await seed_flipbook()
    print(f"Seeded 3 demo users + flipbook into DB '{os.environ.get('DB_NAME', 'sixnema')}' at {os.environ.get('MONGO_URL', 'localhost')[:40]}...")


if __name__ == "__main__":
    asyncio.run(main())
