'use client';

import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full px-4 sm:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-900/60 border border-slate-800/60 rounded-2xl overflow-hidden animate-pulse flex flex-col h-[340px]"
          >
            <div className="aspect-square w-full bg-slate-800/80" />
            <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-3 w-1/3 bg-slate-800 rounded" />
                <div className="h-4 w-3/4 bg-slate-800 rounded" />
              </div>
              <div className="h-3 w-1/2 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
