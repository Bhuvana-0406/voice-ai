import asyncio
import aiosqlite
from app.db.database import get_db
from app.api.routes import converse
from app.schemas.api import ConverseRequest

async def test_full_demo_conversation():
    session_id = "test-demo-session-001"
    
    async with aiosqlite.connect("./voicefilter.db") as db:
        db.row_factory = aiosqlite.Row

        print("=== CRITICAL DEMO FLOW TEST ===")
        
        # Turn 1: "Show me white sneakers."
        print("\n--- TURN 1: 'Show me white sneakers.' ---")
        res1 = await converse(ConverseRequest(session_id=session_id, utterance="Show me white sneakers."), db=db)
        print(f"Ack: {res1.acknowledgment.replace('₹', 'RS ')}")
        print(f"State: category={res1.search_state.category}, color={res1.search_state.color}, max_price={res1.search_state.max_price}, brand={res1.search_state.brand}")
        print(f"Chips: {[c.label.replace('₹', 'RS ') for c in res1.chips]}")
        print(f"Matching products: {res1.total_results}")
        assert res1.search_state.category == "sneakers"
        assert res1.search_state.color == "white"

        # Turn 2: "Under 1000."
        print("\n--- TURN 2: 'Under 1000.' ---")
        res2 = await converse(ConverseRequest(session_id=session_id, utterance="Under 1000."), db=db)
        print(f"Ack: {res2.acknowledgment.replace('₹', 'RS ')}")
        print(f"State: category={res2.search_state.category}, color={res2.search_state.color}, max_price={res2.search_state.max_price}, brand={res2.search_state.brand}")
        print(f"Chips: {[c.label.replace('₹', 'RS ') for c in res2.chips]}")
        print(f"Matching products: {res2.total_results}")
        assert res2.search_state.category == "sneakers"  # PRESERVED!
        assert res2.search_state.color == "white"        # PRESERVED!
        assert res2.search_state.max_price == 1000.0

        # Turn 3: "Only Asian, I already use that brand."
        print("\n--- TURN 3: 'Only Asian, I already use that brand.' ---")
        res3 = await converse(ConverseRequest(session_id=session_id, utterance="Only Asian, I already use that brand."), db=db)
        print(f"Ack: {res3.acknowledgment.replace('₹', 'RS ')}")
        print(f"State: category={res3.search_state.category}, color={res3.search_state.color}, max_price={res3.search_state.max_price}, brand={res3.search_state.brand}")
        print(f"Chips: {[c.label.replace('₹', 'RS ') for c in res3.chips]}")
        print(f"Matching products: {res3.total_results}")
        for p in res3.products:
            print(f"  - [{p.brand}] {p.name} | RS {p.price}")
        assert res3.search_state.category == "sneakers"  # PRESERVED!
        assert res3.search_state.color == "white"        # PRESERVED!
        assert res3.search_state.max_price == 1000.0     # PRESERVED!
        assert res3.search_state.brand == "Asian"

        # Turn 4: "Actually make it 1500."
        print("\n--- TURN 4: 'Actually make it 1500.' ---")
        res4 = await converse(ConverseRequest(session_id=session_id, utterance="Actually make it 1500."), db=db)
        print(f"Ack: {res4.acknowledgment.replace('₹', 'RS ')}")
        print(f"State: category={res4.search_state.category}, color={res4.search_state.color}, max_price={res4.search_state.max_price}, brand={res4.search_state.brand}")
        print(f"Chips: {[c.label.replace('₹', 'RS ') for c in res4.chips]}")
        print(f"Matching products: {res4.total_results}")
        for p in res4.products:
            print(f"  - [{p.brand}] {p.name} | RS {p.price}")
        assert res4.search_state.category == "sneakers"  # PRESERVED!
        assert res4.search_state.color == "white"        # PRESERVED!
        assert res4.search_state.brand == "Asian"        # PRESERVED!
        assert res4.search_state.max_price == 1500.0     # MODIFIED!

        # Turn 5: "Show me something more comfortable."
        print("\n--- TURN 5: 'Show me something more comfortable.' ---")
        res5 = await converse(ConverseRequest(session_id=session_id, utterance="Show me something more comfortable."), db=db)
        print(f"Ack: {res5.acknowledgment.replace('₹', 'RS ')}")
        print(f"State: category={res5.search_state.category}, color={res5.search_state.color}, max_price={res5.search_state.max_price}, brand={res5.search_state.brand}, semantic={res5.search_state.semantic_modifiers}")
        print(f"Chips: {[c.label.replace('₹', 'RS ').replace('✨', '*') for c in res5.chips]}")
        print(f"Matching products: {res5.total_results}")
        for p in res5.products:
            print(f"  - [{p.brand}] {p.name} | RS {p.price} | Tags: {p.tags}")
        assert res5.search_state.category == "sneakers"  # PRESERVED!
        assert res5.search_state.color == "white"        # PRESERVED!
        assert res5.search_state.brand == "Asian"        # PRESERVED!
        assert res5.search_state.max_price == 1500.0     # PRESERVED!
        assert "comfortable" in res5.search_state.semantic_modifiers

        print("\nDEMO CONVERSATION TEST PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_full_demo_conversation())
