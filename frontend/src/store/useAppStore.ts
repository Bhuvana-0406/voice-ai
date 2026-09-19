import { create } from 'zustand';
import { Product } from '@/types/product';
import { SearchState, FilterChip } from '@/types/search-state';
import { ConverseResponse } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AppState {
  sessionId: string;
  searchState: SearchState;
  products: Product[];
  totalResults: number;
  chips: FilterChip[];
  acknowledgment: string;
  clarification: string | null;
  isLoading: boolean;
  isVoiceActive: boolean;

  // Actions
  initSession: () => void;
  fetchInitialProducts: () => Promise<void>;
  converse: (utterance: string) => Promise<void>;
  removeChip: (field: string) => Promise<void>;
  undo: () => Promise<void>;
  reset: () => Promise<void>;
  setVoiceActive: (active: boolean) => void;
}

const emptyState: SearchState = {
  query: null,
  category: null,
  subcategory: null,
  brand: null,
  color: null,
  min_price: null,
  max_price: null,
  min_rating: null,
  size: null,
  material: null,
  gender: null,
  exclude_brands: [],
  exclude_colors: [],
  exclude_materials: [],
  semantic_modifiers: [],
  sort_by: 'relevance',
};

// Stable single session key to ensure frontend & backend context persistence
const STABLE_SESSION_ID = 'voicefilter_main_session';

export const useAppStore = create<AppState>((set, get) => ({
  sessionId: STABLE_SESSION_ID,
  searchState: emptyState,
  products: [],
  totalResults: 0,
  chips: [],
  acknowledgment: 'Welcome to VoiceFilter! Tell me what you\'re looking for.',
  clarification: null,
  isLoading: false,
  isVoiceActive: false,

  initSession: () => {
    set({ sessionId: STABLE_SESSION_ID });
  },

  fetchInitialProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/api/products?limit=50`);
      if (res.ok) {
        const data = await res.json();
        set({ products: data.products, totalResults: data.total, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      set({ isLoading: false });
    }
  },

  converse: async (utterance: string) => {
    if (!utterance.trim()) return;
    set({ isLoading: true });

    try {
      const res = await fetch(`${API_BASE}/api/converse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: get().sessionId,
          utterance: utterance.trim(),
        }),
      });

      if (res.ok) {
        const data: ConverseResponse = await res.json();
        set({
          searchState: data.search_state,
          products: data.products,
          totalResults: data.total_results,
          chips: data.chips,
          acknowledgment: data.acknowledgment,
          clarification: data.clarification,
          isLoading: false,
        });
      } else {
        set({
          acknowledgment: 'Unable to process request. Please try again.',
          isLoading: false,
        });
      }
    } catch (err) {
      console.error('Converse API error:', err);
      set({
        acknowledgment: 'Network error. Please check backend connection.',
        isLoading: false,
      });
    }
  },

  removeChip: async (field: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/api/converse/remove-filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: get().sessionId,
          field: field,
        }),
      });
      if (res.ok) {
        const data: ConverseResponse = await res.json();
        set({
          searchState: data.search_state,
          products: data.products,
          totalResults: data.total_results,
          chips: data.chips,
          acknowledgment: data.acknowledgment,
          clarification: data.clarification,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Failed to remove filter chip:', err);
      set({ isLoading: false });
    }
  },

  undo: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/api/converse/undo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: get().sessionId }),
      });
      if (res.ok) {
        const data: ConverseResponse = await res.json();
        set({
          searchState: data.search_state,
          products: data.products,
          totalResults: data.total_results,
          chips: data.chips,
          acknowledgment: data.acknowledgment,
          clarification: data.clarification,
          isLoading: false,
        });
      }
    } catch (err) {
      set({ isLoading: false });
    }
  },

  reset: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/api/converse/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: get().sessionId }),
      });
      if (res.ok) {
        const data: ConverseResponse = await res.json();
        set({
          searchState: data.search_state,
          products: data.products,
          totalResults: data.total_results,
          chips: [],
          acknowledgment: 'Cleared all filters.',
          clarification: null,
          isLoading: false,
        });
      }
    } catch (err) {
      set({ isLoading: false });
    }
  },

  setVoiceActive: (active: boolean) => set({ isVoiceActive: active }),
}));
