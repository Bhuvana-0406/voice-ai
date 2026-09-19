import aiosqlite
import os
import json
from app.config import settings

async def get_db():
    db = await aiosqlite.connect(settings.DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()

async def init_db():
    os.makedirs(os.path.dirname(settings.DATABASE_PATH) or ".", exist_ok=True)
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                subcategory TEXT,
                brand TEXT NOT NULL,
                price REAL NOT NULL,
                rating REAL DEFAULT 4.0,
                review_count INTEGER DEFAULT 0,
                colors TEXT NOT NULL,       -- JSON array
                sizes TEXT NOT NULL,        -- JSON array
                material TEXT,
                gender TEXT DEFAULT 'unisex',
                tags TEXT NOT NULL,         -- JSON array
                image_url TEXT NOT NULL,
                in_stock INTEGER DEFAULT 1
            )
        """)
        await db.commit()
