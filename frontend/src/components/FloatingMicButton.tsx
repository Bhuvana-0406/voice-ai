'use client';

import React from 'react';

interface Props {
  onClick: () => void;
}

export const FloatingMicButton: React.FC<Props> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#FF9900] hover:bg-[#e08600] text-slate-950 flex items-center justify-center shadow-2xl shadow-[#FF9900]/50 border-2 border-white transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
      title="Tap to speak your shopping request"
      aria-label="Open voice search assistant"
    >
      <svg className="w-7 h-7 text-slate-950 group-hover:rotate-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
};
