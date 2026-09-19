# VoiceFilter

### *Your voice is the new filter.*

VoiceFilter is a Chrome browser extension that lets shoppers refine real **Amazon.in** searches through natural conversation instead of manually operating filter panels.

You say what you want.  
VoiceFilter maintains the context.  
Amazon results evolve with you.

![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![Gemini AI](https://img.shields.io/badge/AI_Engine-Gemini_2.0_Flash-orange)
![Amazon.in](https://img.shields.io/badge/Storefront-Amazon.in-FF9900)

---

## The Idea

Traditional e-commerce forces shoppers to translate their natural intent into rigid UI controls:

> *"I want white sneakers under ₹2,000 from Asian that are comfortable."*

```text
TRADITIONAL FILTERING
Category Select ➔ Sneakers
Color Filter    ➔ White
Brand Checkbox  ➔ Asian
Price Slider    ➔ Under ₹2,000
Comfort Filter  ➔ ??? (Not available as a checkbox)
```

With **VoiceFilter**, shoppers express intent naturally, turn by turn:

> *"Show me white sneakers."*  
> *"Under 2000."*  
> *"Only Asian."*  
> *"Something comfortable."*

### Traditional Shopping vs. VoiceFilter

```text
Traditional Shopping Flow

Intent  ➔  Find right filter  ➔  Open filter panel  ➔  Click checkboxes  ➔  Apply  ➔  Repeat


VoiceFilter Flow

Intent  ➔  Speak naturally  ➔  SearchState evolves  ➔  Amazon results update
```

### Voice Search vs. Conversational Search-State Refinement

Standard voice search treats every phrase as a fresh, independent query. VoiceFilter maintains an evolving **SearchState**:

| Turn | Speech Input | Standard Voice Search | VoiceFilter Conversational State |
| :--- | :--- | :--- | :--- |
| **Turn 1** | *"white sneakers"* | Searches "white sneakers" | `[Sneakers]` `[White]` |
| **Turn 2** | *"under 1500"* | Searches literally "under 1500" (context lost) | `[Sneakers]` `[White]` `[Under ₹1,500]` |
| **Turn 3** | *"only Asian"* | Searches literally "only Asian" | `[Sneakers]` `[Asian]` `[White]` `[Under ₹1,500]` |
| **Turn 4** | *"make it 2000"* | Fails | `[Sneakers]` `[Asian]` `[White]` `[Under ₹2,000]` *(Modifies price)* |
| **Turn 5** | *"something comfortable"* | Fails | `[Sneakers]` `[Asian]` `[White]` `[Under ₹2,000]` `[* Comfortable]` |

---

## Live Amazon Demo Experience

When active on **Amazon.in**, VoiceFilter injects a live **`CONVERSATION → SEARCH STATE`** banner directly above Amazon's search results grid:

```text
+-----------------------------------------------------------------------------------------+
| VOICEFILTER  Conversation -> Search State  "Your search, evolving with you"             |
| [Sneakers] [White] [Asian] [Under ₹2,000] [* Comfortable]              [Undo ↩] [Reset 🗑️] |
+-----------------------------------------------------------------------------------------+
```

### Turn-by-Turn Execution

1. **"Show me white sneakers"** ➔ Navigates Amazon to `k=white+sneakers` ➔ Banner renders `[Sneakers] [White]`
2. **"Under 1500"** ➔ Appends price filter `rh=p_36%3A0-150000` ➔ Banner appends `[Under ₹1,500]`
3. **"Only Asian"** ➔ Adds brand `k=Asian+white+sneakers` ➔ Banner appends `[Asian]`
4. **"Actually make it 2000"** ➔ Overrides price `rh=p_36%3A0-200000` ➔ Banner updates `[Under ₹2,000]`
5. **"Something comfortable"** ➔ Appends semantic keyword ➔ Banner appends `[* Comfortable]`

### Control Actions
* **Undo (`↩ Undo`):** Reverts to the previous search state snapshot (`POST /api/converse/undo`).
* **Reset (`🗑️ Reset`):** Clears all search filters and navigates back to clean Amazon home (`POST /api/converse/reset`).

---

## How It Works

```text
User Speech
    ↓
Web Speech API (Chrome Browser)
    ↓
FastAPI Backend (http://localhost:8000)
    ↓
Gemini 2.0 Flash (Intent Extraction Engine)
    ↓
SearchStateDelta (Structured Pydantic JSON)
    ↓
StateMergerService (Deterministic Context Merger)
    ↓
SearchState (Accumulated Context)
    ↓
AmazonAdapter (URL Parameter Translator)
    ↓
Live Amazon.in Storefront Search
```

### Core Architecture Components

* **Chrome Extension (`extension/`):** Manifest V3 content script injecting floating mic button, Siri-style pop-up voice modal, and live Search State Banner.
* **FastAPI Backend (`backend/`):** Serves REST API endpoints (`/api/converse`, `/api/converse/undo`, `/api/converse/reset`) with in-memory session stack management (`SessionService`).
* **Gemini 2.0 Flash (`intent_system.py`):** AI intent extractor parsing natural language into structured `SearchStateDelta` JSON.
* **StateMergerService (`state_service.py`):** Deterministic engine handling scalar overrides, array additions, brand negations, and undo history.
* **AmazonAdapter (`amazon-adapter.js`):** Translates `SearchState` into Amazon search query keywords (`k=`) and paise price bounds (`rh=p_36`).

---

## Amazon Integration Strategy

VoiceFilter uses a **URL-First Translation Architecture** validated against live `Amazon.in` search pages.

```text
SearchState ➔ AmazonAdapter.buildAmazonUrl(state) ➔ Amazon.in Search Page
```

### Parameter Translation Rules

| SearchState Field | Amazon Strategy | Classification | Example |
| :--- | :--- | :--- | :--- |
| **Category** | `k` query keyword | Keyword-based | `k=sneakers` |
| **Brand** | `k` query keyword | Keyword-based | `k=Asian+sneakers` |
| **Color** | `k` query keyword | Keyword-based | `k=white+sneakers` |
| **Max Price** | `rh=p_36:0-<paise>` | Validated | `rh=p_36%3A0-150000` (₹1,500 = 150,000 paise) |
| **Min Price** | `rh=p_36:<paise>-` | Validated | `rh=p_36%3A50000-` (₹500 = 50,000 paise) |
| **Semantic Attributes** | `k` query keyword | Keyword-based | `k=white+sneakers+comfortable` |
| **Sort Order** | `s=` parameter | Experimental | `s=price-asc-rank` |
| **Brand Negation** | `-<Brand>` query | Experimental | `k=sneakers+-Nike` |

### Safety & Layout Protection
If Amazon's search results grid container (`#search`) cannot be located, VoiceFilter automatically renders a **fixed-position top overlay banner** (`#voicefilter-banner-fixed`), guaranteeing Amazon's native layout is **never broken or corrupted**.

---

## Conversational State & Persistence

VoiceFilter maintains context using deterministic state merging:

$$\text{Current SearchState} + \text{SearchStateDelta} \xrightarrow{\text{StateMergerService}} \text{New SearchState}$$

### Client-Side Tab Isolation
* **Storage Engine:** `chrome.storage.local`
* **Tab-Scoped Key:** `voicefilter_session_<tabId>`
* **Reload Survival:** When `AmazonAdapter` reloads Amazon to apply new parameters, `content.js` reads tab storage on `document_idle` and immediately reconstructs the active Search State Banner.
* **Backend Memory:** Backend sessions maintain undo stack history in RAM (`SessionService`). `chrome.storage.local` acts as a browser-side read replica.

---

## Quick Start Guide

### Prerequisites
* Google Chrome (or Chromium browser supporting Web Speech API)
* Python 3.10+
* Gemini API Key

### 1. Start Backend Server
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # On Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Gemini API key
echo "GEMINI_API_KEY=your_gemini_key_here" > .env

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Verify backend health at `http://localhost:8000/api/health`.

### 2. Load Chrome Extension
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** toggle in top right.
3. Click **Load unpacked** and select the `extension/` directory:  
   `C:\Users\Karthikeya Dusi\Desktop\VoiceFilter\extension`
4. Open **[https://www.amazon.in](https://www.amazon.in)**.
5. Click the floating **VoiceFilter** mic button (`🎙️`) in the bottom-right corner!

---

## Project Structure

```text
VoiceFilter/
├── extension/                       # Chrome Extension (Manifest V3)
│   ├── manifest.json                # Extension manifest & Amazon.in permissions
│   ├── background.js                # Service worker & storage relay
│   ├── content.js                   # Injected overlay, modal & state banner
│   ├── content.css                  # Scoped styles (#voicefilter-*)
│   ├── amazon-adapter.js            # SearchState ➔ Amazon URL translator
│   ├── popup.html                   # Extension popup interface
│   └── icons/                       # Extension icon assets
│
└── backend/                         # FastAPI Intent Engine Server
    ├── app/
    │   ├── main.py                  # FastAPI application entrypoint
    │   ├── config.py                # Environment configuration loader
    │   ├── api/
    │   │   └── routes.py            # Converse, Undo & Reset API routes
    │   ├── services/
    │   │   ├── conversation_service.py # Gemini 2.0 Flash intent parser
    │   │   ├── state_service.py     # Deterministic StateMerger engine
    │   │   ├── session_service.py   # In-memory RAM session manager
    │   │   └── chip_service.py      # Filter chip formatting engine
    │   ├── schemas/
    │   │   ├── search_state.py      # SearchState Pydantic model
    │   │   └── delta.py             # SearchStateDelta Pydantic model
    │   └── prompts/
    │       └── intent_system.py     # Gemini system prompt & brand rules
    └── requirements.txt             # Python dependencies
```

---

## Limitations & Roadmap

### Current Limitations
* **Target Storefront:** Optimized specifically for `Amazon.in`.
* **Page Navigations:** Filter updates trigger URL reloads (`window.location.href`) rather than background DOM click automation.
* **Local Backend Dependency:** Extension communicates with FastAPI running locally on `http://localhost:8000`.

### Development Roadmap

- [x] Manifest V3 Chrome Extension architecture
- [x] Web Speech API integration with `1.8s` silence detection
- [x] FastAPI + Gemini 2.0 Flash intent extraction engine
- [x] Rule-based fallback parser for offline resilience
- [x] Multi-turn deterministic `StateMergerService`
- [x] AmazonAdapter URL translator (`k` query and `p_36` paise price bounds)
- [x] Injected live **Search State Banner** (`CONVERSATION → SEARCH STATE`)
- [x] Fixed-position overlay safety fallback to prevent Amazon DOM corruption
- [x] Undo (`↩`) and Reset (`🗑️`) controls
- [x] Tab-scoped client storage persistence (`chrome.storage.local`)
- [ ] Direct DOM sidebar click automation (filling price inputs without page reloads)
- [ ] Remote HTTPS backend deployment (Render / Railway / Vercel)
- [ ] Multi-site support (Flipkart, Myntra)
