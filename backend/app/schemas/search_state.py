from pydantic import BaseModel, Field
from typing import List, Optional

class SearchState(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    color: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    size: Optional[str] = None
    material: Optional[str] = None
    gender: Optional[str] = None

    exclude_brands: List[str] = Field(default_factory=list)
    exclude_colors: List[str] = Field(default_factory=list)
    exclude_materials: List[str] = Field(default_factory=list)

    semantic_modifiers: List[str] = Field(default_factory=list)

    sort_by: str = "relevance"
