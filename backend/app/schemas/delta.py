from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Optional

class IntentType(str, Enum):
    NEW_SEARCH = "NEW_SEARCH"
    REFINE = "REFINE"
    REMOVE = "REMOVE"
    NEGATE = "NEGATE"
    UNDO = "UNDO"
    RESET = "RESET"
    CLARIFY = "CLARIFY"

class SearchStateDelta(BaseModel):
    intent_type: IntentType

    set_query: Optional[str] = None
    set_category: Optional[str] = None
    set_subcategory: Optional[str] = None
    set_brand: Optional[str] = None
    set_color: Optional[str] = None
    set_min_price: Optional[float] = None
    set_max_price: Optional[float] = None
    set_min_rating: Optional[float] = None
    set_size: Optional[str] = None
    set_material: Optional[str] = None
    set_gender: Optional[str] = None
    set_sort_by: Optional[str] = None

    remove_fields: List[str] = Field(default_factory=list)

    add_exclude_brands: List[str] = Field(default_factory=list)
    add_exclude_colors: List[str] = Field(default_factory=list)
    add_exclude_materials: List[str] = Field(default_factory=list)

    remove_exclude_brands: List[str] = Field(default_factory=list)
    remove_exclude_colors: List[str] = Field(default_factory=list)
    remove_exclude_materials: List[str] = Field(default_factory=list)

    add_semantic: List[str] = Field(default_factory=list)
    remove_semantic: List[str] = Field(default_factory=list)

    clarification_question: Optional[str] = None
    acknowledgment: str = ""
