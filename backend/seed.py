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

from server import db, seed_users  # noqa: E402  (env must be set before importing server)


async def main() -> None:
    await db.users.create_index("email", unique=True)
    await seed_users()
    print(f"Seeded 3 demo users into DB '{os.environ.get('DB_NAME', 'sixnema')}' at {os.environ.get('MONGO_URL', 'localhost')[:40]}...")


if __name__ == "__main__":
    asyncio.run(main())
