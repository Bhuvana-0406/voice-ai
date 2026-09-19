import json
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
import aiosqlite

from app.config import settings
from app.db.database import get_db
from app.schemas.product import Product, ProductListResponse
from app.schemas.api import ConverseRequest, ConverseResponse, SessionActionRequest, RemoveFilterRequest
from app.schemas.delta import IntentType
from app.services.session_service import SessionService
from app.services.conversation_service import ConversationService
from app.services.state_service import StateMergerService
from app.services.search_service import SearchService
from app.services.chip_service import ChipService

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@router.get("/products", response_model=ProductListResponse)
async def get_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    color: Optional[str] = None,
    max_price: Optional[float] = None,
    min_price: Optional[float] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: aiosqlite.Connection = Depends(get_db)
):
    conditions = ["in_stock = 1"]
    params = []

    if category:
        conditions.append("category = ?")
        params.append(category.lower())

    if brand:
        conditions.append("LOWER(brand) = LOWER(?)")
        params.append(brand)

    if color:
        conditions.append("EXISTS (SELECT 1 FROM json_each(colors) WHERE LOWER(value) = LOWER(?))")
        params.append(color.lower())

    if max_price is not None:
        conditions.append("price <= ?")
        params.append(max_price)

    if min_price is not None:
        conditions.append("price >= ?")
        params.append(min_price)

    if search:
        conditions.append("(LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(brand) LIKE LOWER(?))")
        term = f"%{search}%"
        params.extend([term, term, term])

    where_clause = " AND ".join(conditions)

    count_sql = f"SELECT COUNT(*) FROM products WHERE {where_clause}"
    async with db.execute(count_sql, params) as cursor:
        row = await cursor.fetchone()
        total = row[0] if row else 0

    query_sql = f"SELECT * FROM products WHERE {where_clause} ORDER BY rating DESC, review_count DESC LIMIT ? OFFSET ?"
    query_params = params + [limit, offset]

    products = []
    async with db.execute(query_sql, query_params) as cursor:
        rows = await cursor.fetchall()
        for row in rows:
            products.append(Product(
                id=row["id"],
                name=row["name"],
                description=row["description"],
                category=row["category"],
                subcategory=row["subcategory"],
                brand=row["brand"],
                price=row["price"],
                rating=row["rating"],
                review_count=row["review_count"],
                colors=json.loads(row["colors"]),
                sizes=json.loads(row["sizes"]),
                material=row["material"],
                gender=row["gender"],
                tags=json.loads(row["tags"]),
                image_url=row["image_url"],
                in_stock=bool(row["in_stock"])
            ))

    return ProductListResponse(products=products, total=total)

@router.get("/products/{product_id}", response_model=Product)
async def get_product_by_id(product_id: str, db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("SELECT * FROM products WHERE id = ?", (product_id,)) as cursor:
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return Product(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            category=row["category"],
            subcategory=row["subcategory"],
            brand=row["brand"],
            price=row["price"],
            rating=row["rating"],
            review_count=row["review_count"],
            colors=json.loads(row["colors"]),
            sizes=json.loads(row["sizes"]),
            material=row["material"],
            gender=row["gender"],
            tags=json.loads(row["tags"]),
            image_url=row["image_url"],
            in_stock=bool(row["in_stock"])
        )

@router.post("/converse", response_model=ConverseResponse)
async def converse(request: ConverseRequest, db: aiosqlite.Connection = Depends(get_db)):
    session = SessionService.get_or_create(request.session_id)
    
    # 1. Extract Intent Delta using ConversationService
    delta = await ConversationService.extract_intent(
        utterance=request.utterance,
        current_state=session.search_state,
        history=session.conversation_history,
        total_results=session.last_result_count
    )

    # Handle Clarification
    if delta.intent_type == IntentType.CLARIFY:
        session.add_message("user", request.utterance)
        session.add_message("assistant", delta.clarification_question or "Could you clarify?")
        return ConverseResponse(
            session_id=request.session_id,
            search_state=session.search_state,
            products=session.last_products,
            total_results=session.last_result_count,
            chips=ChipService.generate_chips(session.search_state),
            acknowledgment=delta.acknowledgment or "I need a bit more detail.",
            clarification=delta.clarification_question
        )

    # 2. Merge State Delta
    new_state, new_history = StateMergerService.merge(
        current_state=session.search_state,
        delta=delta,
        history_stack=session.state_history
    )
    session.search_state = new_state
    session.state_history = new_history

    # 3. Execute Search
    products, total = await SearchService.search(db, new_state)
    session.last_products = products
    session.last_result_count = total

    # 4. Record Conversation History
    session.add_message("user", request.utterance)
    session.add_message("assistant", delta.acknowledgment)

    # 5. Generate Chips
    chips = ChipService.generate_chips(new_state)

    ack = delta.acknowledgment
    if total == 0:
        ack += " No products match all these constraints. Try adjusting the price or brand filter."

    return ConverseResponse(
        session_id=request.session_id,
        search_state=new_state,
        products=products,
        total_results=total,
        chips=chips,
        acknowledgment=ack,
        clarification=None
    )

@router.post("/converse/remove-filter", response_model=ConverseResponse)
async def remove_filter(request: RemoveFilterRequest, db: aiosqlite.Connection = Depends(get_db)):
    session = SessionService.get_or_create(request.session_id)
    field = request.field.strip()
    
    # Push current state to undo history
    session.state_history.append(session.search_state.model_copy(deep=True))
    state = session.search_state

    removed_label = field

    if field.startswith("semantic_"):
        sem_val = field.replace("semantic_", "").lower()
        state.semantic_modifiers = [s for s in state.semantic_modifiers if s.lower() != sem_val]
        removed_label = f"'{sem_val}' modifier"
    elif field.startswith("exclude_brand_"):
        ex_b = field.replace("exclude_brand_", "").lower()
        state.exclude_brands = [b for b in state.exclude_brands if b.lower() != ex_b]
        removed_label = f"brand exclusion for '{ex_b}'"
    elif field.startswith("exclude_color_"):
        ex_c = field.replace("exclude_color_", "").lower()
        state.exclude_colors = [c for c in state.exclude_colors if c.lower() != ex_c]
        removed_label = f"color exclusion for '{ex_c}'"
    elif field.startswith("exclude_material_"):
        ex_m = field.replace("exclude_material_", "").lower()
        state.exclude_materials = [m for m in state.exclude_materials if m.lower() != ex_m]
        removed_label = f"material exclusion for '{ex_m}'"
    elif field in ["price", "budget"]:
        state.min_price = None
        state.max_price = None
        removed_label = "price limit"
    elif hasattr(state, field):
        setattr(state, field, None)
        removed_label = f"{field} filter"

    session.search_state = state
    products, total = await SearchService.search(db, state)
    session.last_products = products
    session.last_result_count = total

    chips = ChipService.generate_chips(state)
    ack = f"Removed {removed_label}."

    return ConverseResponse(
        session_id=request.session_id,
        search_state=state,
        products=products,
        total_results=total,
        chips=chips,
        acknowledgment=ack,
        clarification=None
    )

@router.post("/converse/undo", response_model=ConverseResponse)
async def undo(request: SessionActionRequest, db: aiosqlite.Connection = Depends(get_db)):
    session = SessionService.get_or_create(request.session_id)
    if not session.state_history:
        return ConverseResponse(
            session_id=request.session_id,
            search_state=session.search_state,
            products=session.last_products,
            total_results=session.last_result_count,
            chips=ChipService.generate_chips(session.search_state),
            acknowledgment="Nothing to undo.",
            clarification=None
        )

    previous_state = session.state_history.pop()
    session.search_state = previous_state
    
    products, total = await SearchService.search(db, previous_state)
    session.last_products = products
    session.last_result_count = total

    chips = ChipService.generate_chips(previous_state)
    return ConverseResponse(
        session_id=request.session_id,
        search_state=previous_state,
        products=products,
        total_results=total,
        chips=chips,
        acknowledgment="Reverted to previous search state.",
        clarification=None
    )

@router.post("/converse/reset", response_model=ConverseResponse)
async def reset(request: SessionActionRequest, db: aiosqlite.Connection = Depends(get_db)):
    session = SessionService.clear_session(request.session_id)
    products, total = await SearchService.search(db, session.search_state)
    session.last_products = products
    session.last_result_count = total

    return ConverseResponse(
        session_id=request.session_id,
        search_state=session.search_state,
        products=products,
        total_results=total,
        chips=[],
        acknowledgment="Cleared search filters.",
        clarification=None
    )
