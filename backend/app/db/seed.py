import asyncio
import json
import os
import aiosqlite
from app.config import settings
from app.db.database import init_db

async def seed_database():
    await init_db()
    
    possible_paths = [
        os.path.abspath("data/products.json"),
        os.path.abspath("../data/products.json"),
        os.path.abspath("backend/data/products.json"),
        os.path.join(os.path.dirname(__file__), "../../../data/products.json")
    ]
    
    json_path = None
    for p in possible_paths:
        if os.path.exists(p):
            json_path = p
            break
            
    if not json_path:
        print(f"Error: Could not locate data/products.json. Checked: {possible_paths}")
        return


    with open(json_path, "r") as f:
        products = json.load(f)

    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        # Clear existing
        await db.execute("DELETE FROM products")
        
        for p in products:
            await db.execute("""
                INSERT INTO products (
                    id, name, description, category, subcategory, brand,
                    price, rating, review_count, colors, sizes, material,
                    gender, tags, image_url, in_stock
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"],
                p["name"],
                p["description"],
                p["category"],
                p.get("subcategory"),
                p["brand"],
                p["price"],
                p.get("rating", 4.0),
                p.get("review_count", 0),
                json.dumps(p["colors"]),
                json.dumps(p["sizes"]),
                p.get("material"),
                p.get("gender", "unisex"),
                json.dumps(p["tags"]),
                p["image_url"],
                1 if p.get("in_stock", True) else 0
            ))
        await db.commit()
        
    print(f"Successfully seeded {len(products)} products into SQLite database at {settings.DATABASE_PATH}")

if __name__ == "__main__":
    asyncio.run(seed_database())
