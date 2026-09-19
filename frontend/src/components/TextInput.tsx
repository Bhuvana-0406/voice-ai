'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useVoiceInput } from '@/hooks/useVoiceInput';

export const TextInput: React.FC = () => {
  const [text, setText] = useState('');
  const { converse, isLoading } = useAppStore();

  const handleFinalVoice = (finalText: string) => {
    if (finalText.trim()) {
      converse(finalText);
    }
  };

  const { isListening, interimTranscript, startListening, stopListening, isSupported, error } =
    useVoiceInput(handleFinalVoice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    const input = text;
    setText('');
    converse(input);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const samplePrompts = [
    'White sneakers',
    'Under ₹1,000',
    'Only Asian',
    'Actually make it 1500',
    'Something more comfortable',
    'Clear all filters',
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E7E7] p-3 sm:p-4 shadow-2xl">
      <div className="max-w-5xl mx-auto space-y-2">
        {/* Sample prompt chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
          <span className="font-bold text-[#565959] uppercase tracking-wider text-[10px] mr-1 hidden sm:inline">
            Try saying:
          </span>
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => converse(prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-[#F3F3F3] hover:bg-[#E3E3E3] text-[#0F1111] font-semibold border border-slate-300 transition-all whitespace-nowrap"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>

        {/* Interim voice transcript popup */}
        {(isListening || interimTranscript) && (
          <div className="bg-[#FFF8F5] border border-[#FF9900] text-[#0F1111] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-md animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
              <span>
                {interimTranscript || 'Listening... speak your shopping request now'}
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="text-xs text-[#C7511F] hover:underline font-bold ml-2"
            >
              Done
            </button>
          </div>
        )}

        {/* Error notification if mic fails */}
        {error && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs">
            <span>{error}</span>
          </div>
        )}

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          {/* Text Input Field */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Speak or type your shopping request... (e.g. 'white sneakers under 1000')"
              disabled={isLoading}
              className="w-full bg-white border border-slate-300 focus:border-[#FF9900] text-[#0F1111] placeholder-slate-500 rounded-xl px-4 py-3 text-sm shadow-sm transition-all outline-none"
            />
          </div>

          {/* Microphone Button */}
          {isSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isLoading}
              className={`p-3 rounded-xl border font-bold transition-all duration-200 flex items-center justify-center shrink-0 shadow-sm ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/30 animate-pulse'
                  : 'bg-[#FF9900] hover:bg-[#e08600] text-slate-950 border-[#FF9900]'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your request'}
              aria-label="Toggle voice microphone"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-[#FEBD69] hover:bg-[#F3A847] disabled:opacity-50 text-[#0F1111] font-bold text-sm transition-all shadow-sm shrink-0 flex items-center justify-center border border-[#F3A847]"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-[#0F1111]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <span>Search</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
