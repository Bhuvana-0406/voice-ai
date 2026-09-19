import asyncio
import aiosqlite
from app.api.routes import converse
from app.schemas.api import ConverseRequest

async def test_home_navigation():
    async with aiosqlite.connect("./voicefilter.db") as db:
        db.row_factory = aiosqlite.Row

        # Turn 1: Filter
        r1 = await converse(ConverseRequest(session_id="home_test", utterance="white sneakers under 1000"), db=db)
        print("Turn 1 - Category:", r1.search_state.category, "| Max price:", r1.search_state.max_price)
        assert r1.search_state.category == "sneakers"

        # Turn 2: Return home
        r2 = await converse(ConverseRequest(session_id="home_test", utterance="return home"), db=db)
        print("Turn 2 - Ack:", r2.acknowledgment)
        print("Turn 2 - Category:", r2.search_state.category, "| Active chips:", len(r2.chips))
        
        assert r2.search_state.category is None
        assert len(r2.chips) == 0

        print("RETURN HOME TEST PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_home_navigation())
