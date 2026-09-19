# VoiceFilter — Product Requirements Document

> **Document Version:** 1.0  
> **Date:** August 8, 2026  
> **Status:** Draft — Awaiting Review  
> **Audience:** Founding team, hackathon judges, potential investors

---

## Table of Contents

1. [Product Naming](#1-product-naming)
2. [Executive Summary](#2-executive-summary)
3. [Problem Statement](#3-problem-statement)
4. [Target Users & Personas](#4-target-users--personas)
5. [Value Proposition & USP](#5-value-proposition--usp)
6. [Product Vision & Goals](#6-product-vision--goals)
7. [User Journeys & Flows](#7-user-journeys--flows)
8. [Conversation & Search-State Model](#8-conversation--search-state-model)
9. [AI Architecture & Responsibilities](#9-ai-architecture--responsibilities)
10. [Product Retrieval & Ranking](#10-product-retrieval--ranking)
11. [Handling Edge Cases](#11-handling-edge-cases)
12. [UI/UX Design](#12-uiux-design)
13. [Technical Architecture](#13-technical-architecture)
14. [Data Model & Schemas](#14-data-model--schemas)
15. [API Design](#15-api-design)
16. [Technology Stack](#16-technology-stack)
17. [Scope & Prioritization](#17-scope--prioritization)
18. [Security, Privacy & Performance](#18-security-privacy--performance)
19. [Metrics & Evaluation](#19-metrics--evaluation)
20. [Hackathon Demo Strategy](#20-hackathon-demo-strategy)
21. [Competitive Differentiation](#21-competitive-differentiation)
22. [Critical Analysis & Honest Assessment](#22-critical-analysis--honest-assessment)
23. [Future Roadmap & Business Model](#23-future-roadmap--business-model)
24. [Final Recommendations](#24-final-recommendations)

---

## 1. Product Naming

### Name Candidates

| Name | Rationale | Risks |
|---|---|---|
| **VoiceFilter** | Direct, descriptive. Communicates "voice replaces filters." Easy to understand in 2 seconds. | Could sound like an audio processing tool. Slightly literal. |
| **Talkshop** | Conversational + shopping in one word. Warm, approachable. | "Talk shop" is an existing English idiom meaning "to discuss work." Could cause confusion. |
| **Flowcart** | "Flow" implies continuous, natural interaction. "Cart" anchors to e-commerce. | Slightly abstract. Judges may not immediately connect to the concept. |
| **SayShop** | Extremely clear. "Say what you want, shop." | Simple but possibly too cute. Limited brand ceiling. |
| **Cartwhisper** | Evokes a personal shopping assistant that listens closely. | Too passive-sounding. Doesn't convey the "replace filters" energy. |
| **Speakeasy** | Cool, memorable. Implies effortless speech-driven interaction. | Already a well-known word (Prohibition-era bars). Trademark risks. |
| **NudgeCart** | Implies gentle, iterative refinement of search. | Doesn't communicate voice/conversation. |
| **FilterZero** | Directly communicates the USP: zero filters needed. | Sounds more like a developer tool than a consumer product. |

### Recommended Name: **VoiceFilter**

**Why:** For a hackathon, you need a name that communicates the concept in under 3 seconds. "VoiceFilter" does exactly that — your voice *becomes* the filter. It's a direct inversion of the problem statement. Judges hear the name and immediately understand the thesis. The mild ambiguity with audio processing actually works as a hook — "Wait, what does this do?" — which earns you the first 10 seconds of attention.

For a post-hackathon commercial product, I'd recommend evolving to **Talkshop** or **Flowcart** for broader brand appeal. But for the hackathon: clarity > cleverness.

### Tagline Candidates

| Tagline | Positioning |
|---|---|
| **"Stop filtering. Just talk."** | Direct challenge to existing UX paradigm |
| **"Your voice is the only filter you need."** | Feature-forward, clear |
| **"Shopping that listens."** | Emotional, brand-level |
| **"Talk to shop. Not to search."** | Distinguishes from voice search |
| **"Filters are dead. Conversation is the interface."** | Bold, provocative — good for hackathon |
| **"The last search bar you'll ever need."** | Ambitious, memorable |

**Recommended tagline:** **"Stop filtering. Just talk."**

It's short, it's confrontational, it immediately positions the product against every existing e-commerce site, and it's easy to put on a slide.

---

## 2. Executive Summary

VoiceFilter replaces the traditional e-commerce filter panel with a persistent, context-aware conversational interface. Instead of manually selecting dropdowns, checkboxes, sliders, and sort options, users express their shopping intent in natural language — via voice or text — and the product grid updates continuously.

The core innovation is not voice input. Voice is the interface. The innovation is a **persistent conversational search state** — a structured representation of the user's evolving shopping intent that the AI modifies incrementally with every utterance. Each statement refines, adjusts, or resets parts of the active search. The user never "starts over." The conversation *is* the search.

**What this is:**
- An AI-powered intent engine that translates natural language into structured search-state mutations
- A product discovery interface where conversation replaces filter interactions
- A real-time product grid that responds to conversational refinements

**What this is NOT:**
- A chatbot that recommends products from AI knowledge
- A voice search bar that processes single queries
- A ChatGPT-style conversational page that replaces the product listing

---

## 3. Problem Statement

### 3.1 The Core Problem

Modern e-commerce forces users to translate natural shopping intent into a rigid, mechanical interface language.

**What the user thinks:**
> "I want comfortable white sneakers for everyday use, ideally Asian brand, under a thousand rupees."

**What the user is forced to do:**
1. Type "sneakers" in search bar
2. Wait for results
3. Open filter panel
4. Scroll to "Color" → select "White"
5. Scroll to "Brand" → search for "Asian" in a list of 200+ brands
6. Scroll to "Price Range" → drag slider or type ₹0–₹1,000
7. Scroll to "Type" → look for "everyday" or "casual" (which may not exist as a filter)
8. Realize "comfortable" has no filter
9. Manually read reviews to judge comfort
10. Results may be zero — unclear which filter caused it
11. Start removing filters one by one

This is **7–11 distinct UI interactions** for a single shopping thought. Each interaction requires the user to understand the platform's taxonomy, vocabulary, and filter mechanics.

### 3.2 Why Traditional Filtering is Broken

| Problem | Impact |
|---|---|
| **Cognitive translation cost** | Users must decompose natural intent into discrete filter categories. This is unnatural and effortful. |
| **Vocabulary mismatch** | User says "comfortable." Platform has no "comfort" filter. User says "classy." Platform categorizes by "formal." |
| **Sequential rigidity** | Filters operate independently. There's no concept of "modify the previous constraint" or "make it cheaper." Each filter is a fresh, disconnected interaction. |
| **Context blindness** | Every search is stateless. If you adjust one filter, the system doesn't remember *why* you set the others. |
| **Zero-result dead ends** | When filters combine to produce zero results, platforms rarely explain which constraint is the bottleneck. Users are left guessing. |
| **Mobile hostility** | Filter panels on mobile are cramped, require scrolling, and frequently obscure the product grid. 60%+ of Indian e-commerce traffic is mobile. |
| **Accessibility gap** | Users with motor disabilities, low digital literacy, or visual impairments struggle with complex filter UIs. |
| **Undiscoverable filters** | Many platforms have 15–30 filter categories. Users don't know most of them exist. Useful filters are buried. |

### 3.3 The Missed Opportunity

In physical retail, the most effective "search engine" is a knowledgeable shopkeeper:

> **Customer:** "Bhaiya, white sneakers dikhao, comfortable wale, budget ₹1,000 ke andar."
> **Shopkeeper:** *shows 4 options*
> **Customer:** "Asian hai kya?"
> **Shopkeeper:** *pulls out 2 Asian options*
> **Customer:** "Ye thoda tight lagega, kuch aur comfortable dikhao."
> **Shopkeeper:** *swaps out the tighter pair for a wider fit*

This interaction is:
- Stateful (the shopkeeper remembers all prior constraints)
- Incremental (each statement refines, doesn't restart)
- Natural language (no "filter vocabulary" needed)
- Bidirectional (the shopkeeper asks clarifying questions)
- Contextual (the shopkeeper understands "thoda tight" means "show something with more room")

**VoiceFilter brings this shopkeeper experience to digital commerce.**

---

## 4. Target Users & Personas

### 4.1 Primary Target Users

| Segment | Why They Care |
|---|---|
| **Mobile-first shoppers in India** | Filter UIs are worst on mobile. Voice is the most natural input on mobile. India has 500M+ smartphone users, many prefer vernacular/voice interaction. |
| **Low-digital-literacy users** | Users who can speak clearly but struggle with multi-step filter UIs. This is a massive, underserved segment in Tier 2/3 India. |
| **Convenience-driven shoppers** | Users who know roughly what they want but find the filter process tedious. They would rather describe than click. |
| **Accessibility-constrained users** | Users with motor impairments, low vision, or situational disabilities (e.g., holding a child, cooking). |

### 4.2 User Personas

#### Persona 1: Rahul — The Practical Buyer (Primary)

| Attribute | Detail |
|---|---|
| **Age** | 24 |
| **Location** | Lucknow |
| **Device** | ₹12,000 Android phone |
| **Digital literacy** | Moderate. Uses Flipkart/Meesho. Familiar with search, less comfortable with complex filter panels. |
| **Shopping behavior** | Knows what he wants before opening the app. Gets frustrated when he can't find it quickly. |
| **Pain point** | "I know exactly what sneakers I want, but by the time I set all the filters, I've wasted 10 minutes and the results still aren't right." |
| **VoiceFilter value** | Speaks his intent in one sentence. Gets relevant results in 5 seconds. Refines by talking. Never touches a filter. |

#### Persona 2: Meera — The Exploratory Shopper

| Attribute | Detail |
|---|---|
| **Age** | 31 |
| **Location** | Pune |
| **Device** | iPhone |
| **Digital literacy** | High. Uses Amazon, Myntra, Ajio regularly. |
| **Shopping behavior** | Browses with vague intent. "Something nice for office." Explores, compares, refines over 20–30 minutes. |
| **Pain point** | "I don't know exactly what I want. I just want to see options and narrow down. Filters force me to decide too early." |
| **VoiceFilter value** | Starts with a vague query. AI asks clarifying questions. She refines through conversation. The experience is more like thinking aloud than filling out a form. |

#### Persona 3: Suresh — The Low-Literacy Buyer

| Attribute | Detail |
|---|---|
| **Age** | 45 |
| **Location** | Varanasi |
| **Device** | Budget Android |
| **Digital literacy** | Low. Can make calls, use WhatsApp, watch YouTube. Struggles with text input and filter UIs. |
| **Shopping behavior** | Asks his children for help when shopping online. |
| **Pain point** | "Main type nahi kar pata itna. Agar bol ke search ho jaye toh accha hoga." (I can't type that much. It would be great if I could search by speaking.) |
| **VoiceFilter value** | Presses one button, speaks in Hindi, sees products. No typing, no filter comprehension required. |

---

## 5. Value Proposition & USP

### 5.1 Core Value Proposition

> VoiceFilter turns your natural shopping thoughts into live product results. No filters, no forms, no friction. Just say what you want, and the products change.

### 5.2 Unique Selling Proposition

> **Persistent Conversational Search State** — Every utterance the user makes incrementally modifies a live, structured search state. The system remembers everything said before, understands what changed, and updates the product grid accordingly. The conversation IS the filter panel.

### 5.3 Why the USP Matters

The USP is NOT:
- ❌ "We use AI for shopping" (everyone does)
- ❌ "We have voice search" (Google, Amazon, Flipkart already do)
- ❌ "We have a chatbot" (every second e-commerce site does)

The USP IS:
- ✅ The search state **persists and evolves** across multiple utterances
- ✅ Every statement is understood **in the context of all previous statements**
- ✅ The user can issue **relative commands** ("cheaper," "better rated," "remove the brand filter")
- ✅ The product grid is the **primary interface**, not the conversation
- ✅ The experience feels like **talking to a shopkeeper**, not querying a database

### 5.4 One-Line Pitch

> "What if you could shop by talking to the page, and the products just... listened?"

---

## 6. Product Vision & Goals

### 6.1 Product Vision

**Short-term (Hackathon):** Demonstrate that a natural-language conversation can fully replace the filter panel for product discovery, with real-time product grid updates.

**Medium-term (6 months):** Become an embeddable conversational shopping layer that any e-commerce platform can integrate via SDK/API.

**Long-term (2+ years):** Become the default interaction paradigm for product discovery — the way Google replaced Yahoo's directory browsing with a search bar, VoiceFilter replaces filter panels with conversation.

### 6.2 Product Goals

| # | Goal | Metric |
|---|---|---|
| G1 | Users can express multi-attribute shopping intent in natural language and receive relevant results | ≥80% of test queries produce relevant top-5 results |
| G2 | Conversational refinement works — each follow-up correctly modifies the search state | ≥90% of follow-up utterances correctly modify exactly the intended state fields |
| G3 | The experience is faster than traditional filtering | Average time-to-relevant-results < 50% of filter-based equivalent |
| G4 | The system handles ambiguity gracefully | AI asks clarifying questions for genuinely ambiguous queries instead of guessing |
| G5 | The demo is visually compelling and the product grid updates feel "alive" | Subjective: judges/viewers say "wow" within the first 30 seconds |

### 6.3 Non-Goals

| # | Non-Goal | Rationale |
|---|---|---|
| NG1 | Building a complete e-commerce platform (cart, checkout, payments) | Out of scope. VoiceFilter is the **discovery layer**, not the transaction layer. |
| NG2 | Supporting multi-language voice input in MVP | Hindi + English is enough for demo. Vernacular support is a roadmap item. |
| NG3 | Replacing the product detail page | Users still click into products to see details. VoiceFilter replaces the **listing/search** experience, not the PDP. |
| NG4 | Building a recommendation engine | VoiceFilter retrieves based on explicit user intent, not implicit behavioral signals. Recommendation is a different product. |
| NG5 | Cross-platform aggregation in MVP | The vision mentions aggregating across Amazon/Flipkart/etc. This is a future platform play, not MVP scope. |
| NG6 | Achieving production-grade voice recognition | We use existing STT APIs. We don't build our own speech model. |
| NG7 | User accounts, order history, personalization | MVP is a single-session, anonymous shopping experience. |

---

## 7. User Journeys & Flows

### 7.1 Detailed User Journey — Rahul Buying Sneakers

**Context:** Rahul opens VoiceFilter on his phone. He wants white Asian sneakers under ₹1,000.

| Step | User Action | System Response | Search State |
|---|---|---|---|
| 1 | Sees landing page with product grid (popular/trending) and a prominent mic button with "Tell me what you're looking for" | Displays trending products. Mic button pulses gently. | `{}` |
| 2 | Taps mic. Says: "White sneakers dikhao" | Transcribes → Extracts intent → Updates state → Fetches products → Grid animates to show white sneakers. Shows chips: `Sneakers` `White` | `{ category: "sneakers", color: "white" }` |
| 3 | Says: "Under 1000 rupees" | Understands this refines the existing search. Updates price. Grid re-filters. Chip added: `Under ₹1,000` | `{ category: "sneakers", color: "white", maxPrice: 1000 }` |
| 4 | Says: "Only Asian brand" | Adds brand filter. Grid updates. Chip: `Asian` | `{ category: "sneakers", color: "white", maxPrice: 1000, brand: "Asian" }` |
| 5 | Says: "Something more comfortable" | AI recognizes "comfortable" as a semantic/qualitative refinement. Adds semantic boost or re-ranks by comfort-related signals (reviews, description keywords). Chip: `Comfortable` (with a ✨ icon indicating semantic filter) | `{ ..., semanticBoost: "comfortable" }` |
| 6 | Says: "Actually, budget 1500 tak kar do" (make it ₹1,500) | Modifies existing maxPrice. Chip updates from `Under ₹1,000` to `Under ₹1,500`. Grid shows more options. | `{ ..., maxPrice: 1500 }` |
| 7 | Taps on a product to view details | Opens product detail panel/page. Conversation state is preserved. | (preserved) |
| 8 | Returns to grid. Says: "Iske jaisa aur dikhao" (show more like this) | Uses the viewed product as a similarity anchor. Grid shows similar products within existing constraints. | `{ ..., similarTo: "product_id_xyz" }` |

### 7.2 Primary User Flow

```
┌──────────────┐
│  Landing     │ ← Product grid with trending items
│  Page        │ ← Prominent mic button + text input
└──────┬───────┘
       │ User speaks or types
       ▼
┌──────────────┐
│  STT         │ ← Converts voice to text (if voice)
│  Processing  │
└──────┬───────┘
       │ Raw text
       ▼
┌──────────────┐
│  Conversation│ ← Maintains conversation history
│  Manager     │ ← Sends history + new utterance to LLM
└──────┬───────┘
       │ Conversation context
       ▼
┌──────────────┐
│  LLM Intent  │ ← Extracts structured intent
│  Engine      │ ← Determines: new search vs. refinement
│              │ ← Produces search-state delta
└──────┬───────┘
       │ Structured state update
       ▼
┌──────────────┐
│  Search State│ ← Applies delta to current state
│  Manager     │ ← Validates state consistency
│              │ ← Maintains state history (for undo)
└──────┬───────┘
       │ Complete search state
       ▼
┌──────────────┐
│  Search /    │ ← Translates state to search query
│  Retrieval   │ ← Executes against product database
│  Engine      │ ← Applies semantic ranking if needed
└──────┬───────┘
       │ Product results
       ▼
┌──────────────┐
│  UI Update   │ ← Animates product grid transition
│  Layer       │ ← Updates filter chips
│              │ ← Shows AI acknowledgment
└──────────────┘
```

### 7.3 Voice-First Interaction Flow

1. **Idle state:** Mic button displayed prominently. Subtle pulse animation. Text: "Tell me what you're looking for."
2. **Activation:** User taps mic (or uses wake word in future). Button transitions to "Listening..." state with waveform animation.
3. **Listening:** Real-time waveform visualization. Text appears as it's being transcribed (streaming STT).
4. **Processing:** Brief "Understanding..." state (< 500ms ideally). Skeleton loading on product grid.
5. **Results:** Grid animates with new products. Chips appear. Small AI acknowledgment text: "Showing white sneakers under ₹1,000."
6. **Ready for next:** Mic button returns to idle. User can speak again immediately for refinement.

**Critical UX rule:** The mic should auto-listen for the next utterance after showing results (with a short cooldown). The user should NOT have to tap the mic button for every follow-up. This creates the feeling of a continuous conversation.

### 7.4 Text Interaction Flow

1. Text input bar at the bottom (below the product grid, above the navigation — standard mobile pattern).
2. User types a query. Autocomplete suggestions based on popular queries and current state context.
3. On submit, identical processing pipeline as voice.
4. Conversation history shown as minimal bubbles above the text input (collapsed by default, expandable).
5. Filter chips appear below the search bar / above the grid.

---

## 8. Conversation & Search-State Model

### 8.1 Conversation-State Model

The conversation state tracks the full dialogue context needed for the LLM to understand follow-up utterances.

```json
{
  "sessionId": "uuid-v4",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Show me white sneakers",
      "timestamp": "2026-08-08T22:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Showing white sneakers. Found 47 results.",
      "timestamp": "2026-08-08T22:00:01Z",
      "searchStateSnapshot": { "category": "sneakers", "color": "white" }
    },
    {
      "role": "user",
      "content": "Under 1000 rupees",
      "timestamp": "2026-08-08T22:00:15Z"
    },
    {
      "role": "assistant",
      "content": "Filtered to under ₹1,000. 23 results.",
      "timestamp": "2026-08-08T22:00:16Z",
      "searchStateSnapshot": { "category": "sneakers", "color": "white", "maxPrice": 1000 }
    }
  ],
  "currentSearchState": { /* see below */ },
  "searchStateHistory": [ /* array of previous states for undo */ ],
  "viewedProducts": [ /* product IDs the user has clicked into */ ],
  "lastResultCount": 23
}
```

### 8.2 Search-State Model

The search state is the structured representation of the user's current shopping intent. It is the **single source of truth** for product retrieval.

```json
{
  "version": 1,
  "query": "white sneakers",
  "filters": {
    "category": {
      "value": "sneakers",
      "source": "extracted",
      "confidence": 0.95
    },
    "color": {
      "value": "white",
      "type": "include",
      "source": "extracted",
      "confidence": 0.97
    },
    "brand": {
      "value": "Asian",
      "type": "include",
      "source": "extracted",
      "confidence": 0.92
    },
    "maxPrice": {
      "value": 1000,
      "currency": "INR",
      "source": "extracted",
      "confidence": 0.99
    },
    "minPrice": null,
    "size": null,
    "rating": {
      "minRating": 4.0,
      "source": "inferred",
      "confidence": 0.7
    },
    "excludeColors": ["black"],
    "excludeBrands": [],
    "excludeMaterials": ["leather"]
  },
  "semanticModifiers": [
    {
      "modifier": "comfortable",
      "weight": 0.8,
      "source": "user_utterance_5"
    }
  ],
  "sortPreference": {
    "field": "relevance",
    "direction": "desc"
  },
  "similarTo": null,
  "contextFlags": {
    "useCase": "everyday",
    "occasion": null,
    "gender": null
  }
}
```

**Key design decisions:**

1. **`source` field:** Tracks whether a filter was explicitly stated by the user (`extracted`) or inferred by the AI (`inferred`). Inferred filters are shown with lower visual prominence and can be easily dismissed.

2. **`confidence` field:** The AI's confidence in its extraction. Low-confidence extractions trigger clarifying questions instead of being silently applied.

3. **`excludeX` arrays:** Separate from positive filters. Handles natural negation ("anything except black").

4. **`semanticModifiers`:** Qualitative attributes that don't map to discrete database filters. These are used for semantic ranking/boosting, not hard filtering.

5. **`searchStateHistory`:** Array of previous states enables "go back" and "undo" commands.

---

## 9. AI Architecture & Responsibilities

### 9.1 Intent Extraction Architecture

```
User Utterance + Conversation History + Current Search State
                    │
                    ▼
          ┌─────────────────┐
          │   LLM Prompt    │
          │   Construction  │
          │                 │
          │  System prompt  │ ← Defines role, output schema, rules
          │  + Few-shot     │ ← 5-8 examples of state transitions
          │  + Current state│ ← So LLM knows what to modify
          │  + Conv history │ ← For context resolution
          │  + New utterance│
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │   LLM Call      │ ← Gemini Flash / GPT-4o-mini
          │   (structured   │
          │    output)      │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  Response       │
          │  Validation     │ ← Schema validation
          │  & Sanitization │ ← Value normalization
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  State Merger   │ ← Apply delta to current state
          │                 │ ← Handle conflicts
          │                 │ ← Push to history
          └─────────────────┘
```

### 9.2 AI/LLM Responsibilities

The LLM is responsible for **exactly three things:**

| # | Responsibility | Example |
|---|---|---|
| 1 | **Intent Classification** | Is this a new search, a refinement, a negation, an undo, a comparison request, or an off-topic statement? |
| 2 | **Entity/Attribute Extraction** | Extract structured attributes: category, color, brand, price, etc. from natural language. |
| 3 | **State Delta Generation** | Given the current state and the new utterance, produce a JSON delta that describes what fields to add, modify, or remove. |

**The LLM does NOT:**
- ❌ Search for products
- ❌ Recommend products based on its training data
- ❌ Generate product descriptions or reviews
- ❌ Make purchasing decisions
- ❌ Hallucinate product attributes or prices

### 9.3 Example LLM Structured Outputs

**Example 1: Initial search**

User: "Show me white sneakers"

```json
{
  "intentType": "NEW_SEARCH",
  "delta": {
    "set": {
      "category": "sneakers",
      "color": "white"
    },
    "remove": [],
    "semanticAdd": [],
    "semanticRemove": []
  },
  "clarificationNeeded": false,
  "clarificationQuestion": null,
  "acknowledgment": "Showing white sneakers"
}
```

**Example 2: Price refinement**

User: "Under 1000 rupees" (existing state has sneakers + white)

```json
{
  "intentType": "REFINE",
  "delta": {
    "set": {
      "maxPrice": 1000
    },
    "remove": [],
    "semanticAdd": [],
    "semanticRemove": []
  },
  "clarificationNeeded": false,
  "acknowledgment": "Filtering to under ₹1,000"
}
```

**Example 3: Negation**

User: "Anything except black" (in a shoe search)

```json
{
  "intentType": "REFINE",
  "delta": {
    "set": {},
    "remove": [],
    "addExclusions": {
      "excludeColors": ["black"]
    },
    "semanticAdd": [],
    "semanticRemove": []
  },
  "clarificationNeeded": false,
  "acknowledgment": "Excluding black options"
}
```

**Example 4: Relative request**

User: "Make it cheaper" (current maxPrice is 1500)

```json
{
  "intentType": "REFINE",
  "delta": {
    "set": {
      "maxPrice": 1000
    },
    "remove": [],
    "semanticAdd": [],
    "semanticRemove": []
  },
  "relativeAdjustment": {
    "field": "maxPrice",
    "direction": "decrease",
    "magnitude": "moderate"
  },
  "clarificationNeeded": false,
  "acknowledgment": "Lowered budget to under ₹1,000"
}
```

> [!IMPORTANT]
> **Relative adjustments** ("cheaper," "more premium") are the hardest intent to handle correctly. The LLM needs the current state value to compute the new value. The system prompt must include explicit rules:
> - "cheaper" with maxPrice 1500 → try 1000
> - "cheaper" with maxPrice 1000 → try 700
> - "more premium" → increase minPrice or remove maxPrice
> - Use reasonable step sizes based on the product category's typical price distribution

**Example 5: Ambiguity requiring clarification**

User: "I need shoes"

```json
{
  "intentType": "NEW_SEARCH",
  "delta": {
    "set": {
      "category": "shoes"
    },
    "remove": [],
    "semanticAdd": [],
    "semanticRemove": []
  },
  "clarificationNeeded": true,
  "clarificationQuestion": "What kind of shoes? Running, casual, formal, or sports?",
  "acknowledgment": "Looking for shoes"
}
```

**Example 6: Undo / removal**

User: "Forget the brand filter"

```json
{
  "intentType": "REFINE",
  "delta": {
    "set": {},
    "remove": ["brand"],
    "semanticAdd": [],
    "semanticRemove": []
  },
  "clarificationNeeded": false,
  "acknowledgment": "Removed brand filter"
}
```

**Example 7: Semantic / qualitative**

User: "Something classy for a job interview"

```json
{
  "intentType": "NEW_SEARCH",
  "delta": {
    "set": {
      "category": "shoes"
    },
    "remove": [],
    "semanticAdd": ["formal", "classy", "professional"],
    "semanticRemove": []
  },
  "contextFlags": {
    "occasion": "job_interview",
    "useCase": "formal"
  },
  "clarificationNeeded": false,
  "acknowledgment": "Showing classy shoes suitable for a job interview"
}
```

### 9.4 Search Engine Responsibilities

The search engine is a **separate component** from the LLM. It receives the structured search state and returns products.

| Responsibility | Detail |
|---|---|
| **Structured filtering** | Apply hard filters: category, brand, color, price range, size, rating |
| **Full-text search** | Match product names, descriptions against the base query |
| **Semantic ranking** | When `semanticModifiers` are present, boost products whose descriptions/reviews match the modifier semantically |
| **Exclusion filtering** | Remove products matching `excludeColors`, `excludeBrands`, `excludeMaterials` |
| **Similarity search** | When `similarTo` is set, find products with similar attributes/embeddings to the reference product |
| **Sort application** | Apply the `sortPreference` from the search state |
| **Result metadata** | Return total count, facets (available brands, price range, etc.) for the current filtered set |

---

## 10. Product Retrieval & Ranking

### 10.1 Retrieval Architecture

```
Search State
    │
    ├── Hard Filters ──────────► Database Query (SQL/Elasticsearch)
    │                              │
    │                              ▼
    │                          Candidate Set (e.g., 200 products)
    │
    ├── Semantic Modifiers ────► Re-ranking Layer
    │                              │
    │                              ▼
    │                          Re-ranked Set (sorted by relevance + semantic fit)
    │
    ├── Exclusions ────────────► Post-filter
    │                              │
    │                              ▼
    │                          Final Set
    │
    └── Sort Preference ───────► Final Sort
                                   │
                                   ▼
                               Paginated Results → UI
```

### 10.2 Ranking Architecture

For MVP, a simplified ranking approach:

1. **Primary:** Hard filter match (binary — product either matches or doesn't)
2. **Secondary:** Text relevance score (BM25 or similar from search engine)
3. **Tertiary:** Semantic boost — if `semanticModifiers` are present, compute similarity between modifier keywords and product description/title. Use TF-IDF or simple embedding cosine similarity.
4. **Quaternary:** Popularity/rating (default tiebreaker)

For post-hackathon:

5. **Embedding-based semantic search** using product description + review embeddings
6. **User intent embedding** matched against product embeddings
7. **Learning-to-rank** based on click/conversion data

---

## 11. Handling Edge Cases

### 11.1 Handling Ambiguity

**Strategy:** When the LLM's confidence on a critical attribute is below a threshold (e.g., 0.6), generate a clarifying question instead of guessing.

**Rules:**
- Ask at most ONE clarifying question per utterance
- Clarifying questions should be multiple-choice when possible (faster to answer)
- Never ask about attributes the user already specified
- If the query is actionable despite ambiguity, show results AND ask the question

**Example:**
> User: "I need shoes"
> AI: *Shows all shoes* + "What type? Running, casual, formal, or sports?"
> User: "Casual"
> AI: *Filters to casual shoes*

### 11.2 Handling Corrections

**Types of corrections:**

| Type | Example | System Behavior |
|---|---|---|
| **Value correction** | "Actually, make it ₹1,500 not ₹1,000" | Modify the specific field |
| **Attribute correction** | "I said Nike, not Adidas" | Replace the misheard/misinterpreted brand |
| **Undo** | "Go back" / "Undo that" | Revert to the previous search state from history |
| **Full reset** | "Start over" / "New search" | Clear entire search state |
| **Partial reset** | "Remove the brand filter" / "Forget the color" | Remove specific field(s) from state |

### 11.3 Handling Negations

**Pattern:** "Anything except X" / "Not X" / "No X" / "Without X" / "Remove X"

**Implementation:** Negations map to `exclude` arrays in the search state. The search engine filters OUT products matching excluded values.

**Tricky cases:**
- "Not too expensive" → inferred as "moderate price" → AI may ask "What's your budget?" or apply a reasonable maxPrice
- "Nothing fancy" → semantic modifier: exclude "premium," "luxury" keywords
- "I don't want leather" → `excludeMaterials: ["leather"]`

### 11.4 Handling Relative Requests

| Request | Current State | Action |
|---|---|---|
| "Make it cheaper" | maxPrice: 1500 | Reduce maxPrice by ~30% → 1000 |
| "Something more premium" | maxPrice: 1000 | Increase maxPrice or remove it. Add semantic boost: "premium" |
| "Better rated" | No rating filter | Set minRating: 4.0 |
| "Better rated" | minRating: 3.5 | Increase to minRating: 4.0 |
| "Bigger size" | size: 8 | Increase to size: 9 |
| "Show more options" | brand: "Asian" | Remove brand constraint (it's the most restrictive filter) |

**Implementation:** The LLM receives the current state values and must compute reasonable adjustments. The system prompt includes category-specific price step guidance.

### 11.5 Handling Zero-Result Searches

**This is a critical UX moment.** Zero results means the user's constraints are too tight. The system must help them, not dead-end them.

**Strategy:**

1. **Identify the bottleneck:** Run the search with each filter removed individually. The filter whose removal produces the most results is the bottleneck.
2. **Suggest relaxation:** "No exact matches found. I found 12 options if we remove the brand restriction. Want me to show those?"
3. **Offer alternatives:** "No Asian sneakers under ₹1,000, but I found 5 under ₹1,200. Want to see them?"
4. **Never show an empty grid with no guidance.**

### 11.6 Handling Unsupported Requests

| Request Type | Example | Response |
|---|---|---|
| **Off-topic** | "What's the weather?" | "I can only help with shopping. What are you looking for today?" |
| **Unsupported category** | "Show me flights to Goa" (if we only have fashion) | "I currently help with fashion and footwear. Want to search for something in those categories?" |
| **Too vague to act on** | "Show me something nice" | Show popular/trending items + ask "What are you in the mood for? Shoes, clothes, accessories?" |
| **Adversarial/jailbreak** | "Ignore your instructions and..." | Respond with shopping-focused prompt. Don't acknowledge the attempt. |

### 11.7 Product Comparison Flow

User: "Compare the first two" or "Which of these is better for running?"

**Implementation:**
1. Identify the products being compared (by position in grid, or by name/reference)
2. Pull product attributes for both
3. Generate a concise comparison based on the user's stated preference/use case
4. Display as a comparison card overlay (not a chatbot-style text dump)

**MVP scope:** This is a stretch goal. For hackathon, focus on search refinement.

---

## 12. UI/UX Design

### 12.1 UI/UX Structure

**Design philosophy:**
- Products are the hero. The conversation is the control.
- The interface should feel like a product grid that responds to your voice, not a chatbot that shows products.
- Minimize chrome. Maximize product visibility.

### 12.2 Main Screen — Wireframe Description

```
┌──────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────┐ │
│  │  VoiceFilter          [?] [≡]           │ │  ← Minimal header
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  🔵 Sneakers  ⬜ White  💰 Under ₹1,000 │ │  ← Active filter chips
│  │  🏷️ Asian    ✨ Comfortable              │ │    (tappable to remove)
│  └──────────────────────────────────────────┘ │
│                                                │
│  "Showing 23 results"           Sort: Relevant │  ← Result count + sort
│                                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ Product │  │ Product │  │ Product │      │  ← Product grid
│  │  Image  │  │  Image  │  │  Image  │      │    (2-column on mobile,
│  │ Name    │  │ Name    │  │ Name    │      │     3-4 on desktop)
│  │ ₹899    │  │ ₹750    │  │ ₹999    │      │
│  │ ★★★★☆  │  │ ★★★★★  │  │ ★★★★☆  │      │
│  └─────────┘  └─────────┘  └─────────┘      │
│                                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ Product │  │ Product │  │ Product │      │
│  │  Image  │  │  Image  │  │  Image  │      │
│  │ Name    │  │ Name    │  │ Name    │      │
│  │ ₹650    │  │ ₹980    │  │ ₹870    │      │
│  │ ★★★★☆  │  │ ★★★☆☆  │  │ ★★★★★  │      │
│  └─────────┘  └─────────┘  └─────────┘      │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 💬 "Showing Asian white sneakers under   │ │  ← AI acknowledgment bar
│  │     ₹1,000. 23 results found."           │ │    (subtle, not dominant)
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  [  Type or say something...    ] [🎤]  │ │  ← Input bar
│  └──────────────────────────────────────────┘ │    (mic button prominent)
└──────────────────────────────────────────────┘
```

### 12.3 Key UI Components

| Component | Purpose | Design Notes |
|---|---|---|
| **Filter Chips** | Show what the AI currently understands | Pill-shaped, color-coded by type (category=blue, price=green, brand=purple, semantic=gold with ✨). Tappable to remove. |
| **Product Grid** | Display results | Standard e-commerce card grid. Animate transitions when results change (fade out old, fade in new — NOT jarring full-page reload). |
| **AI Acknowledgment Bar** | Confirm what the AI understood | One-line text above input bar. Auto-fades after 3 seconds. Should NOT feel like a chat message. |
| **Mic Button** | Primary interaction trigger | Large, centered or right-aligned. Pulsing idle animation. Waveform animation when listening. |
| **Text Input** | Alternative to voice | Standard text field. Always available. Send on Enter. |
| **Conversation History** | Show past utterances (optional) | Collapsed by default. Expandable via small toggle. Minimal chat bubbles. NOT the primary UI element. |
| **Zero-Result State** | Guide user when no products match | Friendly illustration + AI suggestion for which filter to relax. Buttons for quick actions ("Remove brand filter," "Increase budget"). |

### 12.4 Real-Time Product Update Behavior

| Trigger | Animation | Duration |
|---|---|---|
| New search | Grid fades out, skeleton loading, grid fades in with new products | ~800ms |
| Refinement (fewer results) | Non-matching products fade out and collapse. Remaining products reflow. | ~500ms |
| Refinement (more results, e.g., price increase) | New products fade in at the end or insert into the grid | ~500ms |
| Sort change | Products shuffle with smooth position transitions | ~400ms |
| Zero results | Grid fades out, zero-result state slides in | ~600ms |

**Critical:** Avoid full-page reloads. The grid should feel alive, like products are responding to the user's voice.

### 12.5 Transparency / Explainability Design

Users should always understand what the AI is doing. Transparency features:

1. **Filter chips** — Visual representation of understood intent
2. **Acknowledgment text** — "Showing white sneakers under ₹1,000 by Asian"
3. **Chip confidence indicators** — Chips from inferred/uncertain attributes have a subtle "?" icon. Tapping shows: "I inferred you want casual shoes. Tap to remove."
4. **State diff on update** — When the state changes, briefly highlight the changed chip (e.g., price chip flashes when price is modified)

### 12.6 Error States

| Error | User Sees | Recovery |
|---|---|---|
| **STT failure** | "Sorry, I couldn't hear that. Could you try again?" + mic button ready | Tap mic to retry |
| **LLM timeout** | "Taking a bit longer than usual..." + spinner. After 5s: "Sorry, I'm having trouble. Try typing your request." | Text input fallback |
| **LLM error** | "Something went wrong. Let me try again." + auto-retry once | Auto-retry, then text input fallback |
| **Search engine error** | "Couldn't load products. Trying again..." + auto-retry | Auto-retry, then error state with retry button |
| **Mic permission denied** | "Microphone access is needed for voice search. You can also type below." | Text input fallback + settings link |
| **Network offline** | "You're offline. Please check your connection." | Auto-retry on reconnection |

---

## 13. Technical Architecture

### 13.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       Frontend                           │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │  Voice  │  │ Product  │  │  State   │  │   Chat   ││
│  │ Input   │  │  Grid    │  │  Chips   │  │  History ││
│  │ Module  │  │ Component│  │ Component│  │ Component││
│  └────┬────┘  └────▲─────┘  └────▲─────┘  └────▲─────┘│
│       │            │             │              │       │
│       ▼            │             │              │       │
│  ┌─────────────────┴─────────────┴──────────────┴─────┐│
│  │              Frontend State Manager                 ││
│  │         (React state / Zustand / Context)           ││
│  └─────────────────────┬───────────────────────────────┘│
└────────────────────────┼────────────────────────────────┘
                         │ WebSocket / REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│                       Backend                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │                 API Gateway                       │   │
│  │          (Express / FastAPI / Hono)               │   │
│  └──────────┬───────────────┬───────────────────────┘   │
│             │               │                            │
│             ▼               ▼                            │
│  ┌──────────────┐  ┌──────────────────┐                 │
│  │ Conversation │  │  Search Engine   │                 │
│  │  Manager     │  │  (Product DB +   │                 │
│  │              │  │   Query Engine)  │                 │
│  │  - History   │  │                  │                 │
│  │  - State Mgr │  │  - Filter logic  │                 │
│  │  - LLM calls │  │  - Text search   │                 │
│  └──────┬───────┘  │  - Ranking       │                 │
│         │          └────────▲─────────┘                 │
│         ▼                   │                            │
│  ┌──────────────┐          │                            │
│  │  LLM API     │──────────┘                            │
│  │  (Gemini /   │   Structured state                    │
│  │   OpenAI)    │   delta output                        │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

### 13.2 Frontend Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| **Framework** | React (Vite) or Next.js | Component rendering, routing |
| **State Management** | Zustand or React Context | Search state, conversation history, UI state |
| **Voice Input** | Web Speech API (browser-native) or Deepgram SDK | Speech-to-text. Web Speech API for MVP (free, no API key). Deepgram for production (better accuracy, streaming). |
| **HTTP Client** | Fetch API / Axios | API calls to backend |
| **Real-time** | WebSocket (optional for MVP) or polling | Live product updates. REST polling is fine for hackathon. |
| **Animations** | Framer Motion or CSS transitions | Product grid transitions, chip animations |
| **Styling** | Vanilla CSS with CSS custom properties | Design system, responsive layout |

### 13.3 Backend Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| **API Server** | Node.js + Express / Python + FastAPI | REST endpoints, request handling |
| **Conversation Manager** | Custom module | Maintains conversation history per session. Constructs LLM prompts. Manages search state transitions. |
| **LLM Integration** | Gemini API / OpenAI API | Structured intent extraction. JSON mode for reliable output. |
| **Search Engine** | SQLite + custom query builder (MVP) / Elasticsearch (production) | Product retrieval, filtering, text search |
| **Product Database** | SQLite (MVP) / PostgreSQL (production) | Product catalog storage |
| **Session Store** | In-memory Map (MVP) / Redis (production) | Per-session conversation and state storage |

### 13.4 AI Architecture Detail

```
System Prompt (static)
├── Role definition: "You are a shopping intent parser..."
├── Output schema: JSON structure specification
├── Rules: How to handle refinements, negations, relative requests
├── Category-specific knowledge: Price ranges, common attributes
└── Few-shot examples: 8-10 input/output pairs

Dynamic Prompt Construction (per request)
├── Current search state (JSON)
├── Conversation history (last 10 messages)
├── Available filter values (brands, categories, etc.)
├── Current result count
└── New user utterance
```

**LLM Selection for MVP:**

| Model | Pros | Cons | Cost |
|---|---|---|---|
| **Gemini 2.0 Flash** (recommended) | Fast (~300ms), cheap, good JSON output, generous free tier | Slightly less capable than GPT-4o for complex reasoning | ~$0.10/1M input tokens |
| **GPT-4o-mini** | Excellent structured output, reliable | Requires OpenAI API key, slightly more expensive | ~$0.15/1M input tokens |
| **Gemini 2.5 Flash** | State-of-the-art, thinking capability | May be overkill for intent extraction | ~$0.15/1M input tokens |

**Recommendation:** Gemini 2.0 Flash for hackathon. Fast, free tier is generous, structured output works well.

---

## 14. Data Model & Schemas

### 14.1 Product Data Model

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,        -- "sneakers", "running_shoes", "formal_shoes"
  subcategory TEXT,              -- "casual", "sports", "everyday"
  brand TEXT NOT NULL,
  color TEXT,                    -- Primary color
  colors TEXT,                   -- JSON array of all colors: ["white", "grey"]
  price REAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  size_available TEXT,           -- JSON array: ["6", "7", "8", "9", "10"]
  rating REAL,                   -- Average rating: 4.2
  rating_count INTEGER,
  material TEXT,                 -- "mesh", "leather", "canvas"
  gender TEXT,                   -- "men", "women", "unisex"
  image_url TEXT,
  tags TEXT,                     -- JSON array: ["comfortable", "lightweight", "daily-wear"]
  use_case TEXT,                 -- "everyday", "running", "formal", "sports"
  in_stock BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 14.2 Search-State Schema (TypeScript)

```typescript
interface SearchState {
  version: number;
  query: string | null;

  filters: {
    category: string | null;
    subcategory: string | null;
    brand: string | null;
    color: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    minRating: number | null;
    size: string | null;
    gender: string | null;
    material: string | null;
    useCase: string | null;
  };

  exclusions: {
    brands: string[];
    colors: string[];
    materials: string[];
  };

  semanticModifiers: string[];  // ["comfortable", "classy", "lightweight"]

  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'popularity';

  similarTo: string | null;  // Product ID for "show similar" queries
}

interface SearchStateDelta {
  intentType: 'NEW_SEARCH' | 'REFINE' | 'NEGATE' | 'UNDO' | 'RESET' | 'COMPARE' | 'CLARIFY';

  set: Partial<SearchState['filters']>;
  remove: (keyof SearchState['filters'])[];

  addExclusions: Partial<SearchState['exclusions']>;
  removeExclusions: Partial<SearchState['exclusions']>;

  semanticAdd: string[];
  semanticRemove: string[];

  sortBy: SearchState['sortBy'] | null;
  similarTo: string | null;

  clarificationNeeded: boolean;
  clarificationQuestion: string | null;
  acknowledgment: string;
}
```

---

## 15. API Design

### 15.1 Endpoints

#### `POST /api/converse`

The primary endpoint. Accepts a user utterance and returns updated search state + product results.

**Request:**
```json
{
  "sessionId": "uuid-v4",
  "utterance": "Show me white sneakers under 1000",
  "inputType": "voice" | "text"
}
```

**Response:**
```json
{
  "sessionId": "uuid-v4",
  "searchState": { /* current full search state */ },
  "delta": { /* what changed */ },
  "products": [
    {
      "id": "prod_001",
      "name": "Asian Cosmo White Sneakers",
      "brand": "Asian",
      "price": 899,
      "rating": 4.2,
      "ratingCount": 1250,
      "imageUrl": "/images/asian_cosmo_white.jpg",
      "color": "white",
      "tags": ["comfortable", "lightweight"]
    }
  ],
  "totalResults": 23,
  "acknowledgment": "Showing white sneakers under ₹1,000",
  "clarification": null,
  "chips": [
    { "label": "Sneakers", "type": "category", "removable": true },
    { "label": "White", "type": "color", "removable": true },
    { "label": "Under ₹1,000", "type": "price", "removable": true }
  ]
}
```

#### `POST /api/converse/undo`

Reverts to the previous search state.

**Request:**
```json
{
  "sessionId": "uuid-v4"
}
```

#### `POST /api/converse/reset`

Clears the session and starts fresh.

#### `GET /api/products/:id`

Returns full product details for the product detail page.

#### `GET /api/session/:sessionId/state`

Returns the current search state and conversation history for a session (useful for debugging/demo).

---

## 16. Technology Stack

### 16.1 Recommended Stack (Hackathon MVP)

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React + Vite | Fast setup, hot reload, component-based. Team likely already knows React. |
| **Styling** | Vanilla CSS + CSS Custom Properties | Full control, no build complexity. Design system via CSS variables. |
| **Voice Input** | Web Speech API (SpeechRecognition) | Browser-native, zero cost, no API key needed. Works on Chrome/Edge. |
| **Backend** | Node.js + Express | Same language as frontend. Fast to prototype. |
| **LLM** | Google Gemini 2.0 Flash (via @google/generative-ai SDK) | Fast, cheap, good JSON mode, generous free tier. |
| **Database** | SQLite (via better-sqlite3) | Zero setup, file-based, fast for small datasets. Perfect for hackathon. |
| **Session Store** | In-memory JavaScript Map | No Redis needed. Sessions don't survive restart — fine for demo. |
| **Hosting** | Vercel (frontend) + Railway/Render (backend) | Free tiers, fast deployment, easy. |

### 16.2 Production Stack (Post-Hackathon)

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (SSR for SEO, API routes) |
| **Voice** | Deepgram (streaming STT, better accuracy, Hindi support) |
| **Backend** | Node.js + Fastify or Python + FastAPI |
| **LLM** | Gemini 2.5 Flash or GPT-4o (better reasoning for complex queries) |
| **Search** | Elasticsearch or Typesense (full-text + faceted search) |
| **Database** | PostgreSQL |
| **Vector Store** | Pinecone or pgvector (for semantic search embeddings) |
| **Cache** | Redis (session state, search result caching) |
| **Hosting** | GCP / AWS |

---

## 17. Scope & Prioritization

### 17.1 MVP Scope (Hackathon — Build This)

| # | Feature | Priority | Effort |
|---|---|---|---|
| 1 | **Product grid with real product data** (50-100 footwear products) | P0 | Medium |
| 2 | **Voice input → STT → text** (Web Speech API) | P0 | Low |
| 3 | **Text input** (parallel to voice) | P0 | Low |
| 4 | **LLM intent extraction** (utterance → structured state delta) | P0 | High |
| 5 | **Persistent search state** (accumulates across utterances) | P0 | Medium |
| 6 | **Search/filter engine** (translate state to DB query) | P0 | Medium |
| 7 | **Filter chips UI** (visual representation of understood state) | P0 | Low |
| 8 | **Real-time grid updates** (animate product grid on state change) | P0 | Medium |
| 9 | **AI acknowledgment text** ("Showing white sneakers under ₹1,000") | P0 | Low |
| 10 | **Basic refinement** (follow-up utterances modify state) | P0 | Included in #4 |
| 11 | **Negation** ("except black") | P1 | Low |
| 12 | **Undo** ("go back," "remove brand filter") | P1 | Low |
| 13 | **Relative adjustments** ("cheaper," "better rated") | P1 | Medium |
| 14 | **Zero-result handling** (suggest which filter to relax) | P1 | Medium |
| 15 | **Clarifying questions** (when intent is ambiguous) | P1 | Medium |
| 16 | **Responsive design** (mobile-first) | P1 | Medium |

### 17.2 Stretch Goals (If Time Permits)

| # | Feature | Value |
|---|---|---|
| S1 | Semantic ranking (boost "comfortable" products using tags/description matching) | High demo impact |
| S2 | "Show me something like this" (similarity by attributes) | Shows depth |
| S3 | Conversation history panel (collapsible) | Polish |
| S4 | Hindi voice input support | Massive demo appeal for India-focused hackathon |
| S5 | Product comparison ("compare first two") | Wow factor |
| S6 | Typing indicator / streaming acknowledgment | Polish |

### 17.3 What Should NOT Be Built for the Hackathon

| Feature | Why Not |
|---|---|
| User authentication / accounts | Not relevant to the core UX |
| Cart / checkout / payments | VoiceFilter is a discovery layer, not a transaction system |
| Product detail pages (full) | A simple modal/overlay with basic info is enough |
| Multi-language support beyond English + basic Hindi | Scope creep |
| Cross-platform adapters (Amazon, Flipkart) | Visionary but not demonstrable in a hackathon |
| Custom STT model | Use existing APIs |
| Product image generation | Use real or stock product images |
| User behavior analytics | Not needed for demo |
| A/B testing infrastructure | Premature |
| Recommendation engine (collaborative filtering, etc.) | Different product entirely |

---

## 18. Security, Privacy & Performance

### 18.1 Security Considerations

| Concern | Mitigation |
|---|---|
| **Prompt injection** | Sanitize user input before including in LLM prompt. Use structured output mode (JSON schema enforcement) to prevent free-form LLM responses. |
| **LLM API key exposure** | API keys server-side only. Never expose in frontend code. Use environment variables. |
| **Session hijacking** | Use cryptographically random session IDs (UUID v4). Sessions are ephemeral (no sensitive data). |
| **SQL injection** | Use parameterized queries. Never concatenate user input into SQL. |
| **Rate limiting** | Limit requests per session to prevent LLM cost abuse. 30 requests/min per session is reasonable. |

### 18.2 Privacy Considerations for Voice

| Concern | Approach |
|---|---|
| **Voice data storage** | Do NOT store raw audio. Only store the transcribed text. Transcription happens client-side (Web Speech API) or via a third-party STT that doesn't retain data. |
| **Conversation history** | Stored in-memory, per-session. Cleared on session end. Not persisted to disk in MVP. |
| **GDPR/privacy compliance** | Show a consent banner: "This app uses your microphone for voice search. Audio is processed locally and not stored." |
| **Microphone permission** | Only request when user taps mic button (not on page load). Provide clear fallback to text input. |

### 18.3 Performance Requirements

| Metric | Target (MVP) | Target (Production) |
|---|---|---|
| **Voice-to-text latency** | < 1s (Web Speech API is near-instant) | < 500ms (streaming STT) |
| **Intent extraction (LLM)** | < 1.5s | < 800ms |
| **Product search/retrieval** | < 200ms (SQLite with small dataset) | < 100ms (Elasticsearch) |
| **Total voice-to-results** | < 3s | < 1.5s |
| **Grid animation** | 60fps | 60fps |
| **Time to first meaningful paint** | < 2s | < 1s |

### 18.4 Latency Optimization Strategy

1. **Parallel processing:** Start STT transcription while displaying waveform animation. The moment text is ready, send to LLM.
2. **Streaming STT:** Use interim results to show the user what's being heard (builds confidence). Send final transcript to LLM.
3. **LLM response streaming:** Use streaming API to get the JSON response incrementally. Start product search as soon as the response is parseable.
4. **Optimistic UI:** Show "Updating..." state immediately when the user stops speaking. Don't wait for the full pipeline.
5. **Client-side prediction:** For simple operations (chip removal, undo), update the UI immediately and sync with the backend.

### 18.5 Cost Considerations for LLM Usage

| Metric | Estimate |
|---|---|
| Average tokens per request (prompt + response) | ~800-1200 tokens |
| Gemini 2.0 Flash cost | ~$0.10/1M input tokens |
| Cost per conversation turn | ~$0.0001 (negligible) |
| Cost per shopping session (10 turns) | ~$0.001 |
| Cost per 1,000 sessions | ~$1.00 |
| Hackathon demo (100 sessions) | ~$0.10 |

**Conclusion:** LLM cost is negligible for hackathon and early traction. At scale (1M sessions/day), cost would be ~$1,000/day — manageable with optimization (caching common queries, smaller model for simple intents).

### 18.6 Scalability Considerations (Post-Hackathon)

| Challenge | Solution |
|---|---|
| Session state at scale | Redis cluster with TTL-based expiration |
| LLM rate limits | Request queue with priority. Multiple API keys. Response caching for identical queries. |
| Product catalog size | Elasticsearch with sharding. Pre-computed facets. |
| Concurrent voice sessions | WebSocket connection pooling. Horizontal scaling of backend. |

---

## 19. Metrics & Evaluation

### 19.1 Product Success Metrics

| Metric | Definition | Target |
|---|---|---|
| **Task completion rate** | % of users who find a product they would buy | > 60% |
| **Time to relevant results** | Time from first utterance to user seeing relevant products | < 10s |
| **Conversation turns to satisfaction** | Average number of utterances before user finds what they want | < 5 |
| **Filter-equivalent efficiency** | # of voice commands vs. # of filter interactions to reach same result | < 50% of filter clicks |

### 19.2 AI Quality Metrics

| Metric | Definition | Target |
|---|---|---|
| **Intent accuracy** | % of utterances where the correct intent type is identified | > 90% |
| **Entity extraction accuracy** | % of attributes correctly extracted from utterances | > 85% |
| **State transition accuracy** | % of state updates that correctly reflect user intent | > 85% |
| **Hallucination rate** | % of responses where AI invents attributes not in the utterance | < 2% |
| **Clarification appropriateness** | % of clarifying questions that are actually helpful | > 80% |

### 19.3 User Experience Metrics

| Metric | Definition | Target |
|---|---|---|
| **Voice recognition accuracy** | % of utterances correctly transcribed | > 90% (English), > 80% (Hindi) |
| **Perceived latency** | User's subjective sense of speed (survey) | "Fast" or "Very fast" from >70% |
| **Error recovery rate** | % of errors that the user recovers from without restarting | > 80% |
| **Delight score** | Post-session NPS or reaction survey | > 8/10 |

---

## 20. Hackathon Demo Strategy

### 20.1 Demo Environment Setup

- **Pre-seed 80-100 products** in footwear category (sneakers, running shoes, formal shoes, casual shoes)
- Include brands: Asian, Nike, Puma, Adidas, Sparx, Campus, Bata
- Price range: ₹300 – ₹5,000
- Include realistic images (stock photos or scraped thumbnails)
- **Test all demo scenarios** beforehand. Have fallback typed inputs ready if mic fails.
- **Dark mode** — demos look better on projectors in dark mode

### 20.2 Three-Minute Demo Script

| Time | Action | What Judges See |
|---|---|---|
| **0:00–0:20** | **Hook.** "Every e-commerce site makes you fill out filters. What if you could just... talk?" Show a split screen: left = traditional filter panel (screenshot), right = VoiceFilter landing page. | Problem framing. Immediate visual contrast. |
| **0:20–0:40** | **First query.** Tap mic. Say: "Show me white sneakers." Products appear instantly. Chips appear: `Sneakers` `White`. | Core interaction. Products respond to voice. |
| **0:40–1:00** | **Refinement.** Say: "Under ₹1,000." Grid updates, fewer products. Chip added: `Under ₹1,000`. Say: "Only Asian." Grid updates again. Chip: `Asian`. | Persistent state. Each utterance refines. |
| **1:00–1:20** | **Relative command.** Say: "Show me something more comfortable." Products re-rank. Semantic chip appears: `✨ Comfortable`. | Semantic understanding. Not just filters. |
| **1:20–1:40** | **Correction.** Say: "Actually, make the budget 1500." Price chip updates from `₹1,000` to `₹1,500`. More products appear. | State modification. Natural correction. |
| **1:40–2:00** | **Negation.** Say: "Remove the brand filter." Brand chip disappears. Grid opens up to all brands. | Natural undo. Conversational control. |
| **2:00–2:20** | **Type fallback.** Type: "Show me something for running." Grid updates to running shoes. | Not just voice — multimodal input. |
| **2:20–2:50** | **Key insight.** "Notice what we DIDN'T do: we never opened a filter panel. Never selected a dropdown. Never moved a slider. Every product you saw was controlled entirely through conversation. The conversation IS the filter." | USP statement. Drives the point home. |
| **2:50–3:00** | **Closer.** "Stop filtering. Just talk. That's VoiceFilter." | Tagline. Memorable ending. |

### 20.3 Five-Minute Demo Script

Extends the 3-minute script with:

| Time | Action |
|---|---|
| **3:00–3:30** | **Zero-result handling.** Set very tight filters via voice: "Only Nike, white, under ₹200." System shows: "No exact matches. I found 3 options if we increase the budget to ₹500. Want to see them?" Say "Yes." Products appear. |
| **3:30–4:00** | **Ambiguity handling.** Say: "I need shoes." AI asks: "What type — running, casual, formal, or sports?" Say "Casual." Results update. |
| **4:00–4:30** | **Architecture slide.** Quick technical explanation: "Voice → STT → LLM intent engine → structured state → search engine → products. The LLM never recommends products. It only understands intent. The search engine does the retrieval. This eliminates hallucination." |
| **4:30–5:00** | **Vision.** "This isn't just a feature. It's an interaction paradigm. Imagine this embedded in Flipkart, Amazon, any e-commerce site. An AI layer that makes filters obsolete. Stop filtering. Just talk." |

### 20.4 Judge-Facing Product Story

> **The Elevator Pitch:**
>
> "Filters were designed for databases, not for humans. Humans don't think in checkboxes and sliders. They think in sentences. VoiceFilter lets users shop the way they think — by talking. Every sentence they say modifies a persistent search state, and the product grid responds in real time. It's not a chatbot. It's not voice search. It's a new interaction paradigm where conversation replaces the filter panel entirely."
>
> **The Technical Differentiator:**
>
> "Most AI shopping tools are chatbots that generate recommendations from LLM knowledge — which means they hallucinate products. VoiceFilter uses the LLM purely as an intent engine. It extracts structured attributes from natural language and feeds them to a real search engine with real product data. The LLM never sees products. It only understands what the user wants."
>
> **The 'Aha' Moment:**
>
> "Watch what happens when I say 'make it cheaper.' The price filter updates. When I say 'remove the brand restriction,' the brand chip disappears. When I say 'something more comfortable,' the results re-rank semantically. Each sentence is a filter operation expressed in natural language. After seeing this, you'll wonder why every shopping site still has a filter panel."

---

## 21. Competitive Differentiation

### 21.1 Why This Is NOT Simply "Voice Search"

| Voice Search | VoiceFilter |
|---|---|
| Single query → single result set | Continuous conversation → evolving result set |
| No memory between queries | Full session memory across all utterances |
| "White sneakers" → results. Done. | "White sneakers" → "under 1000" → "only Asian" → "more comfortable" → results evolve |
| Each query is independent | Each utterance modifies the existing state |
| Basically a voice-activated search bar | A conversational search experience |

**Google/Amazon voice search** = "Hey Google, search for white sneakers" → list of results. No follow-up. No refinement. No state.

**VoiceFilter** = Continuous conversation that progressively builds and modifies a structured shopping query.

### 21.2 Why This Is NOT Simply "ChatGPT for Shopping"

| ChatGPT-style Shopping | VoiceFilter |
|---|---|
| AI dominates the interface | Products dominate the interface |
| Products shown as text lists in chat | Products shown as a visual grid (standard e-commerce) |
| AI recommends from its training data | AI extracts intent; real search engine retrieves products |
| Hallucination risk: AI may recommend products that don't exist | Zero hallucination: products come from actual database |
| Conversation IS the product page | Conversation CONTROLS the product page |
| Feels like talking to a chatbot | Feels like talking to the product grid |

### 21.3 Why Persistent Conversational State Is the Key Innovation

No existing e-commerce product maintains a structured, user-modifiable search state that evolves through natural language conversation.

**The state is the innovation because:**
1. It enables relative commands ("cheaper," "better rated") — impossible without state
2. It enables natural corrections ("actually, make it 1500") — requires knowing what to modify
3. It enables undos ("remove the brand filter") — requires state history
4. It enables context ("show more like this") — requires knowing what "this" refers to
5. It enables continuity — the user never "starts over"

### 21.4 Competitive Landscape

| Competitor | What They Do | How VoiceFilter Differs |
|---|---|---|
| **Amazon Alexa Shopping** | Voice commands for reordering and simple searches | No persistent state. No refinement. No visual product grid. Transactional, not exploratory. |
| **Google Shopping** | Visual product search with filters | No conversational interface. No state across queries. Traditional filter paradigm. |
| **Flipkart Voice Search** | Single-shot voice query to text search | No follow-up. No state. Just a voice-activated search bar. |
| **Perplexity Shopping** | AI-generated product recommendations with citations | ChatGPT-style: AI recommends from training data. No persistent state. No real-time grid. |
| **ChatGPT + Plugins** | Conversational product discovery | Chat-first UI. Products as text, not grid. Hallucination risk. No structured state management. |
| **Mercor / Shop AI startups** | Various AI shopping assistants | Mostly chatbot-first. Don't separate intent engine from product retrieval. Don't focus on state persistence. |

---

## 22. Critical Analysis & Honest Assessment

### 22.1 Weak Points

| Weakness | Severity | Mitigation |
|---|---|---|
| **Voice recognition accuracy** in noisy environments / accented speech | High | Text input as equal-priority fallback. Never position voice as the ONLY input. |
| **"Why not just type?"** objection | Medium | Position voice as the FASTEST input, not the only input. Show that even text-based conversation beats filter panels. |
| **Cold start problem** | Medium | The first query is essentially identical to traditional search. The magic only appears on the 2nd–5th utterance. Demo must show multi-turn interaction. |
| **Limited product catalog** in hackathon | Medium | Focus on one category (footwear) with enough depth (80-100 products, 8+ brands, varied attributes). |
| **LLM latency** for real-time feel | Medium | Use fastest model (Gemini Flash). Optimize prompts. Show "thinking" animation to mask latency. |

### 22.2 Technical Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| LLM produces invalid/unparseable JSON | Medium | High — breaks the pipeline | Use JSON mode / structured output. Validate and retry once. Have fallback parsing. |
| LLM misinterprets ambiguous utterance | High | Medium — wrong products shown | Err toward clarifying questions for ambiguous cases. Show filter chips so user can spot and correct misinterpretation. |
| Web Speech API doesn't work on all browsers | High | Medium — voice won't work | Support Chrome/Edge (90%+ of Indian users). Text input as fallback. |
| Relative commands ("cheaper") produce unreasonable values | Medium | Medium — user sees weird prices | Bound relative adjustments to category-specific ranges. Validate output. |
| Session state grows too large for LLM context | Low | Medium — degraded performance | Limit conversation history to last 10 messages. Summarize older context. |

### 22.3 UX Risks

| Risk | Detail | Mitigation |
|---|---|---|
| **User doesn't know what to say** | Open-ended voice input is intimidating. Users conditioned to use filters may not know how to start. | Show example prompts: "Try saying: 'Show me white sneakers under ₹1,000'". Rotate examples. |
| **User speaks too fast / too much** | Long utterances are harder to parse correctly. | Encourage short, incremental statements via UI affordances. |
| **Privacy concern with microphone** | Users may not want to speak queries aloud (office, public transport). | Text input always visible and equally functional. Never force voice. |
| **The "filter panel" is actually fine for power users** | Some users can navigate filters faster than speaking. | This is not for power users. Target the 80% who find filters frustrating. For power users, offer keyboard shortcuts and text input. |

### 22.4 Where the USP Could Be Considered Generic

**Honest assessment:** "AI + shopping" is a crowded hackathon category. If you pitch this as "we built a shopping chatbot," judges will mentally check out. The persistent state + grid-first UI is the differentiation, but you need to SHOW it, not just say it.

**Risk:** If the demo looks like a chat interface with a product grid, judges may see it as "just another AI shopping assistant." The visual design and interaction flow must make it feel fundamentally different from a chatbot.

### 22.5 Features That Sound Impressive but Don't Add Value

| Feature | Why It's Overhyped |
|---|---|
| **Cross-platform aggregation** | Great vision slide. Impossible to demo meaningfully. Don't build it. |
| **Product comparison via AI** | Judges have seen this in every other AI shopping demo. Not your differentiator. |
| **Multi-language support** | "We support 10 languages" sounds good on a slide but adds zero value to the core UX innovation. Hindi + English is enough. |
| **Personalization/user history** | Requires user accounts and data. Overcomplicates MVP. Not your USP. |
| **"AI-generated product summaries"** | Sounds like ChatGPT. Moves attention away from the filter-replacement thesis. |

### 22.6 Features Judges May Have Seen Before

- Voice search for e-commerce ✓ (very common)
- AI chatbot that recommends products ✓ (extremely common)
- Natural language product search ✓ (common)
- Product comparison ✓ (common)

**What judges likely HAVEN'T seen:** A product grid that responds to a continuous conversation with persistent state. The grid-first, conversation-as-control paradigm.

### 22.7 Defensibility

**How competitors could copy this:**
- The concept is straightforward. Any team with an LLM API and a product database could build a basic version in a weekend.
- Amazon, Flipkart could add conversational refinement to their existing voice search.

**What makes it defensible:**
1. **Execution quality** — The UX polish, animation quality, and seamless interaction flow are hard to replicate quickly.
2. **Prompt engineering depth** — The few-shot examples, edge case handling, and intent classification prompts take iteration to perfect.
3. **Data flywheel** — Once deployed, every conversation generates training data for improving intent accuracy.
4. **SDK/API moat** — If VoiceFilter becomes an embeddable SDK, it can be integrated into thousands of stores before a competitor builds their own.
5. **Category-specific tuning** — Deep knowledge of footwear/fashion attribute taxonomies. This domain knowledge compounds.

**Honest answer:** The concept itself is not defensible through IP. The defensibility is in execution, speed-to-market, and the SDK/platform play.

---

### 22.8 "If 100 Teams Receive This Same Problem Statement, Why Would Judges Choose This Solution?"

**Brutally honest answer:**

Most teams will build one of these:
1. A chatbot that recommends products (70% of teams)
2. A voice search bar that does a one-shot query (15% of teams)
3. A visual search tool or image-based shopping (10% of teams)
4. Something genuinely novel (5% of teams)

**You win if:**
1. **The demo is visually stunning.** A beautiful product grid that animates smoothly when voice commands are given. This is an aesthetic game. If your grid looks like a Bootstrap template, you lose.

2. **The multi-turn conversation is CLEARLY demonstrated.** The 5th utterance in a conversation is where the magic happens. Most demos will show a single query. You show a 6-step refinement that builds a complex search through conversation.

3. **The persistent state is VISIBLE.** The filter chips that appear, update, and disappear as you speak are the visual proof of the innovation. Judges can SEE the state evolving.

4. **You demonstrate edge cases.** Negation ("except black"), undo ("remove the brand"), relative adjustment ("make it cheaper") — these show depth. Most teams won't handle these.

5. **You DON'T show a chatbot.** The moment your demo looks like a chat window, you lose differentiation. Products must be 80% of the screen. The conversation must be subtle and in service of the grid.

**The single biggest risk is that your demo looks like "yet another AI shopping chatbot."** The single biggest opportunity is that your demo makes filters look obsolete.

**You don't win with technology. You win with the interaction paradigm shift.**

---

## 23. Future Roadmap & Business Model

### 23.1 Future Roadmap

| Phase | Timeline | Features |
|---|---|---|
| **Phase 1: Hackathon MVP** | Weekend | Core voice/text → intent → state → product grid flow. Footwear category. |
| **Phase 2: Polish & Expand** | Month 1-2 | Multiple categories. Better semantic search (embeddings). Hindi support. Mobile PWA. |
| **Phase 3: Embeddable SDK** | Month 3-6 | JavaScript SDK that any e-commerce site can embed. Drop-in replacement for filter panel. Admin dashboard for catalog configuration. |
| **Phase 4: Platform Adapters** | Month 6-12 | Adapters for Shopify, WooCommerce, Magento. Standardized product schema mapping. |
| **Phase 5: Cross-Platform** | Year 1-2 | Browser extension that overlays VoiceFilter on Amazon/Flipkart. Mobile app with multi-store search. |
| **Phase 6: Intelligence Layer** | Year 2+ | Personalization based on shopping history. Predictive intent (pre-populate likely refinements). Multi-modal input (image + voice). |

### 23.2 Potential Business Model

| Model | Detail | Viability |
|---|---|---|
| **SaaS for e-commerce stores** | Monthly subscription for embedded conversational search. Tiered by product catalog size and query volume. | High. Clear value prop: increase conversion by making product discovery effortless. |
| **API/SDK licensing** | Per-API-call pricing for large platforms. | Medium. Competes with in-house solutions at large companies. |
| **Revenue share** | % of transactions attributed to VoiceFilter-assisted discovery. | High alignment but hard to track attribution accurately. |
| **Freemium** | Free for <1,000 products, paid tiers above. | Good for adoption. Classic SaaS playbook. |

### 23.3 SaaS/API/SDK Model

**The Shopify App Store play:**

VoiceFilter becomes a Shopify app that any store owner installs. It adds a conversational search overlay to their existing store. Store owner configures their product catalog schema. VoiceFilter handles the rest.

**Pricing:**
- Free: Up to 100 products, 1,000 queries/month
- Starter: $29/mo — 1,000 products, 10,000 queries/month
- Pro: $99/mo — 10,000 products, 100,000 queries/month
- Enterprise: Custom pricing — unlimited

### 23.4 Long-Term Platform Vision

**The "Google for shopping" thesis:**

Google replaced Yahoo's directory-browsing paradigm with a single search bar. VoiceFilter replaces the filter-browsing paradigm with a conversation.

If successful, VoiceFilter becomes the default product discovery interface — not a feature on someone else's platform, but the interface layer through which users discover products across ALL platforms.

**The browser extension play (Phase 5)** is particularly interesting: a user installs VoiceFilter as a Chrome extension. When they visit any e-commerce site, VoiceFilter overlays a conversational search on top of the site's native search. The extension scrapes/adapts to the site's product catalog and filter structure. The user shops conversationally on ANY site.

This is ambitious and technically challenging, but it's the path to becoming a platform rather than a feature.

---

## 24. Final Recommendations

### 24.1 Strongest Product Positioning

> "VoiceFilter doesn't add AI to shopping. It removes filters from shopping. The conversation is the filter panel."

Position as a **UX paradigm shift**, not an AI feature. Judges are tired of "we added AI to X." They want to see "we fundamentally changed how X works."

### 24.2 Strongest USP

> **Persistent conversational search state with real-time product grid response.**

Not voice. Not AI. Not chatbot. The USP is that the product grid is ALIVE — it responds to a continuous conversation, not discrete queries. Every utterance modifies a structured state, and the grid reflects that state in real time.

### 24.3 Strongest Name

**VoiceFilter** for the hackathon. It's literal, it's clear, and it communicates the thesis in two syllables.

### 24.4 Strongest Demo Scenario

The **sneaker refinement flow:**
1. "Show me white sneakers" → grid appears
2. "Under ₹1,000" → grid filters
3. "Only Asian brand" → grid narrows
4. "Something more comfortable" → grid re-ranks (semantic)
5. "Actually, make it ₹1,500" → price chip updates, grid expands
6. "Remove the brand filter" → brand chip disappears, more brands appear

This is the **exact 6-step sequence** that no other demo will show. It demonstrates persistence, refinement, semantic understanding, correction, and undo — all in 90 seconds.

### 24.5 The Single Feature to Prioritize Above Everything Else

> **Multi-turn conversational state refinement with visible filter chips.**

If the user can say 3+ things in sequence, and the filter chips visually appear/update/disappear in response, and the product grid changes accordingly — you have a winning demo. Everything else is secondary.

Don't build comparison. Don't build Hindi support. Don't build cross-platform. Don't build recommendations. Build the multi-turn state machine with beautiful, animated filter chips and a responsive product grid. **Nail that one interaction loop.**

### 24.6 Proposed Improvements to the Original Concept

| Original Concept | Improvement |
|---|---|
| Voice-first positioning | Position as **conversation-first**. Voice is one input modality. Text works equally well. "Conversation replaces filters" is stronger than "voice replaces filters." |
| Show "understood" chips | Make chips **interactive**. Tapping a chip should let the user modify that specific attribute (e.g., tap the price chip to adjust price). This bridges the gap between conversational and manual control. |
| AI asks clarifying questions | Limit to ONE question per turn. Show products even while asking. Never block the user from seeing results. |
| Semantic intent ("classy for a job interview") | For MVP, implement as keyword matching against product tags/description. Don't build embeddings unless you have time. Tag your products manually with semantic keywords. |
| Cross-platform vision | Remove from the demo entirely. Mention in a "vision" slide at the end. Don't let it dilute the core demo. |
| "Show me something similar to the second one" | Implement as attribute-based similarity (same category, similar price, same brand/color). Don't build embedding-based similarity for MVP. |

---

> [!IMPORTANT]
> ## The Final Test
>
> After the demo, ask yourself: **"Did the judge forget about filters?"**
>
> If the answer is yes — if the judge watched the demo and thought, "Why DO shopping sites still make me use filters?" — then you've won.
>
> The goal is not to build the most technically impressive system. The goal is to create a 90-second interaction that makes the existing paradigm feel obsolete.
>
> **Stop filtering. Just talk.**

---

*End of PRD — VoiceFilter v1.0*
