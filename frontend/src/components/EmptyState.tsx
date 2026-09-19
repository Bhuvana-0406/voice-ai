'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export const EmptyState: React.FC = () => {
  const { converse, reset, searchState } = useAppStore();

  return (
    <div className="w-full px-4 sm:px-8 py-16 flex flex-col items-center justify-center text-center bg-white rounded-md border border-[#E7E7E7] my-6">
      <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[#FF9900] mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <h3 className="text-base font-bold text-[#0F1111]">No products match your exact constraints</h3>
      <p className="text-xs text-[#565959] max-w-md mt-1 mb-6">
        Try relaxing your price limit or brand restriction to view available footwear.
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {searchState.max_price && (
          <button
            onClick={() => converse('Increase budget to 2000')}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] shadow-sm border border-[#FCD200] transition-all"
          >
            Increase budget to ₹2,000
          </button>
        )}
        {searchState.brand && (
          <button
            onClick={() => converse(`Remove ${searchState.brand} filter`)}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-[#0F1111] border border-slate-300 transition-all"
          >
            Remove {searchState.brand} filter
          </button>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 rounded-full text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-all"
        >
          Reset all filters
        </button>
      </div>
    </div>
  );
};
