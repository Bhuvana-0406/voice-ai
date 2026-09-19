'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export const AcknowledgmentBar: React.FC = () => {
  const { acknowledgment, clarification, isLoading } = useAppStore();

  if (!acknowledgment && !clarification && !isLoading) return null;

  return (
    <div className="w-full px-4 sm:px-8 py-2 bg-[#FFF8F5] border-b border-[#F5D5C6] flex items-center justify-between transition-all text-[#0F1111]">
      <div className="flex items-center space-x-2.5 text-xs sm:text-sm">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {isLoading ? (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9900] opacity-75"></span>
          ) : (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          )}
        </span>
        <p className="font-medium text-[#0F1111] tracking-wide">
          {isLoading ? (
            <span className="text-[#C7511F] font-bold animate-pulse">VoiceFilter AI is updating search state...</span>
          ) : clarification ? (
            <span className="text-[#C7511F] font-bold">AI Question: {clarification}</span>
          ) : (
            <span className="text-[#0F1111] font-semibold">{acknowledgment}</span>
          )}
        </p>
      </div>
    </div>
  );
};
