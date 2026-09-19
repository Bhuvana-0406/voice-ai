from pydantic import BaseModel
from typing import List, Optional
from app.schemas.product import Product
from app.schemas.search_state import SearchState
from app.services.chip_service import FilterChip

class ConverseRequest(BaseModel):
    session_id: str
    utterance: str

class ConverseResponse(BaseModel):
    session_id: str
    search_state: SearchState
    products: List[Product]
    total_results: int
    chips: List[FilterChip]
    acknowledgment: str
    clarification: Optional[str] = None

class SessionActionRequest(BaseModel):
    session_id: str

class RemoveFilterRequest(BaseModel):
    session_id: str
    field: str
