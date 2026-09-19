import json
import aiosqlite
from typing import List, Tuple
from app.schemas.search_state import SearchState
from app.schemas.product import Product

class SearchService:
    @staticmethod
    async def search(db: aiosqlite.Connection, state: SearchState) -> Tuple[List[Product], int]:
        conditions = ["in_stock = 1"]
        params = []

        if state.category:
            conditions.append("category = ?")
            params.append(state.category.lower())

        if state.subcategory:
            conditions.append("subcategory = ?")
            params.append(state.subcategory.lower())

        if state.brand:
            conditions.append("LOWER(brand) = LOWER(?)")
            params.append(state.brand)

        if state.color:
            conditions.append("EXISTS (SELECT 1 FROM json_each(colors) WHERE LOWER(value) = LOWER(?))")
            params.append(state.color.lower())

        if state.min_price is not None:
            conditions.append("price >= ?")
            params.append(state.min_price)

        if state.max_price is not None:
            conditions.append("price <= ?")
            params.append(state.max_price)

        if state.min_rating is not None:
            conditions.append("rating >= ?")
            params.append(state.min_rating)

        if state.material:
            conditions.append("LOWER(material) = LOWER(?)")
            params.append(state.material.lower())

        if state.gender:
            conditions.append("(LOWER(gender) = LOWER(?) OR gender = 'unisex')")
            params.append(state.gender.lower())

        if state.size:
            conditions.append("EXISTS (SELECT 1 FROM json_each(sizes) WHERE value = ?)")
            params.append(state.size)

        if state.query:
            term = f"%{state.query.lower()}%"
            conditions.append("(LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(brand) LIKE ?)")
            params.extend([term, term, term])

        # Exclusions (NEGATE)
        for brand in state.exclude_brands:
            conditions.append("LOWER(brand) != LOWER(?)")
            params.append(brand)

        for color in state.exclude_colors:
            conditions.append("NOT EXISTS (SELECT 1 FROM json_each(colors) WHERE LOWER(value) = LOWER(?))")
            params.append(color.lower())

        for mat in state.exclude_materials:
            conditions.append("LOWER(material) != LOWER(?)")
            params.append(mat.lower())

        where_clause = " AND ".join(conditions)

        # Count total matching candidates
        count_sql = f"SELECT COUNT(*) FROM products WHERE {where_clause}"
        async with db.execute(count_sql, params) as cursor:
            row = await cursor.fetchone()
            total = row[0] if row else 0

        # Primary order logic based on sort_by
        sort_column = {
            "price_asc": "price ASC",
            "price_desc": "price DESC",
            "rating": "rating DESC",
            "popularity": "review_count DESC",
            "relevance": "rating DESC, review_count DESC"
        }.get(state.sort_by, "rating DESC, review_count DESC")

        fetch_sql = f"SELECT * FROM products WHERE {where_clause} ORDER BY {sort_column} LIMIT 50"
        
        products = []
        async with db.execute(fetch_sql, params) as cursor:
            rows = await cursor.fetchall()
            for r in rows:
                products.append(Product(
                    id=r["id"],
                    name=r["name"],
                    description=r["description"],
                    category=r["category"],
                    subcategory=r["subcategory"],
                    brand=r["brand"],
                    price=r["price"],
                    rating=r["rating"],
                    review_count=r["review_count"],
                    colors=json.loads(r["colors"]),
                    sizes=json.loads(r["sizes"]),
                    material=r["material"],
                    gender=r["gender"],
                    tags=json.loads(r["tags"]),
                    image_url=r["image_url"],
                    in_stock=bool(r["in_stock"])
                ))

        # Semantic Re-ranking: Hard constraints are NEVER violated.
        # Products that satisfy hard filters are re-ranked based on tag match score.
        if state.semantic_modifiers and products:
            def calculate_semantic_score(p: Product) -> float:
                score = 0.0
                tags_set = set(t.lower() for t in p.tags)
                text_desc = f"{p.name} {p.description}".lower()

                for mod in state.semantic_modifiers:
                    mod_lower = mod.lower()
                    if mod_lower in tags_set:
                        score += 2.0
                    elif mod_lower in text_desc:
                        score += 1.0
                return score

            products.sort(key=lambda p: (calculate_semantic_score(p), p.rating), reverse=True)

        return products, total
