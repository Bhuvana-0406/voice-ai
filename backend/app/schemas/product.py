from pydantic import BaseModel, Field
from typing import List, Optional

class Product(BaseModel):
    id: str
    name: str
    description: str
    category: str
    subcategory: Optional[str] = None
    brand: str
    price: float
    rating: float = 4.0
    review_count: int = 0
    colors: List[str]
    sizes: List[str]
    material: Optional[str] = None
    gender: Optional[str] = "unisex"
    tags: List[str]
    image_url: str
    in_stock: bool = True

class ProductListResponse(BaseModel):
    products: List[Product]
    total: int
