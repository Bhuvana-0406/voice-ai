from typing import Dict, List, Optional
from app.schemas.search_state import SearchState
from app.schemas.product import Product

class ShoppingSession:
    def __init__(self, session_id: str):
        self.session_id: str = session_id
        self.search_state: SearchState = SearchState()
        self.state_history: List[SearchState] = []
        self.conversation_history: List[Dict[str, str]] = []
        self.last_products: List[Product] = []
        self.last_result_count: int = 0

    def add_message(self, role: str, content: str):
        self.conversation_history.append({"role": role, "content": content})
        if len(self.conversation_history) > 16:
            self.conversation_history = self.conversation_history[-16:]

class SessionService:
    _sessions: Dict[str, ShoppingSession] = {}

    @classmethod
    def get_or_create(cls, session_id: str) -> ShoppingSession:
        if session_id not in cls._sessions:
            cls._sessions[session_id] = ShoppingSession(session_id)
        return cls._sessions[session_id]

    @classmethod
    def clear_session(cls, session_id: str) -> ShoppingSession:
        cls._sessions[session_id] = ShoppingSession(session_id)
        return cls._sessions[session_id]
