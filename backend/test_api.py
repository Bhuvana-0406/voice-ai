import asyncio
import aiosqlite
from app.db.database import get_db
from app.api.routes import get_products

async def test_api():
    async with aiosqlite.connect("./voicefilter.db") as db:
        db.row_factory = aiosqlite.Row
        res = await get_products(category="sneakers", color="white", max_price=1000.0, db=db)
        print(f"=== TEST RESULT ===")
        print(f"Total matching white sneakers under RS 1000: {res.total}")
        for p in res.products:
            print(f"- [{p.brand}] {p.name} | RS {p.price} | Tags: {p.tags}")

if __name__ == "__main__":
    asyncio.run(test_api())
