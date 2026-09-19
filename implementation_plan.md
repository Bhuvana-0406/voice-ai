# VoiceFilter — Implementation Plan

> **Document Version:** 1.0
> **Date:** August 8, 2026
> **Status:** Draft — Awaiting Approval
> **Companion:** [VoiceFilter PRD](file:///C:/Users/Karthikeya%20Dusi/.gemini/antigravity-ide/brain/a200bc86-b6a1-4f3b-a4d6-6d438f6ab0dc/prd_voicefilter.md)

---

## Table of Contents

- [§1 Architecture Overview](#1-architecture-overview)
- [§2 Technology Stack](#2-technology-stack)
- [§3 MVP Scope & Cut List](#3-mvp-scope--cut-list)
- [§4 Data Models](#4-data-models)
- [§5 LLM Contract](#5-llm-contract)
- [§6 Conversation State Machine](#6-conversation-state-machine)
- [§7 Search Engine Design](#7-search-engine-design)
- [§8 Semantic Search](#8-semantic-search)
- [§9 Voice Interaction Design](#9-voice-interaction-design)
- [§10 Frontend Architecture](#10-frontend-architecture)
- [§11 Backend Architecture](#11-backend-architecture)
- [§12 API Specification](#12-api-specification)
- [§13 State Location Decision](#13-state-location-decision)
- [§14 Product Dataset](#14-product-dataset)
- [§15 Amazon & SAVAAN Analysis](#15-amazon--savaan-analysis)
- [§16 Environment Setup](#16-environment-setup)
- [§17 Repository Structure](#17-repository-structure)
- [§18 Git Commit Plan](#18-git-commit-plan)
- [§19 Implementation Roadmap](#19-implementation-roadmap)
- [§20 Testing Strategy](#20-testing-strategy)
- [§21 Reliability & Guardrails](#21-reliability--guardrails)
- [§22 Performance Targets](#22-performance-targets)
- [§23 Cost Analysis](#23-cost-analysis)
- [§24 AI vs Deterministic](#24-ai-vs-deterministic)
- [§25 Final Architecture Diagram](#25-final-architecture-diagram)
- [§26 Risk Register](#26-risk-register)
- [§27 Final Deliverables Summary](#27-final-deliverables-summary)
- [§28 Start Coding Now Checklist](#28-start-coding-now-checklist)

---

## 1. Architecture Overview

### Design Philosophy

Modular monolith. Two processes: one frontend dev server, one backend API server. No microservices, no message queues, no container orchestration. Every component is a Python module or TypeScript module, not a separate service.

### Component Map

| # | Component | Lives In | Purpose | MVP? |
|---|---|---|---|---|
| 1 | **Voice Capture** | Frontend (browser) | Capture microphone audio, produce text via Web Speech API | Yes |
| 2 | **Conversation UI** | Frontend | Text input, chips, acknowledgment bar, transcript | Yes |
| 3 | **Product Grid** | Frontend | Display product cards, animate transitions | Yes |
| 4 | **Frontend State** | Frontend (Zustand) | Hold current search state, conversation history, UI state | Yes |
| 5 | **API Gateway** | Backend (FastAPI) | HTTP endpoints, request validation, CORS | Yes |
| 6 | **Session Manager** | Backend (in-memory dict) | Store per-session conversation history + search state | Yes |
| 7 | **Conversation Manager** | Backend | Build LLM prompt from history + state + utterance | Yes |
| 8 | **Intent Engine** | Backend → Gemini API | Send prompt, receive structured delta, validate | Yes |
| 9 | **State Merger** | Backend | Apply validated delta to current search state | Yes |
| 10 | **Search Service** | Backend → SQLite | Translate search state to SQL, execute, return products | Yes |
| 11 | **Semantic Ranker** | Backend | Re-rank filtered products by semantic modifier similarity | Nice-to-have |
| 12 | **Product Repository** | Backend → SQLite | CRUD for products, seed data loader | Yes |

### Data Flow (Per Utterance)

```
User speaks/types
      │
      ▼
┌────────────────┐
│ Web Speech API │  (browser-side STT — only for voice)
└───────┬────────┘
        │ text string
        ▼
┌────────────────┐
│ Frontend       │  POST /api/converse { sessionId, utterance }
│ API call       │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Session Mgr    │  Load conversation history + current SearchState
└───────┬────────┘
        │ history[] + currentState + utterance
        ▼
┌────────────────┐
│ Conversation   │  Build LLM prompt:
│ Manager        │    system prompt + current state JSON
│                │    + last 8 messages + new utterance
└───────┬────────┘
        │ prompt string
        ▼
┌────────────────┐
│ Gemini Flash   │  → structured JSON output (SearchStateDelta)
│ (Intent Engine)│
└───────┬────────┘
        │ raw JSON
        ▼
┌────────────────┐
│ Delta          │  Pydantic validation, value normalization,
│ Validator      │  brand/category allowlist check
└───────┬────────┘
        │ validated SearchStateDelta
        ▼
┌────────────────┐
│ State Merger   │  Apply delta to currentState → newState
│                │  Push oldState to history stack (for undo)
└───────┬────────┘
        │ newSearchState
        ▼
┌────────────────┐
│ Search Service │  Translate SearchState → SQL WHERE clauses
│ (SQLite)       │  Execute query, return products
└───────┬────────┘
        │ Product[] (possibly 0)
        ▼
┌────────────────┐
│ Semantic       │  If semanticModifiers present:
│ Ranker         │    score products by tag/description match
│ (optional)     │    re-sort by combined relevance
└───────┬────────┘
        │ ranked Product[]
        ▼
┌────────────────┐
│ Response       │  { searchState, products, chips,
│ Builder        │    acknowledgment, clarification }
└───────┬────────┘
        │ JSON response
        ▼
┌────────────────┐
│ Frontend       │  Update Zustand store → re-render grid,
│ UI Update      │  chips, acknowledgment bar
└────────────────┘
```

**What enters each component and what leaves:**

| Component | Input | Output |
|---|---|---|
| Voice Capture | Microphone audio stream | Raw text string |
| API Gateway | `{ sessionId, utterance }` | `{ searchState, products[], chips[], acknowledgment }` |
| Session Manager | sessionId | `{ history[], currentState }` or creates new session |
| Conversation Manager | history + currentState + utterance + available filters | LLM prompt string |
| Intent Engine (Gemini) | Prompt string | Raw JSON string (SearchStateDelta shape) |
| Delta Validator | Raw JSON | Validated `SearchStateDelta` object (or validation error) |
| State Merger | currentState + validatedDelta | newSearchState |
| Search Service | SearchState | `Product[]` + totalCount |
| Semantic Ranker | `Product[]` + semanticModifiers | Re-ranked `Product[]` |

---

## 2. Technology Stack

### The Definitive Stack

| Layer | Technology | Version | Why This, Not Alternatives |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | 15.x | React-based, excellent DX, API routes as fallback, built-in TypeScript. Not plain React+Vite because Next.js gives us routing, SSR for initial load speed, and better project structure out of the box. |
| **Frontend Language** | TypeScript | 5.x | Type safety for search state schemas. Non-negotiable for a stateful app like this. |
| **Styling** | Tailwind CSS v4 | 4.x | Fastest way to build a polished UI in a hackathon. Utility-first means no context-switching to CSS files. Beautiful by default with reasonable effort. |
| **Frontend State** | Zustand | 5.x | Minimal API surface, no boilerplate, works perfectly with TypeScript. Redux is overkill. React Context causes unnecessary re-renders for a real-time grid. |
| **Animations** | Framer Motion | 11.x | Product grid transitions, chip animations. CSS transitions alone can't handle layout animations (items entering/leaving a grid). |
| **Backend Framework** | FastAPI | 0.115+ | Python, async, automatic OpenAPI docs, Pydantic validation built-in. Perfect for LLM-heavy backends. Flask is too bare. Django is too heavy. |
| **Backend Language** | Python | 3.11+ | Best ecosystem for AI/LLM integration. google-generativeai SDK is Python-first. |
| **Validation** | Pydantic v2 | 2.x | Schema validation for search state, deltas, API requests/responses. Type-safe, fast, integrates with FastAPI natively. |
| **Database** | SQLite | 3.x (via aiosqlite) | Zero setup. File-based. Fast for <10k products. No PostgreSQL installation hassle at a hackathon. Easily seeded from a JSON file. |
| **LLM** | **Gemini 2.0 Flash** | via google-generativeai SDK | See detailed analysis below. |
| **Speech-to-Text** | **Web Speech API** (browser) | Browser-native | See detailed analysis below. |
| **HTTP Client** | Fetch API (frontend) | Browser-native | No axios needed for simple POST requests. |

### LLM Decision: Gemini 2.0 Flash

| Criterion | Gemini 2.0 Flash | GPT-4o-mini | Gemini 2.5 Flash |
|---|---|---|---|
| **Latency** | ~300-500ms | ~400-700ms | ~500-1000ms (thinking overhead) |
| **Structured output** | `response_mime_type="application/json"` + schema | `response_format=json_schema` | Same as 2.0 Flash |
| **Cost** | $0.10/1M input | $0.15/1M input | $0.15/1M input |
| **Free tier** | 15 RPM free, generous | $5 credit for new accounts | 10 RPM free |
| **Python SDK** | `google-generativeai` — clean, well-documented | `openai` — also clean | Same SDK as 2.0 Flash |
| **Context window** | 1M tokens | 128k tokens | 1M tokens |
| **Verdict** | **✅ CHOSEN** | Good fallback | Overkill for intent extraction |

**Why Gemini 2.0 Flash wins:**
1. Fastest inference for structured JSON output
2. Cheapest per token
3. Most generous free tier (critical for hackathon — zero cost to demo)
4. JSON mode is reliable for our schema size
5. Python SDK is straightforward
6. Google Cloud credits are often available at hackathons

**Fallback:** If Gemini API has issues, swap to GPT-4o-mini with identical prompt structure. The prompt and schema are model-agnostic.

### STT Decision: Web Speech API

| Criterion | Web Speech API | Whisper (local) | Deepgram | Gemini Live Audio |
|---|---|---|---|---|
| **Latency** | <500ms (streaming) | 2-5s (batch) | <500ms (streaming) | <1s |
| **Cost** | Free | Free (but GPU needed) | $0.0043/min | Per-token |
| **Setup** | Zero — browser-native | Python package + model download | API key + SDK | Complex — different API shape |
| **Accuracy (English)** | Good (Google's engine) | Excellent | Excellent | Good |
| **Hindi** | Moderate | Good | Good | Moderate |
| **Streaming transcript** | Yes (interim results) | No | Yes | Yes |
| **Browser support** | Chrome, Edge, Safari | N/A (server-side) | All (via SDK) | N/A |
| **Verdict** | **✅ CHOSEN for MVP** | Backup for server-side | Production upgrade | Too complex for MVP |

**Why Web Speech API wins for MVP:**
1. Zero cost, zero setup, zero API keys
2. Streaming interim results (user sees text appearing as they speak)
3. Runs entirely in-browser — no audio upload latency
4. Good enough accuracy for English demo
5. Works on Chrome/Edge which covers 80%+ of demo scenarios

**Honest limitations:**
- Requires internet (it uses Google's servers under the hood)
- Not available in Firefox
- Hindi accuracy is inconsistent
- No fine-tuning possible

**For production:** Upgrade to Deepgram (streaming, multi-language, better accuracy).

### Why NOT a Vector Database

The PRD mentions semantic search for queries like "comfortable" or "premium." Here's why we don't need a vector DB:

1. Our product catalog is **<500 items** for the hackathon. You can score every product against a modifier in <10ms.
2. We pre-tag products with semantic keywords (`tags: ["comfortable", "lightweight", "breathable"]`). Matching "comfortable" against tags is a simple string lookup, not a vector search.
3. For slightly fuzzier matching, we can use Gemini to expand "comfortable" → `["comfortable", "cushioned", "soft", "padded"]` and match against product descriptions with simple text search.
4. Adding Pinecone/Weaviate/pgvector adds infrastructure complexity with zero benefit at this scale.

**When to add vectors:** Post-hackathon, if the catalog grows to 100k+ products and semantic queries become the primary use case.

---

## 3. MVP Scope & Cut List

### Must Build (P0) — Demo Lives or Dies on These

| # | Feature | Why Critical |
|---|---|---|
| 1 | Product grid with real product data (footwear focus, 80-100 items) | Without products there's nothing to show |
| 2 | Text input → LLM → state delta → filtered products → grid update | Core loop must work with text first |
| 3 | Voice input → STT → text → same pipeline | Voice is the "wow" layer on top of text |
| 4 | Persistent search state across utterances | **THE** USP. Without this we're just another search bar. |
| 5 | LLM structured output producing validated SearchStateDelta | Heart of the system |
| 6 | State merger applying delta to current state | Makes persistence work |
| 7 | Filter chips showing current state (appear/update/disappear) | Visual proof the state is working |
| 8 | AI acknowledgment text ("Showing white sneakers under ₹1,000") | Feedback loop so user knows they were understood |
| 9 | Refinement: follow-up utterances correctly modify existing state | "under 1000" after "white sneakers" → BOTH constraints |
| 10 | Removal: "remove the brand filter" → brand chip disappears | Shows state is controllable |
| 11 | Basic zero-result message | "No products match. Try relaxing the price or brand." |

### Should Build (P1) — Makes Demo Stronger

| # | Feature | Why Valuable |
|---|---|---|
| 12 | Negation: "anything except black" → excludeColors: ["black"] | Shows depth beyond basic filters |
| 13 | Relative adjustment: "make it cheaper" → lower maxPrice | Shows AI understands relative intent |
| 14 | Semantic tag matching: "something comfortable" → boost products with "comfortable" tag | The key semantic demo moment |
| 15 | Undo: "go back" → revert to previous state | Shows state history |
| 16 | Clarifying question: "I need shoes" → "Running, casual, or formal?" | Shows AI is smart, not just a parser |
| 17 | Polished animations: grid transitions, chip animations, mic waveform | Visual wow factor |
| 18 | Responsive mobile layout | Judges may view on phones |

### Do NOT Build

| Feature | Why Cut |
|---|---|
| Product detail page (full) | Quick-view modal is enough. We're demoing discovery, not PDP. |
| Cart, checkout, payments | Not our product. |
| User accounts / auth | Anonymous sessions only. |
| Multi-language voice (Hindi) | English-only for reliable demo. Hindi is unreliable with Web Speech API. |
| Cross-platform adapters | Vision slide only. |
| Product comparison | Adds complexity, not differentiation. |
| "Show me something similar" (embedding-based) | Attribute-based similarity is enough if time permits. |
| Recommendation engine | Different product entirely. |
| Analytics dashboard | Not demo-relevant. |
| Custom STT model | Use Web Speech API as-is. |
| Complex multi-agent LLM system | One LLM call per utterance. Period. |

### PRD Items That Are Over-Engineered for Hackathon

| PRD Concept | Assessment |
|---|---|
| `confidence` field on every filter | Cut. Adds schema complexity. For MVP, if the LLM extracts it, we use it. Clarification is a binary decision by the LLM, not a confidence threshold. |
| `source` field ("extracted" vs "inferred") | Cut. Nice for transparency but adds visual complexity to chips. All chips are equal for MVP. |
| Search state `version` field | Cut. We're not doing state schema migrations during a hackathon. |
| `similarTo` product anchor | Downgrade to stretch. Requires a "show similar" UX flow that's extra work. |
| `contextFlags` (useCase, occasion, gender) | Merge into `semanticModifiers`. A separate structure for these adds no value over just putting "everyday" or "formal" into the semantic modifiers list and matching against tags. |
| Auto-listen after every response | Cut. Push-to-talk is safer (see §9). |
| Currency field on price | Cut. Everything is INR. Hardcode it. |
| Product `originalPrice` / `discount` | Cut unless trivial. Adds visual clutter to cards without demo value. |

---

## 4. Data Models

### 4.1 Product — Pydantic (Backend)

```python
# backend/app/schemas/product.py

from pydantic import BaseModel

class Product(BaseModel):
    id: str                           # "prod_001"
    name: str                         # "Asian Cosmo White Running Shoes"
    description: str                  # "Lightweight mesh sneakers..."
    category: str                     # "sneakers"
    subcategory: str | None = None    # "casual", "running", "formal"
    brand: str                        # "Asian"
    price: float                      # 899.0 (INR, always)
    rating: float                     # 4.2
    review_count: int                 # 1250
    colors: list[str]                 # ["white", "grey"]
    sizes: list[str]                  # ["6", "7", "8", "9", "10"]
    material: str | None = None       # "mesh", "leather", "canvas"
    gender: str | None = None         # "men", "women", "unisex"
    tags: list[str]                   # ["comfortable", "lightweight", "daily-wear", "breathable"]
    image_url: str                    # "/images/asian_cosmo_white.jpg"
    in_stock: bool = True
```

**Why these fields and not others:**
- `colors` is a list (products come in multiple colors). Primary color for filtering comes from the first element or from the search query match.
- `tags` is the MVP semantic search mechanism. We manually tag products with qualitative keywords.
- No `originalPrice`/`discount` — adds no demo value.
- No `stock_count` — boolean `in_stock` is enough.
- `subcategory` handles "running shoes" vs "casual shoes" vs "formal shoes."

### 4.2 Product — TypeScript (Frontend)

```typescript
// frontend/src/types/product.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  brand: string;
  price: number;
  rating: number;
  reviewCount: number;
  colors: string[];
  sizes: string[];
  material: string | null;
  gender: string | null;
  tags: string[];
  imageUrl: string;
  inStock: boolean;
}
```

### 4.3 SearchState — Pydantic (Backend)

```python
# backend/app/schemas/search_state.py

from pydantic import BaseModel

class SearchState(BaseModel):
    """The complete representation of what the user currently wants."""

    # Hard filters — these become SQL WHERE clauses
    query: str | None = None             # Free-text base query
    category: str | None = None          # "sneakers", "phones", "laptops"
    subcategory: str | None = None       # "running", "casual", "formal"
    brand: str | None = None             # "Asian", "Nike"
    color: str | None = None             # "white", "black"
    min_price: float | None = None       # Minimum price in INR
    max_price: float | None = None       # Maximum price in INR
    min_rating: float | None = None      # Minimum average rating
    size: str | None = None              # "8", "M", "42"
    material: str | None = None          # "mesh", "leather"
    gender: str | None = None            # "men", "women", "unisex"

    # Exclusions — these become SQL WHERE NOT IN clauses
    exclude_brands: list[str] = []
    exclude_colors: list[str] = []
    exclude_materials: list[str] = []

    # Semantic modifiers — used for tag matching / re-ranking, NOT SQL filters
    semantic_modifiers: list[str] = []   # ["comfortable", "premium", "classy"]

    # Sort
    sort_by: str = "relevance"           # "relevance", "price_asc", "price_desc", "rating", "popularity"
```

**Design decisions:**
- No `confidence` per field — cut for MVP.
- No `source` per field — cut for MVP.
- `exclude_*` lists are separate from positive filters. This cleanly handles "anything except black."
- `semantic_modifiers` is a flat string list. No weights. MVP: if a product's tags contain any modifier, boost it.
- Sort is a string enum, not a complex object.
- No `similarTo` — cut for MVP.

### 4.4 SearchState — TypeScript (Frontend)

```typescript
// frontend/src/types/search-state.ts

export interface SearchState {
  query: string | null;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  color: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  size: string | null;
  material: string | null;
  gender: string | null;

  excludeBrands: string[];
  excludeColors: string[];
  excludeMaterials: string[];

  semanticModifiers: string[];

  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'popularity';
}
```

### 4.5 SearchStateDelta — Pydantic (Backend)

This is the LLM's output contract. The most critical schema in the system.

```python
# backend/app/schemas/delta.py

from pydantic import BaseModel
from enum import Enum

class IntentType(str, Enum):
    NEW_SEARCH = "NEW_SEARCH"     # User starts a completely new search
    REFINE = "REFINE"             # User modifies existing search
    REMOVE = "REMOVE"             # User removes specific filter(s)
    NEGATE = "NEGATE"             # User excludes something
    UNDO = "UNDO"                 # "Go back", "undo that"
    RESET = "RESET"               # "Start over", "clear everything"
    CLARIFY = "CLARIFY"           # AI doesn't understand, needs to ask

class SearchStateDelta(BaseModel):
    """The LLM produces this. It describes HOW to change the current state."""

    intent_type: IntentType

    # Fields to set or overwrite
    set_query: str | None = None
    set_category: str | None = None
    set_subcategory: str | None = None
    set_brand: str | None = None
    set_color: str | None = None
    set_min_price: float | None = None
    set_max_price: float | None = None
    set_min_rating: float | None = None
    set_size: str | None = None
    set_material: str | None = None
    set_gender: str | None = None
    set_sort_by: str | None = None

    # Fields to clear (set back to null)
    remove_fields: list[str] = []
    # Valid values: "query", "category", "subcategory", "brand",
    #   "color", "min_price", "max_price", "min_rating",
    #   "size", "material", "gender"

    # Exclusions to add
    add_exclude_brands: list[str] = []
    add_exclude_colors: list[str] = []
    add_exclude_materials: list[str] = []

    # Exclusions to remove
    remove_exclude_brands: list[str] = []
    remove_exclude_colors: list[str] = []
    remove_exclude_materials: list[str] = []

    # Semantic modifiers
    add_semantic: list[str] = []
    remove_semantic: list[str] = []

    # Clarification (when intent_type == CLARIFY)
    clarification_question: str | None = None

    # Human-readable acknowledgment
    acknowledgment: str = ""
```

**Why flat fields instead of nested `set: {}` dict:**
- Pydantic validates each field individually. A generic `dict` loses type safety.
- Gemini structured output works better with flat schemas than deeply nested ones.
- Each `set_*` field is independently optional. If it's `None`, it means "don't touch this field."
- `remove_fields` is a list of field names to null out. This is cleaner than having a separate "remove" flag per field.

### 4.6 SearchStateDelta — TypeScript (Frontend)

```typescript
// frontend/src/types/delta.ts

export type IntentType =
  | 'NEW_SEARCH'
  | 'REFINE'
  | 'REMOVE'
  | 'NEGATE'
  | 'UNDO'
  | 'RESET'
  | 'CLARIFY';

export interface SearchStateDelta {
  intentType: IntentType;

  setQuery?: string | null;
  setCategory?: string | null;
  setSubcategory?: string | null;
  setBrand?: string | null;
  setColor?: string | null;
  setMinPrice?: number | null;
  setMaxPrice?: number | null;
  setMinRating?: number | null;
  setSize?: string | null;
  setMaterial?: string | null;
  setGender?: string | null;
  setSortBy?: string | null;

  removeFields: string[];

  addExcludeBrands: string[];
  addExcludeColors: string[];
  addExcludeMaterials: string[];
  removeExcludeBrands: string[];
  removeExcludeColors: string[];
  removeExcludeMaterials: string[];

  addSemantic: string[];
  removeSemantic: string[];

  clarificationQuestion?: string | null;
  acknowledgment: string;
}
```

### 4.7 API Response Schema — Pydantic

```python
# backend/app/schemas/api.py

from pydantic import BaseModel
from .product import Product
from .search_state import SearchState

class FilterChip(BaseModel):
    label: str          # "White", "Under ₹1,000", "Asian"
    field: str          # "color", "max_price", "brand"
    type: str           # "filter", "exclusion", "semantic"
    removable: bool = True

class ConverseRequest(BaseModel):
    session_id: str
    utterance: str

class ConverseResponse(BaseModel):
    session_id: str
    search_state: SearchState
    products: list[Product]
    total_results: int
    chips: list[FilterChip]
    acknowledgment: str
    clarification: str | None = None

class UndoResponse(BaseModel):
    session_id: str
    search_state: SearchState
    products: list[Product]
    total_results: int
    chips: list[FilterChip]
    acknowledgment: str
```

---

## 5. LLM Contract

### 5.1 System Prompt

This is the actual prompt. Use it as-is, tune iteratively.

```
You are the intent engine for VoiceFilter, a conversational shopping search system.

## Your Role
You convert natural-language shopping utterances into structured search-state changes.
You do NOT recommend products. You do NOT invent product names, prices, or brands.
You ONLY produce a JSON delta that describes how to modify the current search state.

## Available Filter Fields
- category: string (sneakers, running_shoes, casual_shoes, formal_shoes, sandals, boots, phones, laptops, headphones, backpacks, t-shirts, shirts, jeans)
- subcategory: string (casual, sports, everyday, formal, gaming, business, over-ear, in-ear, etc.)
- brand: string (must be from user's utterance — never invent brands)
- color: string (white, black, blue, red, grey, brown, green, pink, etc.)
- min_price: number (INR)
- max_price: number (INR)
- min_rating: number (1.0 to 5.0)
- size: string
- material: string (mesh, leather, canvas, rubber, plastic, cotton, polyester, etc.)
- gender: string (men, women, unisex)
- sort_by: string (relevance, price_asc, price_desc, rating, popularity)

## Intent Types
- NEW_SEARCH: User starts a completely new search topic. Clear all previous filters.
- REFINE: User adds or modifies filters on the existing search. Keep all existing filters unless explicitly changed.
- REMOVE: User explicitly asks to remove a specific filter. Example: "remove the brand filter", "forget the color".
- NEGATE: User excludes something. Example: "not black", "anything except leather", "no Nike".
- UNDO: User says "go back", "undo", "previous". Revert to the last state.
- RESET: User says "start over", "clear everything", "new search". Clear all filters.
- CLARIFY: You genuinely cannot determine the user's intent. Ask ONE short clarifying question.

## Critical Rules
1. NEVER invent brands, products, or prices. Only extract what the user explicitly says.
2. When intent_type is REFINE, only set fields the user mentioned. Leave all other set_* fields as null. This preserves existing filters.
3. When intent_type is NEW_SEARCH, you may set multiple fields. Existing filters will be cleared by the system.
4. For "cheaper" / "more affordable": reduce max_price by ~30% from the current value. If no current max_price, set a reasonable one for the category.
5. For "more premium" / "expensive": increase min_price or remove max_price.
6. For "better rated": increase min_rating by 0.5, or set to 4.0 if not set.
7. Qualitative terms like "comfortable", "classy", "premium", "stylish", "lightweight", "durable" go into add_semantic, NOT into hard filter fields.
8. "Under X" or "below X" → set_max_price = X
9. "Above X" or "over X" → set_min_price = X
10. "Around X" or "about X" → set_min_price = X * 0.8, set_max_price = X * 1.2
11. For price values, interpret "1k" as 1000, "1.5k" as 1500, "70k" as 70000.
12. Always provide a short, natural acknowledgment of what you understood.
13. If the user's statement is off-topic (weather, jokes, unrelated), set intent_type to CLARIFY and ask them what they'd like to shop for.
14. For ambiguous category requests like "I need shoes", still set the category and optionally ask a clarifying question.
15. Treat Hindi/Hinglish naturally: "dikhao" = "show", "sasta" = "cheaper", "accha" = "good/better".

## Output Schema (strict JSON, no extra fields)
{
  "intent_type": "NEW_SEARCH" | "REFINE" | "REMOVE" | "NEGATE" | "UNDO" | "RESET" | "CLARIFY",
  "set_query": string | null,
  "set_category": string | null,
  "set_subcategory": string | null,
  "set_brand": string | null,
  "set_color": string | null,
  "set_min_price": number | null,
  "set_max_price": number | null,
  "set_min_rating": number | null,
  "set_size": string | null,
  "set_material": string | null,
  "set_gender": string | null,
  "set_sort_by": string | null,
  "remove_fields": [string],
  "add_exclude_brands": [string],
  "add_exclude_colors": [string],
  "add_exclude_materials": [string],
  "remove_exclude_brands": [string],
  "remove_exclude_colors": [string],
  "remove_exclude_materials": [string],
  "add_semantic": [string],
  "remove_semantic": [string],
  "clarification_question": string | null,
  "acknowledgment": string
}
```

### 5.2 Per-Request Input Format

The dynamic prompt sent with each request:

```
## Current Search State
{current_state_json}

## Conversation History (last 8 messages)
User: "Show me white sneakers"
Assistant: "Showing white sneakers"
User: "Under 1000"
Assistant: "Filtered to under ₹1,000"

## Current Result Count
23 products currently match.

## New User Utterance
"{utterance}"

Produce the JSON delta for this utterance.
```

### 5.3 Gemini API Call (Python)

```python
import google.generativeai as genai
import json

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config=genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=SearchStateDelta,  # Pydantic model
        temperature=0.1,  # Low temperature for deterministic output
    ),
    system_instruction=SYSTEM_PROMPT,
)

async def extract_intent(
    utterance: str,
    current_state: SearchState,
    history: list[dict],
    result_count: int,
) -> SearchStateDelta:
    prompt = build_dynamic_prompt(utterance, current_state, history, result_count)
    response = await model.generate_content_async(prompt)
    delta = SearchStateDelta.model_validate_json(response.text)
    return delta
```

### 5.4 Validation Rules (Post-LLM)

After the LLM returns a delta, apply these deterministic checks:

```python
VALID_CATEGORIES = {"sneakers", "running_shoes", "casual_shoes", "formal_shoes",
                    "sandals", "boots", "phones", "laptops", "headphones",
                    "backpacks", "t-shirts", "shirts", "jeans"}

VALID_SORT = {"relevance", "price_asc", "price_desc", "rating", "popularity"}

VALID_REMOVE_FIELDS = {"query", "category", "subcategory", "brand", "color",
                       "min_price", "max_price", "min_rating", "size",
                       "material", "gender"}

def validate_delta(delta: SearchStateDelta) -> SearchStateDelta:
    # Normalize category
    if delta.set_category and delta.set_category not in VALID_CATEGORIES:
        # Try fuzzy match, or drop
        closest = fuzzy_match(delta.set_category, VALID_CATEGORIES)
        delta.set_category = closest  # None if no match

    # Clamp prices
    if delta.set_max_price is not None:
        delta.set_max_price = max(0, delta.set_max_price)
    if delta.set_min_price is not None:
        delta.set_min_price = max(0, delta.set_min_price)

    # Validate sort
    if delta.set_sort_by and delta.set_sort_by not in VALID_SORT:
        delta.set_sort_by = None

    # Validate remove_fields
    delta.remove_fields = [f for f in delta.remove_fields if f in VALID_REMOVE_FIELDS]

    # Clamp rating
    if delta.set_min_rating is not None:
        delta.set_min_rating = max(1.0, min(5.0, delta.set_min_rating))

    # Normalize colors to lowercase
    if delta.set_color:
        delta.set_color = delta.set_color.lower().strip()
    delta.add_exclude_colors = [c.lower().strip() for c in delta.add_exclude_colors]

    return delta
```

### 5.5 Error Handling

| Failure | Response |
|---|---|
| LLM returns invalid JSON | Retry once with same prompt. If still invalid, return generic "I didn't understand that. Could you try again?" |
| LLM returns valid JSON but fails Pydantic validation | Attempt partial parse: extract what validates, ignore rest. Return acknowledgment "I partially understood that." |
| LLM times out (>5s) | Return timeout error to frontend. Frontend shows "Taking longer than expected..." and offers text retry. |
| LLM returns intent_type CLARIFY | Don't modify state. Return clarification question to frontend. Frontend displays it. |

---

## 6. Conversation State Machine

### State Transition Walkthrough

**Initial state (empty session):**
```json
{
  "query": null, "category": null, "brand": null, "color": null,
  "minPrice": null, "maxPrice": null, "minRating": null,
  "size": null, "material": null, "gender": null, "subcategory": null,
  "excludeBrands": [], "excludeColors": [], "excludeMaterials": [],
  "semanticModifiers": [], "sortBy": "relevance"
}
```

---

**Turn 1:** User says "White sneakers"

LLM produces:
```json
{
  "intent_type": "NEW_SEARCH",
  "set_category": "sneakers",
  "set_color": "white",
  "acknowledgment": "Showing white sneakers"
}
```

State Merger action: `intent_type == NEW_SEARCH` → clear all fields, then apply `set_*`.

**New state:**
```json
{ "category": "sneakers", "color": "white", ... }
```

---

**Turn 2:** User says "Under 1000"

LLM produces:
```json
{
  "intent_type": "REFINE",
  "set_max_price": 1000,
  "acknowledgment": "Filtering to under ₹1,000"
}
```

State Merger action: `intent_type == REFINE` → keep existing state, apply only non-null `set_*` fields.

**New state:**
```json
{ "category": "sneakers", "color": "white", "maxPrice": 1000 }
```

---

**Turn 3:** User says "Only Asian"

LLM produces:
```json
{
  "intent_type": "REFINE",
  "set_brand": "Asian",
  "acknowledgment": "Showing only Asian brand"
}
```

**New state:**
```json
{ "category": "sneakers", "color": "white", "maxPrice": 1000, "brand": "Asian" }
```

---

**Turn 4:** User says "Actually make it 1500"

LLM produces:
```json
{
  "intent_type": "REFINE",
  "set_max_price": 1500,
  "acknowledgment": "Updated budget to ₹1,500"
}
```

State Merger: `set_max_price = 1500` overwrites the existing `1000`.

**New state:**
```json
{ "category": "sneakers", "color": "white", "maxPrice": 1500, "brand": "Asian" }
```

---

**Turn 5:** User says "Remove the brand restriction"

LLM produces:
```json
{
  "intent_type": "REMOVE",
  "remove_fields": ["brand"],
  "acknowledgment": "Removed brand filter"
}
```

State Merger: set `state.brand = None`.

**New state:**
```json
{ "category": "sneakers", "color": "white", "maxPrice": 1500, "brand": null }
```

---

**Turn 6:** User says "Not black"

LLM produces:
```json
{
  "intent_type": "NEGATE",
  "add_exclude_colors": ["black"],
  "acknowledgment": "Excluding black options"
}
```

State Merger: append "black" to `exclude_colors`.

**New state:**
```json
{ "category": "sneakers", "color": "white", "maxPrice": 1500, "excludeColors": ["black"] }
```

---

**Turn 7:** User says "Show me something comfortable"

LLM produces:
```json
{
  "intent_type": "REFINE",
  "add_semantic": ["comfortable"],
  "acknowledgment": "Prioritizing comfortable options"
}
```

State Merger: append "comfortable" to `semantic_modifiers`. Hard filters unchanged.

**New state:**
```json
{ "category": "sneakers", "color": "white", "maxPrice": 1500,
  "excludeColors": ["black"], "semanticModifiers": ["comfortable"] }
```

---

### State Merger Algorithm (Pseudocode)

```python
def merge_state(current: SearchState, delta: SearchStateDelta) -> SearchState:
    # 1. Handle special intent types
    if delta.intent_type == "RESET":
        return SearchState()  # Empty state

    if delta.intent_type == "UNDO":
        return state_history.pop()  # Revert to previous

    if delta.intent_type == "CLARIFY":
        return current  # Don't modify state

    # 2. Save current state for undo
    state_history.append(current.model_copy())

    # 3. For NEW_SEARCH, start from blank
    if delta.intent_type == "NEW_SEARCH":
        new_state = SearchState()
    else:
        new_state = current.model_copy()

    # 4. Apply set_* fields (only non-None values)
    SETTABLE = ["query", "category", "subcategory", "brand", "color",
                "min_price", "max_price", "min_rating", "size",
                "material", "gender", "sort_by"]

    for field in SETTABLE:
        delta_value = getattr(delta, f"set_{field}", None)
        if delta_value is not None:
            setattr(new_state, field, delta_value)

    # 5. Apply removals
    for field in delta.remove_fields:
        if hasattr(new_state, field):
            setattr(new_state, field, None)

    # 6. Apply exclusion additions
    new_state.exclude_brands = list(set(
        new_state.exclude_brands + delta.add_exclude_brands
    ) - set(delta.remove_exclude_brands))

    new_state.exclude_colors = list(set(
        new_state.exclude_colors + delta.add_exclude_colors
    ) - set(delta.remove_exclude_colors))

    new_state.exclude_materials = list(set(
        new_state.exclude_materials + delta.add_exclude_materials
    ) - set(delta.remove_exclude_materials))

    # 7. Apply semantic modifier changes
    new_state.semantic_modifiers = list(set(
        new_state.semantic_modifiers + delta.add_semantic
    ) - set(delta.remove_semantic))

    return new_state
```

---

## 7. Search Engine Design

### SQL Query Generation

The Search Service translates a `SearchState` into a SQLite query.

```python
def build_query(state: SearchState) -> tuple[str, list]:
    """Returns (sql_string, params_list)."""
    conditions = []
    params = []

    if state.category:
        conditions.append("category = ?")
        params.append(state.category)

    if state.subcategory:
        conditions.append("subcategory = ?")
        params.append(state.subcategory)

    if state.brand:
        conditions.append("LOWER(brand) = LOWER(?)")
        params.append(state.brand)

    if state.color:
        # Match if the color appears in the JSON colors array
        conditions.append("EXISTS (SELECT 1 FROM json_each(colors) WHERE LOWER(value) = LOWER(?))")
        params.append(state.color)

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
        params.append(state.material)

    if state.gender:
        conditions.append("(LOWER(gender) = LOWER(?) OR gender = 'unisex')")
        params.append(state.gender)

    if state.size:
        conditions.append("EXISTS (SELECT 1 FROM json_each(sizes) WHERE value = ?)")
        params.append(state.size)

    # Exclusions
    for brand in state.exclude_brands:
        conditions.append("LOWER(brand) != LOWER(?)")
        params.append(brand)

    for color in state.exclude_colors:
        conditions.append("NOT EXISTS (SELECT 1 FROM json_each(colors) WHERE LOWER(value) = LOWER(?))")
        params.append(color)

    for mat in state.exclude_materials:
        conditions.append("LOWER(material) != LOWER(?)")
        params.append(mat)

    # Only in-stock
    conditions.append("in_stock = 1")

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    # Sort
    order = {
        "relevance": "rating * review_count DESC",  # Simple relevance proxy
        "price_asc": "price ASC",
        "price_desc": "price DESC",
        "rating": "rating DESC",
        "popularity": "review_count DESC",
    }.get(state.sort_by, "rating * review_count DESC")

    sql = f"SELECT * FROM products WHERE {where_clause} ORDER BY {order} LIMIT 50"

    return sql, params
```

**Key design decisions:**
- `colors` and `sizes` are stored as JSON arrays in SQLite. We use `json_each()` to query into them.
- Case-insensitive matching with `LOWER()`.
- `LIMIT 50` — we never need more than 50 products for the grid. Pagination is not MVP.
- Exclusions use `!=` and `NOT EXISTS`.
- "relevance" sort uses `rating * review_count` as a simple popularity proxy.

### Full-Text Search (Optional Enhancement)

If `state.query` is set (e.g., user said something too complex for structured extraction), we can add:

```python
if state.query:
    conditions.append("(name LIKE ? OR description LIKE ?)")
    params.extend([f"%{state.query}%", f"%{state.query}%"])
```

For MVP, this is sufficient. SQLite FTS5 is available if we need better text search post-hackathon.

---

## 8. Semantic Search

### The Problem

User says "something comfortable." There's no `comfortable` column in the database. Hard filters can't handle this.

### MVP Solution: Tag Matching + Re-Ranking

**Step 1:** Every product has a `tags` field — a JSON array of qualitative keywords:

```json
{
  "name": "Asian Cosmo Mesh Sneakers",
  "tags": ["comfortable", "lightweight", "breathable", "daily-wear", "cushioned"]
}
```

**Step 2:** When `semantic_modifiers` are present in the search state, we first apply hard filters (category, brand, price, etc.) to get the candidate set.

**Step 3:** Score each candidate by tag overlap:

```python
def semantic_score(product: Product, modifiers: list[str]) -> float:
    """Score 0.0 to 1.0 based on tag overlap with semantic modifiers."""
    if not modifiers:
        return 0.0

    product_tags = set(t.lower() for t in product.tags)
    product_text = f"{product.name} {product.description}".lower()

    score = 0.0
    for mod in modifiers:
        mod_lower = mod.lower()
        # Direct tag match: full point
        if mod_lower in product_tags:
            score += 1.0
        # Substring in name/description: half point
        elif mod_lower in product_text:
            score += 0.5

    return score / len(modifiers)  # Normalize to 0-1
```

**Step 4:** Re-rank candidates. Products with higher semantic scores appear first, but maintain secondary sort by the original sort preference.

```python
def rank_products(products: list[Product], state: SearchState) -> list[Product]:
    if not state.semantic_modifiers:
        return products  # No re-ranking needed

    scored = []
    for p in products:
        sem_score = semantic_score(p, state.semantic_modifiers)
        scored.append((p, sem_score))

    # Sort by semantic score (desc), then by original order
    scored.sort(key=lambda x: x[1], reverse=True)
    return [p for p, _ in scored]
```

**Why this works for MVP:**
- No embeddings, no vector DB, no external API calls
- Runs in microseconds for <500 products
- Tags are manually curated to cover common qualitative queries
- Transparent: we can show "matched tags: comfortable, cushioned" in debug mode

**When to upgrade:** Post-hackathon, replace tag matching with embedding-based similarity using `text-embedding-004` from Google. Store embeddings in pgvector. Compute cosine similarity between the user's semantic modifier and product description embeddings.

### Semantic Tags Taxonomy (Pre-Seed Products With These)

```
Comfort: comfortable, cushioned, soft, padded, ergonomic, memory-foam
Style: stylish, trendy, fashionable, modern, classic, retro, minimalist
Premium: premium, luxury, high-end, designer, exclusive
Casual: casual, everyday, daily-wear, relaxed, laid-back
Formal: formal, office, professional, business, elegant, classy
Sport: athletic, sporty, performance, training, gym
Durability: durable, sturdy, rugged, long-lasting, tough
Weight: lightweight, ultra-light, heavy-duty
Breathability: breathable, ventilated, airy, mesh
Weather: waterproof, water-resistant, insulated, warm
```

---

## 9. Voice Interaction Design

### Push-to-Talk vs Auto-Listen

**Recommendation: Push-to-talk for MVP.**

| Approach | Pros | Cons |
|---|---|---|
| **Push-to-talk** | Predictable. User controls when listening starts/stops. No false triggers. Works in noisy environments. | Requires mic tap for every utterance. Slightly less "magical." |
| **Auto-listen** | Feels continuous and natural. Closer to "talking to a shopkeeper." | Silence detection is unreliable. Background noise triggers false starts. User may not realize the mic is on. Privacy concerns. |

Auto-listen sounds better in theory but is fragile. In a hackathon demo environment (noisy room, background chatter, judge talking), auto-listen will pick up ambient noise and produce garbage transcripts. Push-to-talk is reliable.

**Compromise:** After showing results, display a prominent "Tap to refine" mic button with a subtle animation. This trains the user into the multi-turn loop without risking false triggers.

### Microphone Lifecycle

```
IDLE                          MIC BUTTON
  │                           (pulsing glow)
  │  User taps mic
  ▼
REQUESTING_PERMISSION         (first time only)
  │  Browser shows permission dialog
  │  User grants → proceed
  │  User denies → show text input fallback
  ▼
LISTENING                     MIC BUTTON
  │                           (solid color, waveform animation)
  │                           Live transcript appears
  │
  │  Web Speech API fires:
  │    onresult (interim) → update transcript display
  │    onresult (final) → capture final text
  │    onend → STT session ended
  ▼
PROCESSING                    (brief "Understanding..." state)
  │  Send text to POST /api/converse
  │  Wait for response
  ▼
RESULTS                       Grid updates, chips update
  │                           Acknowledgment text appears
  │                           Mic button returns to IDLE
  ▼
IDLE                          Ready for next tap
```

### Web Speech API Implementation Notes

```typescript
// frontend/src/hooks/useVoiceInput.ts

function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback: browser doesn't support. Show text-only mode.
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;      // Stop after one utterance
    recognition.interimResults = true;   // Show text as user speaks
    recognition.lang = 'en-IN';          // English (India)
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) setTranscript(final);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      // Handle: 'no-speech', 'audio-capture', 'not-allowed'
    };

    recognition.onend = () => {
      setIsListening(false);
      // If we have a final transcript, trigger the search
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  return { isListening, transcript, interimTranscript, startListening, stopListening };
}
```

### Voice Edge Cases

| Scenario | Handling |
|---|---|
| Mic permission denied | Show text input. Message: "Mic access needed for voice. You can also type below." |
| No speech detected (silence) | Web Speech API fires `onerror` with `no-speech`. Show: "Didn't hear anything. Try again?" |
| Poor transcription | User sees interim text. If it's wrong, they can tap a "Cancel" button before it submits. Or they can correct via follow-up: "I said Nike, not night." |
| Browser doesn't support Web Speech API | Hide mic button entirely. Show text-only mode. This affects Firefox users. |
| Mobile Safari | Web Speech API support is partial. Test on Safari; if broken, fall back to text-only on iOS Safari. |
| Multiple rapid taps | Debounce. Ignore taps while `isListening` is true. |

### Latency Breakdown (Voice Path)

```
User finishes speaking:          0ms
  ↓
Web Speech API final result:   ~300-500ms  (runs in background during speech)
  ↓
HTTP POST to backend:          ~50-100ms   (local dev) / ~100-300ms (deployed)
  ↓
LLM inference (Gemini Flash):  ~300-600ms
  ↓
SQL query + ranking:           ~10-50ms
  ↓
HTTP response:                 ~50-100ms
  ↓
UI render:                     ~50-100ms
─────────────────────────────
Total:                         ~800-1500ms  ✅ Under 2 seconds
```

This is fast enough. The user will see the "Understanding..." state for <1 second, then products update. That's a great experience.

---

## 10. Frontend Architecture

### Component Tree

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, global styles
│   ├── page.tsx                # Main (only) page
│   └── globals.css             # Tailwind + custom CSS
│
├── components/
│   ├── VoiceButton.tsx         # Mic button with states: idle, listening, processing
│   ├── TextInput.tsx           # Text input bar with send button
│   ├── TranscriptDisplay.tsx   # Shows live interim/final transcript above input
│   ├── ProductGrid.tsx         # Animated grid of product cards
│   ├── ProductCard.tsx         # Individual product card
│   ├── SearchChips.tsx         # Row of active filter chips
│   ├── SearchChip.tsx          # Individual chip (tappable to remove)
│   ├── AcknowledgmentBar.tsx   # "Showing white sneakers under ₹1,000"
│   ├── EmptyState.tsx          # Zero results + suggestions
│   ├── ClarificationBubble.tsx # AI's clarifying question
│   ├── LoadingSkeleton.tsx     # Skeleton cards during loading
│   └── Header.tsx              # Logo + tagline
│
├── hooks/
│   ├── useVoiceInput.ts        # Web Speech API wrapper
│   ├── useConverse.ts          # API call to POST /api/converse
│   └── useStore.ts             # Zustand store access (re-export)
│
├── store/
│   └── useAppStore.ts          # Zustand store definition
│
├── lib/
│   ├── api.ts                  # Fetch wrapper for backend calls
│   └── utils.ts                # Formatters, helpers
│
└── types/
    ├── product.ts              # Product interface
    ├── search-state.ts         # SearchState interface
    └── delta.ts                # SearchStateDelta interface
```

### Component Responsibilities

| Component | Responsibility | Props / State |
|---|---|---|
| **VoiceButton** | Renders mic button. Manages visual states (idle/listening/processing). Calls `useVoiceInput` hook. On final transcript, triggers `useConverse`. | `isListening`, `isProcessing` from store. `onClick` to start/stop. |
| **TextInput** | Text field + send button. On submit, triggers `useConverse`. | Controlled input value. `onSubmit(text)`. |
| **TranscriptDisplay** | Shows interim transcript while user is speaking. Fades out after final. | `interimTranscript`, `finalTranscript` from store. |
| **ProductGrid** | Renders product cards in a responsive grid. Uses Framer Motion `AnimatePresence` for enter/exit animations. | `products[]` from store. |
| **ProductCard** | Displays product image, name, price, rating, brand. | `product: Product`. |
| **SearchChips** | Maps current search state to visual chips. Each chip shows a label and is removable. | `chips[]` from store. `onRemove(field)` triggers an utterance like "remove {field} filter." |
| **SearchChip** | Individual pill. Color-coded by type. "×" button to remove. | `chip: FilterChip`. `onRemove()`. |
| **AcknowledgmentBar** | Displays AI's acknowledgment text. Auto-fades after 4 seconds. | `acknowledgment: string` from store. |
| **EmptyState** | Shown when products[] is empty. Displays suggestion to relax filters. | `searchState` from store to suggest which filter to remove. |
| **ClarificationBubble** | Small card showing AI's clarifying question. User can respond via text/voice. | `clarification: string | null` from store. |
| **LoadingSkeleton** | Skeleton product cards shown during API call. | `isLoading` from store. |

### Zustand Store

```typescript
// frontend/src/store/useAppStore.ts

interface AppState {
  // Session
  sessionId: string;

  // Search state (mirrors backend)
  searchState: SearchState;

  // Products
  products: Product[];
  totalResults: number;
  isLoading: boolean;

  // Chips
  chips: FilterChip[];

  // Conversation
  acknowledgment: string;
  clarification: string | null;

  // Voice
  isListening: boolean;
  isProcessing: boolean;
  interimTranscript: string;
  finalTranscript: string;

  // Actions
  converse: (utterance: string) => Promise<void>;
  undo: () => Promise<void>;
  reset: () => Promise<void>;
  removeChip: (field: string) => Promise<void>;
  setListening: (v: boolean) => void;
  setInterimTranscript: (v: string) => void;
}
```

### State Management Flow

```
User speaks "Under 1000"
  ↓
VoiceButton calls store.converse("Under 1000")
  ↓
store sets isProcessing = true
  ↓
POST /api/converse → backend
  ↓
Response: { searchState, products, chips, acknowledgment }
  ↓
store.searchState = response.searchState
store.products = response.products
store.chips = response.chips
store.acknowledgment = response.acknowledgment
store.isProcessing = false
  ↓
React re-renders:
  - ProductGrid shows new products (Framer Motion animates transition)
  - SearchChips shows updated chips
  - AcknowledgmentBar shows "Filtered to under ₹1,000"
```

### Product Grid Animations

Using Framer Motion's `AnimatePresence` + `motion.div`:

```tsx
<AnimatePresence mode="popLayout">
  {products.map(product => (
    <motion.div
      key={product.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <ProductCard product={product} />
    </motion.div>
  ))}
</AnimatePresence>
```

This gives us:
- Products that don't match the new state fade out and shrink
- New products fade in and grow
- Remaining products smoothly reflow into new positions
- No jarring full-page reload

### Accessibility

| Concern | Implementation |
|---|---|
| Screen reader | All interactive elements have `aria-label`. Product cards have `alt` text on images. |
| Keyboard navigation | Text input is always available. Tab through chips. Enter to submit. |
| Color contrast | Tailwind's default palette meets WCAG AA. Dark mode uses sufficient contrast. |
| Focus management | After results update, focus returns to the input area, not the top of the page. |
| Reduced motion | Respect `prefers-reduced-motion`. Disable Framer Motion animations if set. |

---

## 11. Backend Architecture

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app, CORS, lifespan
│   ├── config.py                  # Settings, env vars
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py              # All API endpoints
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── product.py             # Product model
│   │   ├── search_state.py        # SearchState model
│   │   ├── delta.py               # SearchStateDelta model
│   │   └── api.py                 # Request/Response models (ConverseRequest, ConverseResponse, etc.)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── session_service.py     # In-memory session store
│   │   ├── conversation_service.py # Build LLM prompt, call Gemini, validate delta
│   │   ├── state_service.py       # Merge delta into state, manage history
│   │   ├── search_service.py      # Build SQL, query DB, return products
│   │   ├── semantic_service.py    # Tag-based re-ranking
│   │   └── chip_service.py        # Generate FilterChip[] from SearchState
│   │
│   ├── prompts/
│   │   └── intent_system.py       # System prompt as a Python constant
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py            # SQLite connection, init
│   │   └── seed.py                # Load products from JSON into SQLite
│   │
│   └── core/
│       ├── __init__.py
│       └── validation.py          # Post-LLM validation rules
│
├── data/
│   └── products.json              # Seed product catalog
│
├── requirements.txt
├── .env.example
└── README.md
```

### Module Responsibilities

| Module | What It Does | Input | Output |
|---|---|---|---|
| **routes.py** | Defines HTTP endpoints. Validates request. Orchestrates service calls. | HTTP Request | HTTP Response |
| **session_service.py** | Stores `{session_id: {state, history[], conversation[]}}` in a Python dict. Creates new sessions. Retrieves existing sessions. | session_id | Session object |
| **conversation_service.py** | 1. Builds LLM prompt from system prompt + state + history + utterance. 2. Calls Gemini API. 3. Parses JSON response. 4. Validates with Pydantic. 5. Runs post-LLM validation. | utterance, state, history | Validated SearchStateDelta |
| **state_service.py** | Applies SearchStateDelta to current SearchState. Pushes old state to undo stack. Handles RESET and UNDO intent types. | currentState, delta | newState |
| **search_service.py** | Translates SearchState → SQL WHERE clauses. Executes against SQLite. Returns product list. | SearchState | Product[], totalCount |
| **semantic_service.py** | Scores and re-ranks products based on `semantic_modifiers` tag match. | Product[], modifiers[] | Re-ranked Product[] |
| **chip_service.py** | Generates human-readable FilterChip objects from SearchState. Maps field names to display labels. | SearchState | FilterChip[] |
| **validation.py** | Post-LLM validation: normalize categories, clamp prices, validate brands against known list, sanitize. | raw SearchStateDelta | cleaned SearchStateDelta |
| **database.py** | SQLite connection management. Creates `products` table if not exists. | — | db connection |
| **seed.py** | Reads `data/products.json`, inserts into SQLite `products` table. Runs once on first boot. | JSON file | — |

### Request Orchestration Flow in `routes.py`

```python
@router.post("/converse", response_model=ConverseResponse)
async def converse(request: ConverseRequest):
    # 1. Get or create session
    session = session_service.get_or_create(request.session_id)

    # 2. Call LLM to get intent delta
    delta = await conversation_service.extract_intent(
        utterance=request.utterance,
        current_state=session.search_state,
        history=session.conversation_history,
        result_count=session.last_result_count,
    )

    # 3. Handle clarification (no state change)
    if delta.intent_type == IntentType.CLARIFY:
        session.add_message("user", request.utterance)
        session.add_message("assistant", delta.clarification_question)
        return ConverseResponse(
            session_id=request.session_id,
            search_state=session.search_state,
            products=session.last_products,
            total_results=session.last_result_count,
            chips=chip_service.generate(session.search_state),
            acknowledgment=delta.acknowledgment,
            clarification=delta.clarification_question,
        )

    # 4. Merge delta into state
    new_state = state_service.merge(session.search_state, delta, session.state_history)
    session.search_state = new_state

    # 5. Search products
    products, total = await search_service.search(new_state)

    # 6. Semantic re-ranking (if modifiers present)
    if new_state.semantic_modifiers:
        products = semantic_service.rank(products, new_state.semantic_modifiers)

    # 7. Update session
    session.last_products = products
    session.last_result_count = total
    session.add_message("user", request.utterance)
    session.add_message("assistant", delta.acknowledgment)

    # 8. Generate chips
    chips = chip_service.generate(new_state)

    # 9. Zero-result handling
    acknowledgment = delta.acknowledgment
    if total == 0:
        acknowledgment += " No products match all filters. Try removing a constraint."

    return ConverseResponse(
        session_id=request.session_id,
        search_state=new_state,
        products=products,
        total_results=total,
        chips=chips,
        acknowledgment=acknowledgment,
        clarification=None,
    )
```

---

## 12. API Specification

### Endpoint 1: `POST /api/converse`

The primary endpoint. Every user utterance goes through this.

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "utterance": "Show me white sneakers under 1000"
}
```

**Response (200):**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "search_state": {
    "query": null,
    "category": "sneakers",
    "subcategory": null,
    "brand": null,
    "color": "white",
    "min_price": null,
    "max_price": 1000,
    "min_rating": null,
    "size": null,
    "material": null,
    "gender": null,
    "exclude_brands": [],
    "exclude_colors": [],
    "exclude_materials": [],
    "semantic_modifiers": [],
    "sort_by": "relevance"
  },
  "products": [
    {
      "id": "prod_001",
      "name": "Asian Cosmo White Sneakers",
      "description": "Lightweight mesh sneakers for everyday wear",
      "category": "sneakers",
      "subcategory": "casual",
      "brand": "Asian",
      "price": 899,
      "rating": 4.2,
      "review_count": 1250,
      "colors": ["white"],
      "sizes": ["7", "8", "9", "10"],
      "material": "mesh",
      "gender": "men",
      "tags": ["comfortable", "lightweight", "daily-wear"],
      "image_url": "/images/asian_cosmo_white.jpg",
      "in_stock": true
    }
  ],
  "total_results": 23,
  "chips": [
    { "label": "Sneakers", "field": "category", "type": "filter", "removable": true },
    { "label": "White", "field": "color", "type": "filter", "removable": true },
    { "label": "Under ₹1,000", "field": "max_price", "type": "filter", "removable": true }
  ],
  "acknowledgment": "Showing white sneakers under ₹1,000",
  "clarification": null
}
```

**Error Responses:**

| Status | Body | When |
|---|---|---|
| 400 | `{ "detail": "utterance is required" }` | Missing/empty utterance |
| 500 | `{ "detail": "AI service unavailable. Please try again." }` | LLM timeout or error |
| 422 | Pydantic validation error | Malformed request body |

---

### Endpoint 2: `POST /api/converse/undo`

Reverts to the previous search state.

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):** Same shape as `ConverseResponse`. Contains the reverted state and re-fetched products.

**Response (400):** `{ "detail": "Nothing to undo" }` if history stack is empty.

---

### Endpoint 3: `POST /api/converse/reset`

Clears all state. Returns trending/popular products.

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):** Same shape as `ConverseResponse`. Empty state, all products returned.

---

### Endpoint 4: `GET /api/products`

Returns all products (for initial page load before any conversation).

**Response (200):**
```json
{
  "products": [...],
  "total": 87
}
```

---

### Endpoint 5: `GET /api/products/{product_id}`

Returns a single product's full details (for a quick-view modal).

**Response (200):** Single `Product` object.
**Response (404):** `{ "detail": "Product not found" }`

---

### Endpoint 6: `GET /api/health`

Health check for deployment.

**Response (200):** `{ "status": "ok", "version": "1.0.0" }`

---

## 13. State Location Decision

### Comparison

| Approach | Pros | Cons |
|---|---|---|
| **Client-side only** | No session management on server. Simpler backend (stateless). | Search state + conversation history must be sent with every request. Large request payloads. Can't undo without client-side history. State is lost on page refresh (acceptable for hackathon). |
| **Server-side only** | Clean API (just session_id + utterance). Backend has full context for LLM prompt building. Undo is trivial (pop from server-side stack). | Requires session store. State is lost if server restarts (acceptable for hackathon with in-memory store). |
| **Hybrid** | Frontend mirrors backend state for fast UI updates. Backend is source of truth. | Two copies of state to sync. More complex. |

### Recommendation: **Server-side state, frontend mirrors for display**

**Server owns the state.** The frontend sends only `{ session_id, utterance }`. The backend returns the full state + products. The frontend stores the response in Zustand for rendering.

**Why:**
1. **LLM prompt building is server-side.** The server needs the conversation history and current state anyway. If state lives on the client, we'd have to send it all with every request.
2. **Undo is trivial.** Server maintains a history stack. `POST /undo` pops the stack. No client-side history management.
3. **Single source of truth.** No state sync bugs.
4. **Minimal request payload.** `{ session_id: "uuid", utterance: "under 1000" }` — that's it.
5. **Server restart loses sessions.** Acceptable for hackathon. In production, swap the in-memory dict for Redis.

---

## 14. Product Dataset

### Strategy

Create a **hand-crafted JSON seed file** with 80-100 products across 2-3 categories. Focus depth on footwear (the primary demo category).

### Dataset Composition

| Category | Count | Why |
|---|---|---|
| **Sneakers** | 40 | Primary demo category. Needs enough variety for filtering to be interesting. |
| **Running Shoes** | 15 | Demonstrates subcategory distinction. |
| **Casual Shoes** | 10 | Another subcategory. |
| **Formal Shoes** | 5 | Shows breadth. |
| **Headphones** | 10 | Different product category entirely. Shows the system works beyond footwear. |
| **Backpacks** | 7 | Another category for variety. |

**Total: ~87 products**

### Brands to Include (Footwear)

Asian, Nike, Puma, Adidas, Sparx, Campus, Bata, Woodland, Red Tape, Skechers

### Sample Product Entry

```json
{
  "id": "snk_001",
  "name": "Asian Cosmo Men's White Mesh Sneakers",
  "description": "Lightweight and breathable mesh sneakers designed for everyday comfort. Cushioned insole with flexible outsole for all-day wear.",
  "category": "sneakers",
  "subcategory": "casual",
  "brand": "Asian",
  "price": 899,
  "rating": 4.2,
  "review_count": 1250,
  "colors": ["white"],
  "sizes": ["6", "7", "8", "9", "10"],
  "material": "mesh",
  "gender": "men",
  "tags": ["comfortable", "lightweight", "breathable", "daily-wear", "cushioned", "casual"],
  "image_url": "/images/sneakers/asian_cosmo_white.jpg",
  "in_stock": true
}
```

### Image Strategy

Use placeholder product images. Options:
1. **Unsplash/Pexels** — Search for "white sneakers" etc. Download 40-50 images. Rename to match product IDs.
2. **Picsum** — Dynamic placeholder: `https://picsum.photos/seed/{product_id}/400/400` — generates a consistent random image per ID. Not product-realistic but fast.
3. **Generate with AI** — Use image generation to create a few hero product images for the demo.

**Recommendation:** Use real product-category images from Unsplash for the demo category (sneakers). Use Picsum for other categories. The sneaker grid must look real for the demo to land.

### Data Generation Script

Create a Python script that generates the `products.json` with realistic variety:

```python
# scripts/generate_products.py
# Generates 87 products with realistic attributes
# Outputs: data/products.json
```

This script should:
1. Define brand × color × price × tag combinations
2. Generate product names programmatically ("${Brand} ${Model} ${Color} ${Material} ${Category}")
3. Assign realistic ratings (3.0-5.0), review counts (50-5000), prices (₹300-₹5000 for footwear)
4. Tag each product with 3-6 semantic tags from the taxonomy

---

## 15. Amazon & SAVAAN Analysis

### Amazon Integration — Not Recommended

| Concern | Detail |
|---|---|
| **Legal** | Amazon's Terms of Service prohibit automated access, scraping, and use of their product data without explicit permission via the Product Advertising API (PA-API). |
| **PA-API restrictions** | Requires an Amazon Associates account with qualifying sales. Rate-limited. Returns limited product data. |
| **Fragility** | Any scraping-based approach will break during the hackathon (CAPTCHAs, IP blocking, HTML changes). |
| **Demo risk** | If the Amazon integration fails during the demo, the entire product is dead. Unacceptable risk. |

**Verdict:** Do NOT depend on Amazon for the hackathon. Build our own demo catalog.

### SAVAAN Consideration

The hackathon organizer's platform SAVAAN is relevant because:
- The challenge is "Build the Next SAVAAN Search"
- Judges may expect to see integration with SAVAAN

**However:** Our selected problem statement is "Conversational Shopping — Replace filters with natural language." This is a standalone product concept, not a SAVAAN feature request.

**Strategy:**
1. Build VoiceFilter as a **platform-independent engine**.
2. All product data access goes through an abstract `ProductRepository` interface.
3. The MVP implementation uses SQLite behind that interface.
4. Mention in the demo: "This engine can plug into any product catalog — including SAVAAN — via a simple adapter."
5. If SAVAAN provides an API or data dump, we can create a `SavaanProductRepository` that maps their schema to ours. But this is NOT on the critical path.

### Architecture for Platform Independence

```python
# backend/app/repositories/base.py

from abc import ABC, abstractmethod

class ProductRepository(ABC):
    @abstractmethod
    async def search(self, state: SearchState) -> tuple[list[Product], int]:
        pass

    @abstractmethod
    async def get_by_id(self, product_id: str) -> Product | None:
        pass

# backend/app/repositories/sqlite_repo.py
class SqliteProductRepository(ProductRepository):
    # MVP implementation

# backend/app/repositories/savaan_repo.py (future)
class SavaanProductRepository(ProductRepository):
    # Maps SAVAAN API to our Product schema
```

---

## 16. Environment Setup

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20.x LTS | https://nodejs.org/ or `nvm install 20` |
| Python | 3.11+ | https://python.org/ or `pyenv install 3.11` |
| Git | 2.x | https://git-scm.com/ |
| VS Code | Latest | https://code.visualstudio.com/ |

### Step-by-Step Setup

```bash
# 1. Clone and enter the repo
git clone <repo-url> voicefilter
cd voicefilter

# 2. Backend setup
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt

# 3. Create .env from example
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Seed the database
python -m app.db.seed

# 5. Start backend
uvicorn app.main:app --reload --port 8000

# 6. Frontend setup (new terminal)
cd frontend
npm install

# 7. Create frontend .env
cp .env.example .env.local
# Edit: NEXT_PUBLIC_API_URL=http://localhost:8000

# 8. Start frontend
npm run dev
# → http://localhost:3000
```

### `.env.example` (Backend)

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
DATABASE_PATH=./voicefilter.db
LLM_MODEL=gemini-2.0-flash
LLM_TEMPERATURE=0.1
MAX_CONVERSATION_HISTORY=8
PORT=8000
DEBUG=true
```

### `.env.example` (Frontend)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### `requirements.txt` (Backend)

```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
pydantic>=2.0
google-generativeai>=0.8.0
aiosqlite>=0.20.0
python-dotenv>=1.0.0
```

### `package.json` key dependencies (Frontend)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^19.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

---

## 17. Repository Structure

```
voicefilter/
├── frontend/                          # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── VoiceButton.tsx
│   │   │   ├── TextInput.tsx
│   │   │   ├── TranscriptDisplay.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── SearchChips.tsx
│   │   │   ├── SearchChip.tsx
│   │   │   ├── AcknowledgmentBar.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ClarificationBubble.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   └── Header.tsx
│   │   ├── hooks/
│   │   │   ├── useVoiceInput.ts
│   │   │   └── useConverse.ts
│   │   ├── store/
│   │   │   └── useAppStore.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   └── types/
│   │       ├── product.ts
│   │       ├── search-state.ts
│   │       └── delta.ts
│   ├── public/
│   │   └── images/                    # Product images
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── .env.example
│
├── backend/                           # FastAPI app
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── product.py
│   │   │   ├── search_state.py
│   │   │   ├── delta.py
│   │   │   └── api.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── session_service.py
│   │   │   ├── conversation_service.py
│   │   │   ├── state_service.py
│   │   │   ├── search_service.py
│   │   │   ├── semantic_service.py
│   │   │   └── chip_service.py
│   │   ├── prompts/
│   │   │   └── intent_system.py
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   └── seed.py
│   │   └── core/
│   │       ├── __init__.py
│   │       └── validation.py
│   ├── data/
│   │   └── products.json
│   ├── tests/
│   │   ├── test_state_service.py
│   │   ├── test_search_service.py
│   │   ├── test_validation.py
│   │   └── test_conversation_flow.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── scripts/
│   ├── generate_products.py           # Product data generator
│   └── test_llm.py                    # Standalone LLM prompt tester
│
├── docs/
│   ├── prd.md                         # Product Requirements Document
│   └── architecture.md                # This document
│
├── .gitignore
└── README.md
```

---

## 18. Git Commit Plan

Each commit leaves the project in a runnable state.

| # | Commit Message | What's Included | Runnable? |
|---|---|---|---|
| 1 | `init: project scaffolding` | Repo structure, `.gitignore`, README, both `.env.example` files, empty `package.json` and `requirements.txt` | Shell only |
| 2 | `backend: FastAPI skeleton + health endpoint` | `main.py`, `config.py`, `routes.py` with `/health`, CORS setup, `requirements.txt` filled | `uvicorn app.main:app` → `/health` returns ok |
| 3 | `data: product schemas + seed catalog` | `schemas/product.py`, `data/products.json` (87 products), `db/database.py`, `db/seed.py` | Seed script populates SQLite |
| 4 | `backend: GET /api/products endpoint` | Product listing endpoint, SQLite reads | `GET /api/products` returns all products |
| 5 | `frontend: Next.js skeleton + product grid` | Next.js init, `ProductGrid`, `ProductCard`, `Header`, fetch from `/api/products` on load | Grid displays all products |
| 6 | `frontend: styling + product cards polish` | Tailwind config, card design, responsive grid, dark mode | Visually polished product grid |
| 7 | `backend: search state + search service` | `schemas/search_state.py`, `search_service.py` — SQL query builder, filtering by state | Internally testable |
| 8 | `backend: LLM intent engine + delta schema` | `schemas/delta.py`, `conversation_service.py`, `prompts/intent_system.py`, Gemini API integration | LLM returns structured delta |
| 9 | `backend: state merger + session service` | `state_service.py`, `session_service.py` — merge delta, manage sessions | State transitions work |
| 10 | `backend: POST /api/converse endpoint` | Full orchestration in `routes.py`, chip generation | `POST /api/converse` returns filtered products |
| 11 | `frontend: text input + converse flow` | `TextInput`, `useConverse` hook, Zustand store, chips display | Text conversation works end-to-end |
| 12 | `frontend: voice input` | `VoiceButton`, `useVoiceInput` hook, `TranscriptDisplay` | Voice conversation works |
| 13 | `backend: semantic ranking + validation` | `semantic_service.py`, `validation.py` — tag-based re-ranking, post-LLM validation | "comfortable" query re-ranks correctly |
| 14 | `polish: animations, empty state, undo, demo hardening` | Framer Motion grid transitions, `EmptyState`, undo endpoint, loading skeletons, acknowledgment bar animation | Demo-ready |

---

## 19. Implementation Roadmap

### Phase 1: Foundation (Day 1 morning — ~3 hours)

**Goal:** Product data exists. Backend serves products. Frontend displays them in a beautiful grid.

**Build:**
- Backend: FastAPI skeleton, SQLite setup, seed script, `GET /api/products`
- Frontend: Next.js setup, product grid, product cards, responsive layout, dark mode
- Data: 87 products in `products.json`

**Files:** Commits 1-6 from the commit plan.

**Definition of Done:**
- `http://localhost:3000` shows a beautiful product grid with 87 real products
- Grid is responsive (2 columns mobile, 3-4 desktop)
- No AI, no voice, no conversation yet — but it looks like a real e-commerce site

**Test:** Visual inspection. Products load. Grid is responsive.

**Why first:** If the grid doesn't look good, nothing else matters. The grid IS the product. Build it first, polish it, get it right.

---

### Phase 2: Search Engine (Day 1 afternoon — ~2 hours)

**Goal:** Backend can take a SearchState and return filtered products.

**Build:**
- `SearchState` schema
- `search_service.py` — SQL query builder
- Test with hardcoded search states

**Files:** `schemas/search_state.py`, `services/search_service.py`

**Definition of Done:**
- Given `{ category: "sneakers", color: "white", maxPrice: 1000 }`, the search service returns only white sneakers under ₹1000
- All filter fields work: brand, color, price range, rating, material, gender
- Exclusions work: `excludeColors: ["black"]` removes black products

**Test:** Unit tests with hardcoded SearchState objects against the seeded DB.

---

### Phase 3: LLM Intent Engine (Day 1 evening — ~3 hours)

**Goal:** LLM receives an utterance + context and returns a valid SearchStateDelta.

**Build:**
- System prompt (in `prompts/intent_system.py`)
- `SearchStateDelta` schema
- `conversation_service.py` — prompt building, Gemini API call, response parsing
- `validation.py` — post-LLM validation
- Standalone test script to iterate on prompt quality

**Files:** `schemas/delta.py`, `services/conversation_service.py`, `prompts/intent_system.py`, `core/validation.py`, `scripts/test_llm.py`

**Definition of Done:**
- "Show me white sneakers" → `{ intent_type: NEW_SEARCH, set_category: "sneakers", set_color: "white" }`
- "Under 1000" → `{ intent_type: REFINE, set_max_price: 1000 }`
- "Only Asian" → `{ intent_type: REFINE, set_brand: "Asian" }`
- "Remove the brand" → `{ intent_type: REMOVE, remove_fields: ["brand"] }`
- Response is valid JSON, passes Pydantic validation

**Test:** `scripts/test_llm.py` — run 10+ test utterances, print delta, verify manually.

**Why this phase is the riskiest:** If the LLM doesn't produce reliable structured output, the product is broken. Spend time here iterating on the system prompt. Test edge cases.

---

### Phase 4: State Machine + Full Conversation API (Day 2 morning — ~2 hours)

**Goal:** `POST /api/converse` works end-to-end. Multi-turn conversation produces correct cumulative state.

**Build:**
- `state_service.py` — state merger
- `session_service.py` — in-memory session store
- `chip_service.py` — generate chips from state
- `POST /api/converse` endpoint orchestration
- `POST /api/converse/undo` and `/reset`

**Files:** `services/state_service.py`, `services/session_service.py`, `services/chip_service.py`, `api/routes.py`

**Definition of Done:**
- Send 5 sequential requests to `/api/converse` with the same session_id
- Each response shows the correct cumulative state
- Products returned match the state
- Undo reverts to previous state

**Test:** Use `curl` or Postman to send the 5-turn sneaker conversation. Verify each response.

---

### Phase 5: Frontend Conversation (Day 2 afternoon — ~3 hours)

**Goal:** User can type in the frontend, see products update, see chips appear/disappear.

**Build:**
- `TextInput` component
- `useConverse` hook (API call)
- Zustand store with full state management
- `SearchChips` + `SearchChip` (with remove)
- `AcknowledgmentBar`
- `EmptyState`
- `LoadingSkeleton`

**Files:** All frontend `components/`, `hooks/`, `store/`, `lib/api.ts`

**Definition of Done:**
- Type "white sneakers" → grid shows white sneakers, chips show [Sneakers] [White]
- Type "under 1000" → grid updates, chip [Under ₹1,000] appears
- Type "only Asian" → grid updates, chip [Asian] appears
- Click "×" on brand chip → sends "remove brand filter" → chip disappears, grid opens up
- Acknowledgment bar shows AI response, auto-fades

**Test:** Manual. Walk through the 5-turn demo conversation in the browser.

---

### Phase 6: Voice Input (Day 2 evening — ~2 hours)

**Goal:** User can tap mic, speak, see transcript, see products update.

**Build:**
- `VoiceButton` component (idle/listening/processing states)
- `useVoiceInput` hook (Web Speech API)
- `TranscriptDisplay` (shows interim text while speaking)
- Wire voice output into `useConverse`

**Files:** `components/VoiceButton.tsx`, `hooks/useVoiceInput.ts`, `components/TranscriptDisplay.tsx`

**Definition of Done:**
- Tap mic → button changes to "Listening" state → speak → transcript appears → products update
- Voice follows the same 5-turn conversation successfully
- If mic permission denied, text input still works
- Mic button shows appropriate error for unsupported browsers

**Test:** Manual. Do the full demo by voice in Chrome.

---

### Phase 7: Polish & Demo Hardening (Day 3 — ~4 hours)

**Goal:** The demo is visually stunning and handles edge cases gracefully.

**Build:**
- Framer Motion grid transitions (products fade in/out smoothly)
- Chip animations (slide in/out)
- Mic waveform animation
- Dark mode by default (looks better in demos)
- Semantic tag matching (`semantic_service.py`)
- Zero-result handling with suggestion
- Clarification display
- Negation and relative adjustment verification
- Mobile responsive final check
- Error state handling (LLM timeout, network error)
- Demo script run-through: practice the exact demo 3+ times

**Definition of Done:**
- Run the full 3-minute demo script from the PRD without any failures
- Products animate smoothly on every state change
- Chips animate in/out
- "Something comfortable" re-ranks correctly
- Zero-result state shows helpful message
- Mic errors are handled gracefully
- The app looks stunning

---

## 20. Testing Strategy

### Unit Tests (Backend — pytest)

#### State Merger Tests (`test_state_service.py`)

These are the most critical tests. They verify that the state machine works correctly **independently of the LLM**.

```python
def test_new_search_clears_previous_state():
    """NEW_SEARCH should start from blank state."""
    current = SearchState(category="sneakers", color="white", max_price=1000)
    delta = SearchStateDelta(
        intent_type=IntentType.NEW_SEARCH,
        set_category="phones",
    )
    result = merge_state(current, delta)
    assert result.category == "phones"
    assert result.color is None       # Cleared
    assert result.max_price is None   # Cleared

def test_refine_preserves_existing_state():
    """REFINE should keep fields not mentioned in delta."""
    current = SearchState(category="sneakers", color="white")
    delta = SearchStateDelta(
        intent_type=IntentType.REFINE,
        set_max_price=1000,
    )
    result = merge_state(current, delta)
    assert result.category == "sneakers"  # Preserved
    assert result.color == "white"        # Preserved
    assert result.max_price == 1000       # Added

def test_refine_overwrites_existing_value():
    """REFINE with set_max_price overwrites existing max_price."""
    current = SearchState(category="sneakers", max_price=1000)
    delta = SearchStateDelta(
        intent_type=IntentType.REFINE,
        set_max_price=1500,
    )
    result = merge_state(current, delta)
    assert result.max_price == 1500

def test_remove_field():
    """REMOVE should set the specified field to None."""
    current = SearchState(category="sneakers", brand="Asian", color="white")
    delta = SearchStateDelta(
        intent_type=IntentType.REMOVE,
        remove_fields=["brand"],
    )
    result = merge_state(current, delta)
    assert result.brand is None
    assert result.category == "sneakers"  # Preserved
    assert result.color == "white"        # Preserved

def test_negate_adds_exclusion():
    """NEGATE should add to exclude lists."""
    current = SearchState(category="sneakers", exclude_colors=[])
    delta = SearchStateDelta(
        intent_type=IntentType.NEGATE,
        add_exclude_colors=["black"],
    )
    result = merge_state(current, delta)
    assert "black" in result.exclude_colors

def test_semantic_modifier_added():
    """Semantic modifiers should accumulate."""
    current = SearchState(category="sneakers", semantic_modifiers=[])
    delta = SearchStateDelta(
        intent_type=IntentType.REFINE,
        add_semantic=["comfortable"],
    )
    result = merge_state(current, delta)
    assert "comfortable" in result.semantic_modifiers

def test_reset_clears_everything():
    """RESET should return empty state."""
    current = SearchState(category="sneakers", brand="Asian", max_price=1000)
    delta = SearchStateDelta(intent_type=IntentType.RESET)
    result = merge_state(current, delta)
    assert result.category is None
    assert result.brand is None
    assert result.max_price is None

def test_undo_reverts_to_previous():
    """UNDO should pop and return the previous state."""
    # Setup: push a state to history, then undo
    previous = SearchState(category="sneakers", color="white")
    current = SearchState(category="sneakers", color="white", brand="Asian")
    history = [previous]
    delta = SearchStateDelta(intent_type=IntentType.UNDO)
    result = merge_state(current, delta, history)
    assert result.brand is None
    assert result.color == "white"

def test_multiple_exclusions_accumulate():
    """Multiple negations should build up the exclusion list."""
    current = SearchState(exclude_colors=["black"])
    delta = SearchStateDelta(
        intent_type=IntentType.NEGATE,
        add_exclude_colors=["red"],
    )
    result = merge_state(current, delta)
    assert set(result.exclude_colors) == {"black", "red"}

def test_remove_exclusion():
    """Removing an exclusion should take it out of the list."""
    current = SearchState(exclude_brands=["Nike", "Puma"])
    delta = SearchStateDelta(
        intent_type=IntentType.REFINE,
        remove_exclude_brands=["Nike"],
    )
    result = merge_state(current, delta)
    assert "Nike" not in result.exclude_brands
    assert "Puma" in result.exclude_brands
```

#### Search Service Tests (`test_search_service.py`)

```python
def test_filter_by_category():
    products = search(SearchState(category="sneakers"))
    assert all(p.category == "sneakers" for p in products)

def test_filter_by_color():
    products = search(SearchState(color="white"))
    assert all("white" in [c.lower() for c in p.colors] for p in products)

def test_filter_by_max_price():
    products = search(SearchState(max_price=1000))
    assert all(p.price <= 1000 for p in products)

def test_combined_filters():
    products = search(SearchState(category="sneakers", color="white", max_price=1000))
    for p in products:
        assert p.category == "sneakers"
        assert "white" in [c.lower() for c in p.colors]
        assert p.price <= 1000

def test_exclusion_filter():
    products = search(SearchState(category="sneakers", exclude_colors=["black"]))
    for p in products:
        assert "black" not in [c.lower() for c in p.colors]

def test_empty_state_returns_all():
    products = search(SearchState())
    assert len(products) > 0  # Returns all in-stock products
```

#### Validation Tests (`test_validation.py`)

```python
def test_invalid_category_normalized():
    delta = SearchStateDelta(set_category="sneekers")  # Typo
    validated = validate_delta(delta)
    assert validated.set_category == "sneakers"  # Fuzzy matched

def test_negative_price_clamped():
    delta = SearchStateDelta(set_max_price=-500)
    validated = validate_delta(delta)
    assert validated.set_max_price == 0

def test_rating_clamped():
    delta = SearchStateDelta(set_min_rating=7.0)
    validated = validate_delta(delta)
    assert validated.set_min_rating == 5.0
```

### Integration Test (`test_conversation_flow.py`)

End-to-end test of the full 5-turn demo conversation:

```python
async def test_demo_conversation():
    session_id = "test-session"

    # Turn 1: White sneakers
    r1 = await converse(session_id, "Show me white sneakers")
    assert r1.search_state.category == "sneakers"
    assert r1.search_state.color == "white"
    assert r1.total_results > 0

    # Turn 2: Under 1000
    r2 = await converse(session_id, "Under 1000")
    assert r2.search_state.max_price == 1000
    assert r2.search_state.category == "sneakers"  # Preserved
    assert r2.total_results <= r1.total_results

    # Turn 3: Only Asian
    r3 = await converse(session_id, "Only Asian")
    assert r3.search_state.brand.lower() == "asian"
    assert r3.search_state.max_price == 1000  # Preserved

    # Turn 4: Make it 1500
    r4 = await converse(session_id, "Actually make it 1500")
    assert r4.search_state.max_price == 1500
    assert r4.search_state.brand.lower() == "asian"  # Preserved

    # Turn 5: Remove brand
    r5 = await converse(session_id, "Remove the brand restriction")
    assert r5.search_state.brand is None
    assert r5.search_state.max_price == 1500  # Preserved
```

---

## 21. Reliability & Guardrails

### Defense Layers

```
Layer 1: LLM prompt constraints     → "Never invent brands or prices"
Layer 2: Gemini structured output    → JSON schema enforcement
Layer 3: Pydantic validation         → Type checking on delta
Layer 4: Post-LLM validation         → Category allowlist, price clamping, normalization
Layer 5: State merger validation     → Don't apply contradictory changes
Layer 6: Search engine              → Only returns real products from DB
```

### Specific Guardrails

| Risk | Guardrail |
|---|---|
| LLM invents a brand that doesn't exist in our DB | **Pre-validation:** Check `set_brand` against the list of brands actually in the database. If not found, fuzzy match. If no match, drop the brand filter and add a note to acknowledgment: "I couldn't find that brand." |
| LLM invents a category | Category allowlist validation. Reject unknown categories. |
| LLM sets `set_max_price` to nonsensical value (e.g., 0 or 999999) | Clamp to category-specific ranges. Footwear: ₹100–₹50,000. |
| LLM returns `intent_type: REFINE` but also sets fields it shouldn't | For REFINE, only apply `set_*` fields that are non-null. Null fields are explicitly ignored. The merger never touches fields the LLM didn't mention. |
| LLM returns invalid JSON | Gemini structured output mode enforces the schema. If it still fails (rare), retry once. If still invalid, return error to user. |
| LLM tries to REFINE when there's no existing search | If current state is completely empty and intent is REFINE, treat as NEW_SEARCH. |
| State becomes self-contradictory (e.g., min_price > max_price) | After merge, validate: if `min_price > max_price`, drop `min_price`. |
| User tries SQL injection via utterance | Utterance never touches SQL directly. It goes through LLM → structured delta → parameterized SQL. Injection is impossible. |
| LLM produces UNDO but history is empty | Return current state unchanged with acknowledgment "Nothing to undo." |

### Logging

Log every conversation turn for debugging:

```python
logger.info(f"[{session_id}] Utterance: {utterance}")
logger.info(f"[{session_id}] Current state: {current_state.model_dump_json()}")
logger.info(f"[{session_id}] LLM raw output: {raw_llm_response}")
logger.info(f"[{session_id}] Validated delta: {delta.model_dump_json()}")
logger.info(f"[{session_id}] New state: {new_state.model_dump_json()}")
logger.info(f"[{session_id}] Products found: {total_count}")
```

This is invaluable during the hackathon for debugging why the wrong products appeared.

---

## 22. Performance Targets

### Latency Budget

| Component | Target | Realistic | Notes |
|---|---|---|---|
| Web Speech API (voice → text) | <500ms | 300-500ms | Runs during speech, result is near-instant after user stops |
| HTTP round-trip (frontend ↔ backend) | <100ms | 50-100ms (local), 100-300ms (deployed) | Keep frontend and backend co-located |
| LLM inference (Gemini 2.0 Flash) | <600ms | 300-600ms | Use `temperature=0.1`, short prompts |
| Post-LLM validation | <5ms | <1ms | Pure Python computation |
| State merge | <5ms | <1ms | Pure Python computation |
| SQL query + search | <50ms | 10-50ms | SQLite with <500 rows |
| Semantic re-ranking | <10ms | <5ms | Simple tag matching over <50 products |
| Frontend render | <100ms | 50-100ms | React re-render + Framer Motion |
| **Total (voice)** | **<2s** | **~1.0-1.5s** | ✅ |
| **Total (text)** | **<1.5s** | **~0.5-1.0s** | ✅ |

### Optimization Strategies

1. **Keep conversation history short.** Send only the last 8 messages to the LLM. This keeps prompt tokens low and inference fast.
2. **Use Gemini Flash, not Pro.** Flash is 2-3x faster for our use case.
3. **Temperature 0.1.** Low temperature = faster, more deterministic output.
4. **Structured output mode.** Gemini spends less time on free-form generation when constrained to a JSON schema.
5. **Optimistic UI.** Show "Updating..." immediately when the user stops speaking. Don't wait for the response to show loading state.
6. **No unnecessary LLM calls.** If the user clicks "×" on a chip, we can bypass the LLM entirely: directly modify the state and re-query. This saves ~500ms.

---

## 23. Cost Analysis

### Per-Turn Cost Breakdown

| Component | Tokens/Call | Cost/Call | Notes |
|---|---|---|---|
| **System prompt** | ~800 tokens | — | Sent every call (could cache with Gemini context caching) |
| **Conversation history (8 msgs)** | ~400 tokens | — | |
| **Current state JSON** | ~200 tokens | — | |
| **User utterance** | ~20 tokens | — | |
| **Total input** | ~1,400 tokens | $0.00014 | At $0.10/1M input tokens |
| **LLM output** | ~200 tokens | $0.00008 | At $0.40/1M output tokens |
| **Web Speech API** | 0 | $0.00 | Free (browser-native) |
| **SQLite query** | 0 | $0.00 | Local DB |
| **Total per turn** | — | **~$0.0002** | |
| **Per session (10 turns)** | — | **~$0.002** | |
| **Hackathon (500 sessions)** | — | **~$1.00** | |

**Conclusion:** Cost is negligible. The entire hackathon will cost less than a cup of coffee.

### Cost-Saving Strategies (Post-Hackathon)

1. **Cache common queries.** "Show me white sneakers" can be cached → skip LLM entirely.
2. **Deterministic shortcuts.** Chip removal clicks bypass LLM (see §24).
3. **Gemini context caching.** Cache the system prompt as a reusable context (saves ~800 input tokens per call).
4. **Shorter conversation history.** Send only the last 4-6 messages instead of 8.
5. **Move simple intents to rules.** "Start over" and "undo" don't need LLM — detect them with regex.

---

## 24. AI vs Deterministic

| Task | AI | Deterministic | Rationale |
|---|---|---|---|
| **Speech-to-text** | ✅ | — | Web Speech API uses Google's ML models |
| **Intent classification** | ✅ | — | Natural language understanding requires LLM |
| **Entity extraction** | ✅ | — | Extracting "Asian" as a brand, "1000" as max_price requires understanding |
| **Relative adjustment** ("cheaper") | ✅ | — | LLM must interpret context and compute new value |
| **Negation parsing** ("not black") | ✅ | — | LLM handles complex negation patterns |
| **Clarification generation** | ✅ | — | LLM generates natural clarifying questions |
| **Delta validation** | — | ✅ | Allowlists, clamping, normalization — no AI needed |
| **State merge** | — | ✅ | Apply delta to state — pure logic, no AI |
| **SQL query building** | — | ✅ | Translate state to WHERE clauses — deterministic mapping |
| **Product search/retrieval** | — | ✅ | Database query — must return real data, never hallucinated |
| **Semantic tag matching** | — | ✅ | String matching against product tags — no embedding model needed |
| **Chip generation** | — | ✅ | Map state fields to display labels — pure formatting |
| **Zero-result detection** | — | ✅ | Check `len(products) == 0` — trivial |
| **Zero-result suggestion** | — | ✅* | Identify most restrictive filter by testing each removal — deterministic. (*Could enhance with AI later.) |
| **Render UI** | — | ✅ | React rendering — obviously deterministic |
| **Undo** | — | ✅ | Pop from history stack — pure logic |
| **Reset** | — | ✅ | Return empty SearchState — trivial |
| **Chip removal** (user clicks ×) | — | ✅ | Directly modify state, skip LLM entirely |
| **"Start over" detection** | — | ✅ | Simple regex/keyword match — no LLM needed |
| **"Undo" / "go back" detection** | — | ✅ | Simple regex/keyword match |

**Key insight:** The LLM is used ONLY for understanding natural language. Everything downstream of the delta is deterministic. This is what makes the system reliable and non-hallucinating.

### Deterministic Shortcut Optimization

Before calling the LLM, check if the utterance matches simple patterns:

```python
DETERMINISTIC_PATTERNS = {
    r"^(start over|reset|clear|new search)$": IntentType.RESET,
    r"^(undo|go back|previous)$": IntentType.UNDO,
}

def try_deterministic(utterance: str) -> SearchStateDelta | None:
    """Skip LLM for trivially simple utterances."""
    text = utterance.lower().strip()
    for pattern, intent in DETERMINISTIC_PATTERNS.items():
        if re.match(pattern, text):
            return SearchStateDelta(
                intent_type=intent,
                acknowledgment="Starting over" if intent == IntentType.RESET else "Going back"
            )
    return None  # Needs LLM
```

This saves ~500ms and an LLM call for common operations.

---

## 25. Final Architecture Diagram

```
                        ┌──────────────┐
                        │     USER     │
                        └──────┬───────┘
                               │
                    Voice      │     Text
                    ┌──────────┼──────────┐
                    ▼          │          ▼
            ┌──────────────┐   │   ┌──────────────┐
            │ Web Speech   │   │   │  Text Input  │
            │ API (browser)│   │   │  Component   │
            └──────┬───────┘   │   └──────┬───────┘
                   │           │          │
                   └───────────┼──────────┘
                               │
                          text string
                               │
                 ══════════════╪══════════════  HTTP boundary
                               │
                        POST /api/converse
                        { session_id, utterance }
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Deterministic     │──── match? ───► Skip LLM
                    │   Shortcut Check    │                 (undo/reset)
                    └──────────┬──────────┘
                               │ no match
                               ▼
                    ┌─────────────────────┐
                    │   Session Manager   │
                    │                     │
                    │  Load: history[],   │
                    │  currentState       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Conversation       │
                    │  Manager            │
                    │                     │
                    │  Build prompt:      │
                    │  system + state +   │
                    │  history + utterance│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Gemini 2.0 Flash   │◄── AI boundary
                    │  (structured JSON)  │
                    └──────────┬──────────┘
                               │
                       SearchStateDelta (raw)
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Delta Validator    │◄── Deterministic
                    │                     │
                    │  - Allowlists       │
                    │  - Clamping         │
                    │  - Normalization    │
                    └──────────┬──────────┘
                               │
                     SearchStateDelta (validated)
                               │
                               ▼
                    ┌─────────────────────┐
                    │  State Merger       │◄── Deterministic
                    │                     │
                    │  Apply delta to     │
                    │  current state.     │
                    │  Push old to history│
                    └──────────┬──────────┘
                               │
                         SearchState (new)
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Search Service     │◄── Deterministic
                    │  (SQLite)           │
                    │                     │
                    │  State → SQL WHERE  │
                    │  Execute query      │
                    └──────────┬──────────┘
                               │
                          Product[] (filtered)
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Semantic Ranker    │◄── Deterministic
                    │  (tag matching)     │
                    │                     │
                    │  If semantic_mods:  │
                    │    re-rank by tags  │
                    └──────────┬──────────┘
                               │
                          Product[] (ranked)
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Chip Generator     │◄── Deterministic
                    │                     │
                    │  State → chips[]    │
                    └──────────┬──────────┘
                               │
                 ══════════════╪══════════════  HTTP boundary
                               │
                        JSON Response
                        { state, products[],
                          chips[], ack }
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Zustand Store      │
                    │  (Frontend state)   │
                    └──────────┬──────────┘
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
        ┌────────────┐  ┌────────────┐  ┌────────────┐
        │ Product    │  │  Search    │  │  Ack Bar   │
        │ Grid       │  │  Chips     │  │            │
        │ (animated) │  │ (animated) │  │ (auto-fade)│
        └────────────┘  └────────────┘  └────────────┘
```

---

## 26. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **LLM produces wrong intent type** (REFINE when should be NEW_SEARCH) | Medium | High — wrong state | Extensive few-shot examples in system prompt. Integration test for common flows. |
| R2 | **LLM loses context on follow-ups** ("under 1000" not linked to existing search) | Medium | High — broken USP | Always send current state and conversation history. Test multi-turn flows rigorously. |
| R3 | **Web Speech API fails in demo environment** (noisy room, browser issue) | Medium | High — no voice | Always have text input as equal fallback. Test mic in the actual demo room. Have a pre-typed demo script ready. |
| R4 | **Gemini API rate limit or outage** | Low | Critical — entire product down | Have OpenAI API key as backup. Swap is a one-line config change. |
| R5 | **LLM latency spikes** (>3s) | Medium | Medium — feels slow | Show optimistic "Updating..." UI. Use Flash (fastest model). Keep prompts short. |
| R6 | **Product grid animations jank** on low-end devices | Low | Medium — poor impression | Test on budget Android phone. Use `will-change: transform` hints. Respect `prefers-reduced-motion`. |
| R7 | **State becomes inconsistent** (contradictory filters) | Low | Medium | Post-merge validation: clamp prices, check consistency. Log every state transition. |
| R8 | **Demo product data doesn't match queries well** | Medium | High — wrong demo impression | Test every demo utterance against the seed data before the demo. Ensure white Asian sneakers under ₹1000 exist. |
| R9 | **Judge asks "what about X?" for unbuilt features** | High | Low | Have a "vision" slide ready. Acknowledge: "That's in our roadmap. For this demo, we focused on the core interaction." |
| R10 | **Team runs out of time on LLM prompt tuning** | Medium | High | Start LLM work early (Phase 3, Day 1). Use `scripts/test_llm.py` to iterate fast. |

---

## 27. Final Deliverables Summary

### A. Tech Stack
Next.js + TypeScript + Tailwind (frontend) | FastAPI + Python + Pydantic (backend) | Gemini 2.0 Flash (LLM) | Web Speech API (STT) | SQLite (DB)

### B. Architecture
Modular monolith. Two processes: Next.js dev server + FastAPI server. See §25 diagram.

### C. Repository Structure
See §17. Monorepo with `frontend/` and `backend/` directories.

### D. Data Schemas
See §4. Product, SearchState, SearchStateDelta — Pydantic + TypeScript.

### E. API Specification
See §12. Primary endpoint: `POST /api/converse`. Plus undo, reset, products list, health.

### F. LLM Prompt
See §5.1. Complete system prompt with 15 rules, output schema, and intent type definitions.

### G. State Merge Algorithm
See §6. Pseudocode for `merge_state(current, delta)`.

### H. Semantic Search
See §8. Tag-based matching + re-ranking. No vector DB.

### I. Voice Strategy
See §9. Web Speech API, push-to-talk, Chrome/Edge.

### J. Implementation Roadmap
See §19. 7 phases over ~3 days. Foundation → Search → LLM → State Machine → Frontend Conversation → Voice → Polish.

### K. Testing Plan
See §20. 15+ unit tests for state merger, search service, validation. 1 integration test for full conversation flow.

### L. Hackathon Cut List
See §3. No accounts, no cart, no Hindi, no cross-platform, no comparison, no recommendations, no analytics.

### M. Risk Register
See §26. 10 risks with mitigations.

### N. Start Coding Now Checklist
See §28 below.

---

## 28. Start Coding Now Checklist

The first 20 tasks to execute, in order:

- [ ] **1.** Create the monorepo structure: `voicefilter/frontend/`, `voicefilter/backend/`, `voicefilter/data/`, `voicefilter/scripts/`
- [ ] **2.** Initialize Next.js in `frontend/`: `npx -y create-next-app@latest ./` with TypeScript, Tailwind, App Router
- [ ] **3.** Initialize FastAPI in `backend/`: Create `requirements.txt`, `app/main.py` with health endpoint, CORS middleware
- [ ] **4.** Create `.env.example` files for both frontend and backend
- [ ] **5.** Create `.gitignore` (Node, Python, SQLite, .env)
- [ ] **6.** Write `backend/app/schemas/product.py` — Product Pydantic model
- [ ] **7.** Write `frontend/src/types/product.ts` — Product TypeScript interface
- [ ] **8.** Write `scripts/generate_products.py` — generate 87 products → `data/products.json`
- [ ] **9.** Write `backend/app/db/database.py` — SQLite connection + table creation
- [ ] **10.** Write `backend/app/db/seed.py` — load `products.json` into SQLite
- [ ] **11.** Write `backend/app/api/routes.py` — `GET /api/products` endpoint
- [ ] **12.** Write `frontend/src/components/ProductCard.tsx` — beautiful product card
- [ ] **13.** Write `frontend/src/components/ProductGrid.tsx` — responsive grid layout
- [ ] **14.** Wire `page.tsx` to fetch products from backend and render grid
- [ ] **15.** Polish: dark mode, card hover effects, responsive grid, typography
- [ ] **16.** Write `backend/app/schemas/search_state.py` and `delta.py`
- [ ] **17.** Write `backend/app/services/search_service.py` — SQL query builder
- [ ] **18.** Write `backend/app/prompts/intent_system.py` — system prompt
- [ ] **19.** Write `backend/app/services/conversation_service.py` — Gemini API integration
- [ ] **20.** Write `scripts/test_llm.py` — test the prompt with 10 example utterances

> [!TIP]
> **After task 15**, you should have a visually stunning product grid with no AI. This is your safety net — if everything else fails, at least you have a beautiful product page.
>
> **After task 20**, you should know whether the LLM reliably produces correct structured output. This is the highest-risk component. If it doesn't work well, you have time to iterate on the prompt.

---

*End of Implementation Plan — VoiceFilter v1.0*
