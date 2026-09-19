from typing import List, Tuple
from app.schemas.search_state import SearchState
from app.schemas.delta import SearchStateDelta, IntentType

class StateMergerService:
    @staticmethod
    def merge(
        current_state: SearchState,
        delta: SearchStateDelta,
        history_stack: List[SearchState]
    ) -> Tuple[SearchState, List[SearchState]]:
        """
        Applies a SearchStateDelta to current_state based on intent_type.
        Returns (new_state, updated_history_stack).
        """
        # Intent: RESET -> Clear all filters
        if delta.intent_type == IntentType.RESET:
            history_stack.append(current_state.model_copy(deep=True))
            return SearchState(), history_stack

        # Intent: UNDO -> Revert to previous state in history
        if delta.intent_type == IntentType.UNDO:
            if history_stack:
                previous_state = history_stack.pop()
                return previous_state, history_stack
            return current_state, history_stack

        # Intent: CLARIFY -> Do not alter search state
        if delta.intent_type == IntentType.CLARIFY:
            return current_state, history_stack

        # Save current state for potential future UNDO
        new_history = history_stack + [current_state.model_copy(deep=True)]

        # Intent: NEW_SEARCH -> Start from clean slate ONLY if changing product category
        if delta.intent_type == IntentType.NEW_SEARCH:
            if delta.set_category and current_state.category and delta.set_category.lower() != current_state.category.lower():
                new_state = SearchState()
            elif current_state.category and not delta.set_category:
                # Active category exists and no new category specified -> Refine existing search!
                new_state = current_state.model_copy(deep=True)
            else:
                new_state = SearchState()
        else:
            new_state = current_state.model_copy(deep=True)

        # Apply scalar filter updates (set_*)
        settable_fields = [
            ("query", delta.set_query),
            ("category", delta.set_category),
            ("subcategory", delta.set_subcategory),
            ("brand", delta.set_brand),
            ("color", delta.set_color),
            ("min_price", delta.set_min_price),
            ("max_price", delta.set_max_price),
            ("min_rating", delta.set_min_rating),
            ("size", delta.set_size),
            ("material", delta.set_material),
            ("gender", delta.set_gender),
            ("sort_by", delta.set_sort_by),
        ]

        for field_name, value in settable_fields:
            if value is not None:
                setattr(new_state, field_name, value)

        # Apply field removals (remove_fields)
        for field_name in delta.remove_fields:
            normalized_name = field_name.lower().replace("-", "_")
            if hasattr(new_state, normalized_name):
                setattr(new_state, normalized_name, None)
            elif normalized_name == "price" or normalized_name == "budget":
                new_state.min_price = None
                new_state.max_price = None

        # Apply exclusions (negations)
        if delta.add_exclude_brands:
            new_state.exclude_brands = list(dict.fromkeys(new_state.exclude_brands + [b.capitalize() for b in delta.add_exclude_brands]))
        if delta.remove_exclude_brands:
            rem_b = [b.lower() for b in delta.remove_exclude_brands]
            new_state.exclude_brands = [b for b in new_state.exclude_brands if b.lower() not in rem_b]

        if delta.add_exclude_colors:
            new_state.exclude_colors = list(dict.fromkeys(new_state.exclude_colors + [c.lower() for c in delta.add_exclude_colors]))
        if delta.remove_exclude_colors:
            rem_c = [c.lower() for c in delta.remove_exclude_colors]
            new_state.exclude_colors = [c for c in new_state.exclude_colors if c.lower() not in rem_c]

        if delta.add_exclude_materials:
            new_state.exclude_materials = list(dict.fromkeys(new_state.exclude_materials + [m.lower() for m in delta.add_exclude_materials]))
        if delta.remove_exclude_materials:
            rem_m = [m.lower() for m in delta.remove_exclude_materials]
            new_state.exclude_materials = [m for m in new_state.exclude_materials if m.lower() not in rem_m]

        # Apply semantic modifiers
        if delta.add_semantic:
            new_state.semantic_modifiers = list(dict.fromkeys(new_state.semantic_modifiers + [s.lower() for s in delta.add_semantic]))
        if delta.remove_semantic:
            rem_s = [s.lower() for s in delta.remove_semantic]
            new_state.semantic_modifiers = [s for s in new_state.semantic_modifiers if s.lower() not in rem_s]

        # Guardrail: If min_price > max_price, clear min_price
        if new_state.min_price is not None and new_state.max_price is not None:
            if new_state.min_price > new_state.max_price:
                new_state.min_price = None

        return new_state, new_history
