// ============================================================================
// VoiceFilter Extension — Amazon Adapter (Multi-Filter Engine & Chip Helper)
// ============================================================================
// Translates a SearchState object into a live Amazon.in search URL.
// ============================================================================

const AMAZON_SEARCH_BASE = "https://www.amazon.in/s";

/**
 * Build a search keyword string from SearchState fields.
 */
function buildSearchKeyword(state) {
  if (!state) return "";
  const parts = [];

  if (state.brand) {
    parts.push(state.brand);
  }

  if (state.color) {
    parts.push(state.color);
  }

  if (state.material) {
    parts.push(state.material);
  }

  // Category or general query
  if (state.category) {
    const categoryMap = {
      sneakers: "sneakers",
      running_shoes: "running shoes",
      casual_shoes: "casual shoes",
      formal_shoes: "formal shoes",
      watches: "watch",
      headphones: "headphones",
      earbuds: "earbuds",
      smartphones: "smartphone",
    };
    parts.push(categoryMap[state.category] || state.category.replace(/_/g, " "));
  }

  if (state.subcategory) {
    const subMap = {
      analog: "analog",
      digital: "digital",
      smartwatch: "smartwatch",
      chronograph: "chronograph",
      casual: "",
      sports: "sports",
    };
    const sub = subMap[state.subcategory];
    if (sub) parts.push(sub);
  }

  if (state.query && !state.category) {
    parts.push(state.query);
  }

  // Handle Brand Exclusions (e.g. -Nike)
  if (state.exclude_brands && state.exclude_brands.length > 0) {
    for (const exBrand of state.exclude_brands) {
      parts.push(`-${exBrand}`);
    }
  }

  // Semantic modifiers go at the end as descriptive keywords
  if (state.semantic_modifiers && state.semantic_modifiers.length > 0) {
    parts.push(...state.semantic_modifiers);
  }

  return parts.filter(Boolean).join(" ").trim();
}

/**
 * Build a complete Amazon.in search URL from a SearchState object.
 */
function buildAmazonUrl(state) {
  if (!state) return "https://www.amazon.in/";

  const keyword = buildSearchKeyword(state);

  if (!keyword && state.min_price === null && state.max_price === null) {
    return "https://www.amazon.in/";
  }

  const url = new URL(AMAZON_SEARCH_BASE);

  if (keyword) {
    url.searchParams.set("k", keyword);
  }

  // Price Filter (p_36 in paise: ₹1000 = 100000 paise)
  if (state.min_price !== null || state.max_price !== null) {
    const minPaise = state.min_price !== null ? Math.round(state.min_price * 100) : 0;
    const maxPaise = state.max_price !== null ? Math.round(state.max_price * 100) : "";
    url.searchParams.set("rh", `p_36:${minPaise}-${maxPaise}`);
  }

  // Sort Order Filter (s=)
  if (state.sort_by) {
    const sortMap = {
      price_asc: "price-asc-rank",
      price_desc: "price-desc-rank",
      rating: "review-rank",
      popularity: "review-rank",
    };
    if (sortMap[state.sort_by]) {
      url.searchParams.set("s", sortMap[state.sort_by]);
    }
  }

  return url.toString();
}

/**
 * Helper to generate human-readable chip objects from SearchState
 */
function generateChipsFromState(state) {
  if (!state) return [];
  const chips = [];

  if (state.category) {
    chips.push({ field: "category", label: state.category.replace(/_/g, " "), type: "exact" });
  }
  if (state.brand) {
    chips.push({ field: "brand", label: state.brand, type: "exact" });
  }
  if (state.color) {
    chips.push({ field: "color", label: state.color, type: "exact" });
  }
  if (state.max_price !== null) {
    chips.push({ field: "max_price", label: `Under ₹${Math.round(state.max_price).toLocaleString('en-IN')}`, type: "range" });
  }
  if (state.min_price !== null) {
    chips.push({ field: "min_price", label: `Above ₹${Math.round(state.min_price).toLocaleString('en-IN')}`, type: "range" });
  }
  if (state.exclude_brands && state.exclude_brands.length > 0) {
    for (const b of state.exclude_brands) {
      chips.push({ field: `exclude_brand_${b}`, label: `Not ${b}`, type: "exclude" });
    }
  }
  if (state.semantic_modifiers && state.semantic_modifiers.length > 0) {
    for (const sem of state.semantic_modifiers) {
      chips.push({ field: `semantic_${sem}`, label: `* ${sem}`, type: "semantic" });
    }
  }
  return chips;
}

/**
 * Navigate the current tab to the constructed Amazon search URL.
 */
function navigateToSearch(state) {
  const url = buildAmazonUrl(state);
  console.log("[VoiceFilter AmazonAdapter] Navigating to:", url);
  window.location.href = url;
}

// Export for content script
window.__VoiceFilterAdapter = {
  buildSearchKeyword,
  buildAmazonUrl,
  generateChipsFromState,
  navigateToSearch,
};
