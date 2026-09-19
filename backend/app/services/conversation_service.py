import json
import re
import google.generativeai as genai
from typing import List, Dict, Any, Optional

from app.config import settings
from app.schemas.search_state import SearchState
from app.schemas.delta import SearchStateDelta, IntentType
from app.prompts.intent_system import INTENT_SYSTEM_PROMPT

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class ConversationService:
    @staticmethod
    def _build_prompt(
        utterance: str,
        current_state: SearchState,
        history: List[Dict[str, str]],
        total_results: int
    ) -> str:
        history_str = ""
        for msg in history[-6:]:
            role = "User" if msg.get("role") == "user" else "Assistant"
            history_str += f"{role}: {msg.get('content', '')}\n"

        prompt = f"""
Current Search State:
{current_state.model_dump_json(indent=2)}

Matching Products Count: {total_results}

Recent Conversation History:
{history_str if history_str else "(No prior conversation)"}

User Utterance: "{utterance}"

Output ONLY a JSON object matching the SearchStateDelta schema. No markdown formatting, no code blocks, just raw JSON.
"""
        return prompt

    @classmethod
    async def extract_intent(
        cls,
        utterance: str,
        current_state: SearchState,
        history: List[Dict[str, str]],
        total_results: int = 0
    ) -> SearchStateDelta:
        # Fallback / Deterministic checks for RESET and UNDO operations
        utt_clean = utterance.lower().strip()
        
        reset_keywords = [
            "show me all", "show all", "show all products", "show everything",
            "clear all", "clear all filters", "clear filters", "remove all filters",
            "reset", "reset all", "reset filters", "start over", "start fresh",
            "cancel all filters", "all products", "return home", "go home", "go to home",
            "go to homepage", "go to landing page", "back to home", "homepage", "home"
        ]
        
        if any(kw in utt_clean for kw in reset_keywords) or re.match(r"^(reset|clear|all|start over|home|homepage)$", utt_clean):
            return SearchStateDelta(
                intent_type=IntentType.RESET,
                acknowledgment="Returned to Amazon homepage."
            )
            
        if re.match(r"^(undo|go back|previous)$", utt_clean):
            return SearchStateDelta(
                intent_type=IntentType.UNDO,
                acknowledgment="Reverting to previous search state."
            )

        if not settings.GEMINI_API_KEY:
            # Fallback heuristic parser if no API key is provided
            return cls._rule_based_fallback(utterance, current_state)

        prompt = cls._build_prompt(utterance, current_state, history, total_results)

        try:
            model = genai.GenerativeModel(
                model_name=settings.LLM_MODEL,
                system_instruction=INTENT_SYSTEM_PROMPT
            )
            response = await model.generate_content_async(
                prompt,
                generation_config={"temperature": 0.1}
            )
            text = response.text.strip()
            
            # Clean markdown JSON block formatting if present
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            delta_dict = json.loads(text)
            delta = SearchStateDelta.model_validate(delta_dict)
            return delta
        except Exception as e:
            print(f"Gemini API Error or parsing issue: {e}. Using rule-based fallback.")
            return cls._rule_based_fallback(utterance, current_state)

    @classmethod
    def _rule_based_fallback(cls, utterance: str, current_state: SearchState) -> SearchStateDelta:
        """Deterministic rule-based intent fallback to ensure 100% demo resilience."""
        utt = utterance.lower().strip()
        
        # Check relative price modification
        if "cheaper" in utt or "sasta" in utt or "lower price" in utt:
            curr_max = current_state.max_price or 1500.0
            new_max = max(500.0, curr_max * 0.75)
            return SearchStateDelta(
                intent_type=IntentType.REFINE,
                set_max_price=new_max,
                acknowledgment=f"Lowered maximum price to ₹{int(new_max)}."
            )
            
        # Check remove brand
        if "remove" in utt and ("brand" in utt or "asian" in utt or "nike" in utt):
            return SearchStateDelta(
                intent_type=IntentType.REMOVE,
                remove_fields=["brand"],
                acknowledgment="Removed brand restriction."
            )

        # Check remove price
        if "remove" in utt and ("price" in utt or "budget" in utt):
            return SearchStateDelta(
                intent_type=IntentType.REMOVE,
                remove_fields=["max_price", "min_price"],
                acknowledgment="Removed price limit."
            )

        # Extraction logic
        category = None
        subcategory = None
        if "watch" in utt or "watches" in utt or "timepiece" in utt:
            category = "watches"
            if "smartwatch" in utt or "smart watch" in utt:
                subcategory = "smartwatch"
            elif "analog" in utt:
                subcategory = "analog"
            elif "digital" in utt:
                subcategory = "digital"
            elif "chronograph" in utt:
                subcategory = "chronograph"
        elif "smartphone" in utt or "smartphones" in utt or "phone" in utt or "phones" in utt or "mobile" in utt or "mobiles" in utt:
            category = "smartphones"
        elif "laptop" in utt or "laptops" in utt:
            category = "laptops"
        elif "headphone" in utt or "headphones" in utt:
            category = "headphones"
        elif "earbud" in utt or "earbuds" in utt or "airpods" in utt:
            category = "earbuds"
        elif "backpack" in utt or "backpacks" in utt or "bag" in utt:
            category = "backpack"
        elif "sneaker" in utt or "sneakers" in utt:
            category = "sneakers"
        elif "running" in utt:
            category = "running_shoes"
        elif "formal" in utt:
            category = "formal_shoes"

        color = None
        for c in ["white", "black", "blue", "red", "grey", "brown", "gold", "silver", "green"]:
            if c in utt:
                color = c
                break

        brand = None
        brand_map = {
            "moto": "Motorola",
            "motorola": "Motorola",
            "samsung": "Samsung",
            "apple": "Apple",
            "oneplus": "OnePlus",
            "xiaomi": "Xiaomi",
            "redmi": "Redmi",
            "realme": "Realme",
            "iqoo": "iQOO",
            "vivo": "Vivo",
            "oppo": "Oppo",
            "sony": "Sony",
            "jbl": "JBL",
            "bose": "Bose",
            "boat": "boAt",
            "noise": "Noise",
            "asian": "Asian",
            "nike": "Nike",
            "adidas": "Adidas",
            "puma": "Puma",
            "campus": "Campus",
            "sparx": "Sparx",
            "bata": "Bata",
            "woodland": "Woodland",
            "titan": "Titan",
            "fastrack": "Fastrack",
            "casio": "Casio",
            "fossil": "Fossil",
            "timex": "Timex",
            "dell": "Dell",
            "lenovo": "Lenovo",
            "hp": "HP"
        }
        for b_key, b_name in brand_map.items():
            if b_key in utt:
                brand = b_name
                break

        # Enhanced Price Extraction
        price = None
        k_match = re.search(r'(\d+(?:\.\d+)?)\s*k\b', utt)
        if k_match:
            price = float(k_match.group(1)) * 1000.0
        else:
            price_match = re.search(r'(?:under|below|less than|max|budget|rs|inr|₹)?\s*₹?\s*(\d[\d,]*)(?:\s*(?:rupees|rs|inr|tak|ke andar))?', utt)
            if price_match:
                num_str = price_match.group(1).replace(",", "")
                try:
                    val = float(num_str)
                    if val >= 100:  # avoid shoe sizes like size 8
                        price = val
                except ValueError:
                    pass

        semantic = []
        for tag in ["comfortable", "lightweight", "stylish", "classy", "breathable", "durable", "soft"]:
            if tag in utt:
                semantic.append(tag)

        # Determine Intent: Default to REFINE if current state has active search context
        if category and current_state.category and category != current_state.category:
            intent = IntentType.NEW_SEARCH
        elif current_state.category or current_state.brand or current_state.color or current_state.max_price:
            intent = IntentType.REFINE
        else:
            intent = IntentType.NEW_SEARCH

        if price and not (brand or color or category or semantic):
            ack = f"Filtered to under ₹{int(price)}."
        else:
            ack_parts = []
            if brand: ack_parts.append(brand)
            if color: ack_parts.append(color)
            if category: ack_parts.append(category)
            if price: ack_parts.append(f"under ₹{int(price)}")
            if semantic: ack_parts.append(f"({', '.join(semantic)})")
            ack = "Showing " + " ".join(ack_parts) if ack_parts else "Updated search results."

        return SearchStateDelta(
            intent_type=intent,
            set_category=category,
            set_subcategory=subcategory,
            set_color=color,
            set_brand=brand,
            set_max_price=price,
            add_semantic=semantic,
            acknowledgment=ack
        )
