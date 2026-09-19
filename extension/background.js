// ============================================================================
// VoiceFilter Extension — Background Service Worker
// ============================================================================
// Relays messages between content scripts and FastAPI backend.
// Manages tab-scoped state persistence in chrome.storage.local.
// ============================================================================

const API_BASE = "http://localhost:8000";

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id || "default";

  if (message.type === "VOICEFILTER_CONVERSE") {
    handleConverse(message.payload, tabId)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === "VOICEFILTER_UNDO") {
    handleUndo(tabId)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === "VOICEFILTER_RESET") {
    handleReset(tabId)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === "VOICEFILTER_GET_LOCAL_STATE") {
    getLocalState(tabId)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

/**
 * Handle conversational utterance
 */
async function handleConverse(payload, tabId) {
  const sessionId = `voicefilter_tab_${tabId}`;

  const response = await fetch(`${API_BASE}/api/converse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      utterance: payload.utterance,
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend responded with status ${response.status}`);
  }

  const data = await response.json();

  // Save to tab-scoped chrome.storage.local
  await saveLocalState(tabId, data);
  return data;
}

/**
 * Handle Undo action
 */
async function handleUndo(tabId) {
  const sessionId = `voicefilter_tab_${tabId}`;

  const response = await fetch(`${API_BASE}/api/converse/undo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) {
    throw new Error(`Backend undo failed with status ${response.status}`);
  }

  const data = await response.json();

  // Save updated restored state to chrome.storage.local
  await saveLocalState(tabId, data);
  return data;
}

/**
 * Handle Reset action
 */
async function handleReset(tabId) {
  const sessionId = `voicefilter_tab_${tabId}`;

  const response = await fetch(`${API_BASE}/api/converse/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) {
    throw new Error(`Backend reset failed with status ${response.status}`);
  }

  const data = await response.json();

  // Clear tab-scoped chrome.storage.local
  await clearLocalState(tabId);
  return data;
}

/**
 * Storage Helpers (Tab-Scoped chrome.storage.local)
 */
async function saveLocalState(tabId, data) {
  const storageKey = `voicefilter_session_${tabId}`;
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        [storageKey]: {
          searchState: data.search_state,
          chips: data.chips || [],
          acknowledgment: data.acknowledgment || "",
          updatedAt: Date.now(),
        },
      },
      resolve
    );
  });
}

async function getLocalState(tabId) {
  const storageKey = `voicefilter_session_${tabId}`;
  return new Promise((resolve) => {
    chrome.storage.local.get([storageKey], (result) => {
      resolve(result[storageKey] || null);
    });
  });
}

async function clearLocalState(tabId) {
  const storageKey = `voicefilter_session_${tabId}`;
  return new Promise((resolve) => {
    chrome.storage.local.remove([storageKey], resolve);
  });
}
