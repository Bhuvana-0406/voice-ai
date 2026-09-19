'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceListeningModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { converse, isLoading } = useAppStore();
  const [manualText, setManualText] = useState('');

  const handleFinalVoice = (finalText: string) => {
    if (finalText.trim()) {
      converse(finalText);
      onClose();
    }
  };

  const { isListening, interimTranscript, startListening, stopListening, isSupported, error } =
    useVoiceInput(handleFinalVoice);

  // Auto-start listening when modal opens if supported
  React.useEffect(() => {
    if (isOpen && isSupported && !isListening) {
      startListening();
    }
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim() || isLoading) return;
    converse(manualText);
    setManualText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1111]/75 backdrop-blur-sm transition-all">
      <div className="relative w-full max-w-md bg-white border-2 border-[#FF9900] rounded-3xl p-6 text-center shadow-2xl text-[#0F1111] space-y-5 animate-in fade-in zoom-in-95">
        {/* Top Close Button */}
        <button
          onClick={() => {
            stopListening();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg hover:bg-slate-100 transition-colors"
          aria-label="Close voice modal"
        >
          &times;
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-block bg-[#FF9900] text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded tracking-widest mb-1 shadow-xs">
            VOICEFILTER
          </div>
          <h3 className="font-extrabold text-xl text-[#0F1111] tracking-tight">
            Your voice is the new filter.
          </h3>
          <p className="text-xs text-[#565959] font-medium mt-1">
            Speak naturally. We&apos;ll refine your search.
          </p>
        </div>

        {/* Round Pulsing Mic Graphic */}
        {!error && (
          <div className="relative py-4 flex flex-col items-center justify-center">
            {/* Pulsing Ripple Rings */}
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-24 w-24 rounded-full bg-[#FF9900]/30"></span>
              <span className="animate-pulse absolute inline-flex h-20 w-20 rounded-full bg-[#FF9900]/50"></span>
              
              <button
                onClick={isListening ? stopListening : startListening}
                className="relative z-10 w-16 h-16 rounded-full bg-[#FF9900] hover:bg-[#e08600] text-slate-950 flex items-center justify-center shadow-xl shadow-[#FF9900]/40 transition-transform active:scale-95 cursor-pointer"
                title={isListening ? 'Tap to pause' : 'Tap to speak'}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>

            {/* Interim Transcript Display */}
            <div className="mt-5 min-h-[3rem] px-3 flex items-center justify-center">
              <p className="text-sm font-bold text-[#0F1111] animate-pulse">
                {interimTranscript ? (
                  <span className="text-[#C7511F]">&ldquo;{interimTranscript}&rdquo;</span>
                ) : (
                  <span className="text-slate-500 font-medium">Listening... speak your request now</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Error Fallback Text Input (If speech fails or is unavailable) */}
        {error && (
          <div className="space-y-3 pt-2">
            <div className="bg-amber-50 border border-amber-300 text-amber-900 px-3.5 py-2 rounded-xl text-xs text-left">
              <span className="font-bold">Notice:</span> {error}
            </div>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Type your search request..."
                autoFocus
                className="w-full bg-white border border-slate-300 focus:border-[#FF9900] text-[#0F1111] rounded-xl px-3.5 py-2.5 text-xs outline-none shadow-inner"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#FEBD69] hover:bg-[#F3A847] text-[#0F1111] font-bold text-xs shrink-0 border border-[#F3A847]"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Sample Voice Prompts inside Modal */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Try saying:</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {['White sneakers', 'Under ₹1,000', 'Only Asian', 'Titan watch in black leather', 'Clear all filters'].map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  converse(prompt);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F1111] font-semibold text-[11px] border border-slate-200 transition-all"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
