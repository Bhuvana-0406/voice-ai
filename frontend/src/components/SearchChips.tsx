'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { SearchChip } from './SearchChip';

export const SearchChips: React.FC = () => {
  const { chips, removeChip, totalResults } = useAppStore();

  if (chips.length === 0) return null;

  return (
    <div className="w-full bg-[#FFF8F5] border-b-2 border-[#FF9900]/40 px-4 sm:px-8 py-3 shadow-sm select-none">
      <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & USP Banner */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-black text-xs sm:text-sm tracking-wider uppercase text-[#0F1111] bg-amber-200/80 text-[#0F1111] px-2 py-0.5 rounded border border-amber-300">
              Conversation &rarr; Search State
            </span>
            <span className="text-[11px] font-bold text-[#C7511F] hidden lg:inline">
              &ldquo;Your search, evolving with you&rdquo;
            </span>
          </div>
        </div>

        {/* Active Filter Chips Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map((chip, idx) => (
            <SearchChip key={chip.field + '_' + idx} chip={chip} onRemove={removeChip} />
          ))}
        </div>

        {/* Results Counter */}
        <div className="text-xs text-[#565959] font-medium whitespace-nowrap hidden sm:block shrink-0">
          Showing <span className="text-[#0F1111] font-extrabold text-sm">{totalResults}</span> matching products
        </div>
      </div>
    </div>
  );
};
