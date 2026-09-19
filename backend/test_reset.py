import asyncio
import aiosqlite
from app.api.routes import converse
from app.schemas.api import ConverseRequest

async def test_reset():
    async with aiosqlite.connect("./voicefilter.db") as db:
        db.row_factory = aiosqlite.Row

        # Turn 1: Set filters
        res1 = await converse(ConverseRequest(session_id="test_reset_session", utterance="white sneakers under 1000"), db=db)
        print("Turn 1 - Active filters:", [c.label.replace('₹', 'RS ') for c in res1.chips], "| Total:", res1.total_results)

        # Turn 2: Clear all filters
        res2 = await converse(ConverseRequest(session_id="test_reset_session", utterance="clear all filters"), db=db)
        print("Turn 2 - Ack:", res2.acknowledgment)
        print("Turn 2 - Active filters:", [c.label for c in res2.chips], "| Total products:", res2.total_results)
        
        assert res2.search_state.category is None
        assert res2.search_state.max_price is None
        assert len(res2.chips) == 0
        assert res2.total_results == 98

        print("RESET COMMAND TEST PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_reset())
