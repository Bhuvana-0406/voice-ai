'use client';

import React from 'react';
import { FilterChip as FilterChipType } from '@/types/search-state';

interface Props {
  chip: FilterChipType;
  onRemove: (field: string) => void;
}

export const SearchChip: React.FC<Props> = ({ chip, onRemove }) => {
  const getStyle = () => {
    switch (chip.type) {
      case 'exclusion':
        return 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100';
      case 'semantic':
        return 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 font-bold';
      default:
        return 'bg-slate-100 border-slate-300 text-[#0F1111] hover:bg-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all duration-200 ${getStyle()}`}
    >
      <span>{chip.label}</span>
      {chip.removable && (
        <button
          onClick={() => onRemove(chip.field)}
          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors focus:outline-none text-slate-600 font-bold"
          aria-label={`Remove ${chip.label} filter`}
        >
          &times;
        </button>
      )}
    </span>
  );
};
