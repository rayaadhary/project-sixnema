"""One-shot seeding for MongoDB Atlas.

Usage (from backend/):
    MONGO_URL=mongodb+srv://user:pass@cluster.../sixnema python seed.py

Loads env from a local .env if present, then seeds users/students/history/journals/
artworks/feedback and creates indexes. Idempotent-safe (upserts / guarded inserts).
"""
import asyncio
import os

from dotenv import load_dotenv

load_dotenv()

from server import (  # noqa: E402  (env must be set before importing server)
    db,
    seed_artworks,
    seed_feedback,
    seed_grade_history,
    seed_journals,
    seed_students,
    seed_users,
)


async def main() -> None:
    await db.users.create_index("email", unique=True)
    await db.grade_snapshots.create_index([("student_id", 1), ("created_at", 1)])
    await db.attendance.create_index("date")
    await seed_users()
    await seed_students()
    await seed_grade_history()
    await seed_journals()
    await seed_artworks()
    await seed_feedback()
    print(f"Seeded OK into DB '{os.environ.get('DB_NAME', 'sixnema')}' at {os.environ.get('MONGO_URL', 'localhost')[:40]}...")


if __name__ == "__main__":
    asyncio.run(main())
