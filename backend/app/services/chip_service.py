from typing import List
from pydantic import BaseModel
from app.schemas.search_state import SearchState

class FilterChip(BaseModel):
    label: str
    field: str
    type: str  # "filter", "exclusion", "semantic"
    removable: bool = True

class ChipService:
    @staticmethod
    def generate_chips(state: SearchState) -> List[FilterChip]:
        chips: List[FilterChip] = []

        if state.category:
            cat_display = state.category.replace("_", " ").title()
            chips.append(FilterChip(label=cat_display, field="category", type="filter"))

        if state.subcategory:
            chips.append(FilterChip(label=state.subcategory.title(), field="subcategory", type="filter"))

        if state.brand:
            chips.append(FilterChip(label=state.brand, field="brand", type="filter"))

        if state.color:
            chips.append(FilterChip(label=state.color.capitalize(), field="color", type="filter"))

        if state.max_price is not None and state.min_price is not None:
            chips.append(FilterChip(label=f"₹{int(state.min_price)} - ₹{int(state.max_price)}", field="price", type="filter"))
        elif state.max_price is not None:
            chips.append(FilterChip(label=f"Under ₹{int(state.max_price)}", field="max_price", type="filter"))
        elif state.min_price is not None:
            chips.append(FilterChip(label=f"Above ₹{int(state.min_price)}", field="min_price", type="filter"))

        if state.min_rating:
            chips.append(FilterChip(label=f"★ {state.min_rating}+", field="min_rating", type="filter"))

        if state.material:
            chips.append(FilterChip(label=state.material.capitalize(), field="material", type="filter"))

        if state.gender and state.gender != "unisex":
            chips.append(FilterChip(label=state.gender.capitalize(), field="gender", type="filter"))

        if state.size:
            chips.append(FilterChip(label=f"Size {state.size}", field="size", type="filter"))

        # Exclusions
        for ex_b in state.exclude_brands:
            chips.append(FilterChip(label=f"Not {ex_b}", field=f"exclude_brand_{ex_b}", type="exclusion"))
        for ex_c in state.exclude_colors:
            chips.append(FilterChip(label=f"Not {ex_c.capitalize()}", field=f"exclude_color_{ex_c}", type="exclusion"))

        # Semantic modifiers
        for sem in state.semantic_modifiers:
            chips.append(FilterChip(label=f"✨ {sem.capitalize()}", field=f"semantic_{sem}", type="semantic"))

        return chips
