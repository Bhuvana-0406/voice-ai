from app.schemas.search_state import SearchState
from app.schemas.delta import SearchStateDelta, IntentType
from app.services.state_service import StateMergerService

def test_state_merger():
    history = []

    # Turn 1: "Show me white sneakers"
    state = SearchState()
    delta1 = SearchStateDelta(
        intent_type=IntentType.NEW_SEARCH,
        set_category="sneakers",
        set_color="white"
    )
    state, history = StateMergerService.merge(state, delta1, history)
    assert state.category == "sneakers"
    assert state.color == "white"
    assert len(history) == 1

    # Turn 2: "Under 1000"
    delta2 = SearchStateDelta(
        intent_type=IntentType.REFINE,
        set_max_price=1000.0
    )
    state, history = StateMergerService.merge(state, delta2, history)
    assert state.category == "sneakers"  # Preserved!
    assert state.color == "white"        # Preserved!
    assert state.max_price == 1000.0
    assert len(history) == 2

    # Turn 3: "Only Asian"
    delta3 = SearchStateDelta(
        intent_type=IntentType.REFINE,
        set_brand="Asian"
    )
    state, history = StateMergerService.merge(state, delta3, history)
    assert state.category == "sneakers"  # Preserved!
    assert state.color == "white"        # Preserved!
    assert state.max_price == 1000.0     # Preserved!
    assert state.brand == "Asian"
    assert len(history) == 3

    # Turn 4: "Actually make it 1500"
    delta4 = SearchStateDelta(
        intent_type=IntentType.REFINE,
        set_max_price=1500.0
    )
    state, history = StateMergerService.merge(state, delta4, history)
    assert state.category == "sneakers"  # Preserved!
    assert state.color == "white"        # Preserved!
    assert state.brand == "Asian"        # Preserved!
    assert state.max_price == 1500.0     # Overwritten!
    assert len(history) == 4

    # Turn 5: "Remove brand"
    delta5 = SearchStateDelta(
        intent_type=IntentType.REMOVE,
        remove_fields=["brand"]
    )
    state, history = StateMergerService.merge(state, delta5, history)
    assert state.brand is None           # Removed!
    assert state.category == "sneakers"  # Preserved!
    assert state.max_price == 1500.0     # Preserved!

    # Turn 6: "Not black"
    delta6 = SearchStateDelta(
        intent_type=IntentType.NEGATE,
        add_exclude_colors=["black"]
    )
    state, history = StateMergerService.merge(state, delta6, history)
    assert "black" in state.exclude_colors

    # Turn 7: "Undo"
    state, history = StateMergerService.merge(state, SearchStateDelta(intent_type=IntentType.UNDO), history)
    assert "black" not in state.exclude_colors  # Reverted!

    print("ALL STATE MERGER TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_state_merger()
