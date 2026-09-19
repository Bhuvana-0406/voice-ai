// ============================================================================
// VoiceFilter Extension — Content Script (Live Amazon Mode)
// ============================================================================
// Injected into Amazon.in pages. Manages:
//   1. Floating VoiceFilter mic button
//   2. Injected Live Amazon Search State Banner ("Conversation -> Search State")
//   3. Voice listening modal (Siri/Alexa-style popup with Undo/Reset controls)
//   4. Communication with service worker -> FastAPI backend
//   5. AmazonAdapter URL navigation
// ============================================================================

(function () {
  "use strict";

  // Prevent double injection
  if (window.__voiceFilterInjected) return;
  window.__voiceFilterInjected = true;

  // ── Constants ──────────────────────────────────────────────────────────────
  const SILENCE_THRESHOLD_MS = 1800;

  // ── State ──────────────────────────────────────────────────────────────────
  let isListening = false;
  let isProcessing = false;
  let recognition = null;
  let silenceTimer = null;
  let maxTimer = null;
  let accumulatedText = "";
  let currentSearchState = null;
  let currentChips = [];

  // ── DOM References ─────────────────────────────────────────────────────────
  let overlay = null;
  let statusText = null;
  let transcriptEl = null;
  let micCircle = null;
  let textInput = null;
  let textForm = null;
  let errorBox = null;
  let bannerContainer = null;

  // ── Inject Floating Mic Button ─────────────────────────────────────────────
  function injectFloatingButton() {
    if (document.getElementById("voicefilter-fab")) return;
    const btn = document.createElement("div");
    btn.id = "voicefilter-fab";
    btn.innerHTML = `
      <div id="voicefilter-fab-inner">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="#fff"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="#fff"/>
        </svg>
        <span id="voicefilter-fab-label">VoiceFilter</span>
      </div>
    `;
    btn.addEventListener("click", openModal);
    document.body.appendChild(btn);
  }

  // ── Inject Modal Overlay ───────────────────────────────────────────────────
  function injectModal() {
    if (document.getElementById("voicefilter-overlay")) return;
    overlay = document.createElement("div");
    overlay.id = "voicefilter-overlay";
    overlay.style.display = "none";
    overlay.innerHTML = `
      <div id="voicefilter-modal">
        <button id="voicefilter-close">&times;</button>

        <div id="voicefilter-header">
          <span id="voicefilter-badge">VOICEFILTER</span>
          <div id="voicefilter-tagline">Your voice is the new filter.</div>
          <div id="voicefilter-subtitle">Speak naturally. We'll refine your Amazon search.</div>

          <div id="voicefilter-modal-controls">
            <button id="voicefilter-btn-undo-modal" class="voicefilter-modal-btn">
              <span>↩</span> Undo Last Filter
            </button>
            <button id="voicefilter-btn-reset-modal" class="voicefilter-modal-btn">
              <span>🗑️</span> Clear All
            </button>
          </div>
        </div>

        <div id="voicefilter-mic-area">
          <div id="voicefilter-mic-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="#fff"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="#fff"/>
            </svg>
          </div>
        </div>

        <div id="voicefilter-status">Click the microphone to start</div>
        <div id="voicefilter-transcript"></div>
        <div id="voicefilter-error" style="display:none;"></div>

        <div id="voicefilter-divider">
          <span>or type your query</span>
        </div>

        <form id="voicefilter-text-form">
          <input id="voicefilter-text-input" type="text" placeholder='e.g. "white sneakers under 1500"' autocomplete="off" />
          <button type="submit" id="voicefilter-text-submit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#FF9900"/></svg>
          </button>
        </form>
      </div>
    `;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    document.body.appendChild(overlay);

    // Cache DOM refs
    statusText = document.getElementById("voicefilter-status");
    transcriptEl = document.getElementById("voicefilter-transcript");
    micCircle = document.getElementById("voicefilter-mic-circle");
    textInput = document.getElementById("voicefilter-text-input");
    textForm = document.getElementById("voicefilter-text-form");
    errorBox = document.getElementById("voicefilter-error");

    // Event listeners
    document.getElementById("voicefilter-close").addEventListener("click", closeModal);
    document.getElementById("voicefilter-btn-undo-modal").addEventListener("click", handleUndo);
    document.getElementById("voicefilter-btn-reset-modal").addEventListener("click", handleReset);
    micCircle.addEventListener("click", toggleListening);
    textForm.addEventListener("submit", handleTextSubmit);
  }

  // ── Inject Live Search State Banner ────────────────────────────────────────
  function renderStateBanner(state, chips) {
    // Remove existing banner if present
    if (bannerContainer) {
      bannerContainer.remove();
      bannerContainer = null;
    }

    // Helper to extract chips if missing
    const adapter = window.__VoiceFilterAdapter;
    const activeChips = (chips && chips.length > 0)
      ? chips
      : (adapter ? adapter.generateChipsFromState(state) : []);

    if (!activeChips || activeChips.length === 0) return;

    bannerContainer = document.createElement("div");
    bannerContainer.id = "voicefilter-banner";

    const chipsHtml = activeChips
      .map((c) => {
        const isSem = c.field?.startsWith("semantic_");
        return `<span class="voicefilter-banner-chip ${isSem ? "semantic" : ""}">${escapeHtml(c.label)}</span>`;
      })
      .join("");

    bannerContainer.innerHTML = `
      <div id="voicefilter-banner-content">
        <div id="voicefilter-banner-left">
          <span id="voicefilter-banner-tag">VOICEFILTER</span>
          <span id="voicefilter-banner-title">Conversation &rarr; Search State</span>
          <span id="voicefilter-banner-subtitle">&ldquo;Your search, evolving with you&rdquo;</span>
        </div>
        <div id="voicefilter-banner-chips">
          ${chipsHtml}
        </div>
        <div id="voicefilter-banner-actions">
          <button id="voicefilter-banner-undo" class="voicefilter-btn-action"><span>↩</span> Undo</button>
          <button id="voicefilter-banner-reset" class="voicefilter-btn-action"><span>🗑️</span> Reset</button>
        </div>
      </div>
    `;

    // Defensive Target Container Resolution
    const searchTarget = document.querySelector("#search") || document.querySelector(".s-main-slot");
    
    if (searchTarget && searchTarget.parentNode) {
      searchTarget.parentNode.insertBefore(bannerContainer, searchTarget);
    } else {
      // Safe Fixed Overlay Fallback to prevent Amazon layout corruption
      bannerContainer.id = "voicefilter-banner-fixed";
      document.body.appendChild(bannerContainer);
    }

    // Wire Banner Actions
    document.getElementById("voicefilter-banner-undo")?.addEventListener("click", handleUndo);
    document.getElementById("voicefilter-banner-reset")?.addEventListener("click", handleReset);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
  }

  // ── Modal Actions ──────────────────────────────────────────────────────────
  function openModal() {
    overlay.style.display = "flex";
    errorBox.style.display = "none";
    transcriptEl.textContent = "";
    statusText.textContent = "Click the microphone to start";
    micCircle.classList.remove("listening", "processing");
  }

  function closeModal() {
    stopListeningCleanup();
    overlay.style.display = "none";
  }

  // ── Voice Speech Capture ───────────────────────────────────────────────────
  function toggleListening() {
    if (isProcessing) return;
    if (isListening) {
      stopListeningCleanup();
    } else {
      startListening();
    }
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showError("Voice search is not supported in this browser. Please type your query below.");
      return;
    }

    accumulatedText = "";
    transcriptEl.textContent = "";
    errorBox.style.display = "none";

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListening = true;
        micCircle.classList.add("listening");
        statusText.textContent = "Listening...";
      };

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const current = (final || interim).trim();
        if (current) accumulatedText = current;
        transcriptEl.textContent = current ? `"${current}"` : "";

        if (final) {
          handleFinalSpeech(final.trim());
          return;
        }

        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (accumulatedText.trim()) {
            handleFinalSpeech(accumulatedText.trim());
          }
        }, SILENCE_THRESHOLD_MS);
      };

      recognition.onerror = (event) => {
        console.warn("[VoiceFilter] Speech error:", event.error);
        clearTimers();
        isListening = false;
        micCircle.classList.remove("listening");

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          showError("Microphone permission denied. Please allow mic access in your browser.");
        } else if (event.error === "network") {
          showError("Speech service unreachable. Please type your query below.");
        }
        statusText.textContent = "Click the microphone to start";
      };

      recognition.onend = () => {
        isListening = false;
        micCircle.classList.remove("listening");
      };

      maxTimer = setTimeout(() => {
        if (accumulatedText.trim()) {
          handleFinalSpeech(accumulatedText.trim());
        } else {
          stopListeningCleanup();
        }
      }, 15000);

      recognition.start();
    } catch (err) {
      console.error("[VoiceFilter] Recognition exception:", err);
      showError("Could not start voice search. Please type your query below.");
    }
  }

  function stopListeningCleanup() {
    clearTimers();
    if (recognition) {
      try { recognition.abort(); } catch (e) { /* ignore */ }
      recognition = null;
    }
    isListening = false;
    micCircle.classList.remove("listening", "processing");
    statusText.textContent = "Click the microphone to start";
  }

  function clearTimers() {
    clearTimeout(silenceTimer);
    clearTimeout(maxTimer);
    silenceTimer = null;
    maxTimer = null;
  }

  // ── Text & Action Event Handlers ───────────────────────────────────────────
  function handleTextSubmit(e) {
    e.preventDefault();
    const text = textInput.value.trim();
    if (!text || isProcessing) return;
    textInput.value = "";
    processUtterance(text);
  }

  function handleFinalSpeech(text) {
    clearTimers();
    if (recognition) {
      try { recognition.abort(); } catch (e) { /* ignore */ }
      recognition = null;
    }
    isListening = false;
    micCircle.classList.remove("listening");
    processUtterance(text);
  }

  function handleUndo() {
    if (isProcessing) return;
    isProcessing = true;
    statusText.textContent = "Reverting to previous search state...";
    if (micCircle) micCircle.classList.add("processing");

    chrome.runtime.sendMessage({ type: "VOICEFILTER_UNDO" }, (response) => {
      isProcessing = false;
      if (micCircle) micCircle.classList.remove("processing");

      if (!response || !response.success) {
        showError("Nothing to undo or backend error.");
        return;
      }

      const data = response.data;
      const adapter = window.__VoiceFilterAdapter;
      if (adapter) {
        adapter.navigateToSearch(data.search_state);
      }
    });
  }

  function handleReset() {
    if (isProcessing) return;
    isProcessing = true;
    statusText.textContent = "Clearing all search filters...";
    if (micCircle) micCircle.classList.add("processing");

    chrome.runtime.sendMessage({ type: "VOICEFILTER_RESET" }, (response) => {
      isProcessing = false;
      if (micCircle) micCircle.classList.remove("processing");

      if (!response || !response.success) {
        showError("Could not reset search state.");
        return;
      }

      window.location.href = "https://www.amazon.in/";
    });
  }

  function processUtterance(utterance) {
    isProcessing = true;
    micCircle.classList.add("processing");
    statusText.textContent = "Understanding...";
    transcriptEl.textContent = `"${utterance}"`;
    errorBox.style.display = "none";

    chrome.runtime.sendMessage(
      {
        type: "VOICEFILTER_CONVERSE",
        payload: { utterance },
      },
      (response) => {
        isProcessing = false;
        micCircle.classList.remove("processing");

        if (chrome.runtime.lastError) {
          showError("Could not connect to VoiceFilter backend. Is it running?");
          statusText.textContent = "Connection error";
          return;
        }

        if (!response || !response.success) {
          showError(response?.error || "Backend error. Please try again.");
          statusText.textContent = "Error";
          return;
        }

        const data = response.data;
        currentSearchState = data.search_state;
        currentChips = data.chips || [];

        statusText.textContent = data.acknowledgment || "Applying filters...";

        setTimeout(() => {
          const adapter = window.__VoiceFilterAdapter;
          if (adapter) {
            adapter.navigateToSearch(currentSearchState);
          }
        }, 500);
      }
    );
  }

  function showError(msg) {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.style.display = "block";
    }
  }

  // ── Restore State on Reload & Initialize ────────────────────────────────────
  function loadLocalStateAndRenderBanner() {
    chrome.runtime.sendMessage({ type: "VOICEFILTER_GET_LOCAL_STATE" }, (response) => {
      if (response && response.success && response.data) {
        const localData = response.data;
        currentSearchState = localData.searchState;
        currentChips = localData.chips || [];
        renderStateBanner(currentSearchState, currentChips);
      }
    });
  }

  function init() {
    injectFloatingButton();
    injectModal();
    loadLocalStateAndRenderBanner();
    console.log("[VoiceFilter] Extension initialized on", window.location.hostname);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
