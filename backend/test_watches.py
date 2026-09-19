import asyncio
import aiosqlite
from app.api.routes import converse
from app.schemas.api import ConverseRequest

async def test_watch_and_shoe_flow():
    async with aiosqlite.connect("./voicefilter.db") as db:
        db.row_factory = aiosqlite.Row

        print("=== WATCHES & FOOTWEAR MULTI-CATEGORY TEST ===")

        # Watch Flow
        print("\n--- WATCH FLOW ---")
        r1 = await converse(ConverseRequest(session_id="cat_test", utterance="Show me watches"), db=db)
        print("Turn 1 - Category:", r1.search_state.category, "| Matching watches:", r1.total_results)
        assert r1.search_state.category == "watches"

        r2 = await converse(ConverseRequest(session_id="cat_test", utterance="Titan analog in black leather under 2000"), db=db)
        print("Turn 2 - Brand:", r2.search_state.brand, "| Color:", r2.search_state.color, "| Subcategory:", r2.search_state.subcategory, "| Max Price:", r2.search_state.max_price)
        print("Turn 2 - Matching Titan watches:", r2.total_results)
        for p in r2.products:
            print(f"  - [{p.brand}] {p.name} | RS {p.price} | Material: {p.material}")

        # Switch to Footwear Flow
        print("\n--- SWITCH TO FOOTWEAR FLOW ---")
        r3 = await converse(ConverseRequest(session_id="cat_test", utterance="Show me white sneakers"), db=db)
        print("Turn 3 - Category:", r3.search_state.category, "| Color:", r3.search_state.color, "| Total sneakers:", r3.total_results)
        assert r3.search_state.category == "sneakers"
        assert r3.search_state.color == "white"

        r4 = await converse(ConverseRequest(session_id="cat_test", utterance="Under 1000"), db=db)
        print("Turn 4 - Active filters:", [c.label.replace('₹', 'RS ') for c in r4.chips], "| Total:", r4.total_results)
        assert r4.search_state.max_price == 1000.0

        print("\nMULTI-CATEGORY TEST PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_watch_and_shoe_flow())
