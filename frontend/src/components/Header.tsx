'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  onOpenVoiceModal: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<Props> = ({ onOpenVoiceModal, onGoHome }) => {
  const { converse, undo, reset, chips, isLoading } = useAppStore();
  const [headerQuery, setHeaderQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerQuery.trim() || isLoading) return;
    converse(headerQuery);
    setHeaderQuery('');
  };

  const handleLogoClick = () => {
    reset();
    if (onGoHome) onGoHome();
  };

  return (
    <header className="w-full bg-[#131921] text-white shadow-md select-none font-sans">
      {/* Top Navbar */}
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Authentic Amazon Logo with Curved Orange Arrow */}
        <div onClick={handleLogoClick} className="flex items-center space-x-2 shrink-0 cursor-pointer p-1.5 hover:border hover:border-white rounded transition-all" title="Return to Amazon Homepage">
          <div className="flex flex-col">
            <div className="flex items-center space-x-0.5">
              <span className="font-extrabold text-2xl sm:text-3xl tracking-tighter text-white font-serif">
                amazon<span className="text-[#FF9900] text-base font-sans font-bold">.in</span>
              </span>
            </div>
            {/* Smile curved arrow accent */}
            <svg className="w-20 h-2.5 text-[#FF9900] -mt-1.5" viewBox="0 0 100 20" fill="none" stroke="currentColor">
              <path d="M10 5 Q 50 20 90 5" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Deliver To Location Picker */}
        <div className="hidden lg:flex items-center space-x-1.5 p-1.5 hover:border hover:border-white rounded cursor-pointer shrink-0">
          <svg className="w-4 h-4 text-white mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] text-slate-300">Delivering to Hyderabad 500081</span>
            <span className="text-xs font-bold text-white">Update location</span>
          </div>
        </div>

        {/* Main Search Bar (All Categories Dropdown + Search Box + Voice Mic + Orange Search Button) */}
        <form onSubmit={handleSearchSubmit} className="flex-grow max-w-3xl flex items-center h-10 rounded-md overflow-hidden bg-white text-slate-900 border-2 focus-within:border-[#FF9900] transition-all">
          {/* Category Dropdown */}
          <select className="hidden md:block bg-[#F3F3F3] hover:bg-[#E3E3E3] text-[#0F1111] text-xs font-medium px-2 h-full border-r border-slate-300 outline-none cursor-pointer">
            <option>All Categories</option>
            <option>Footwear &amp; Sneakers</option>
            <option>Watches &amp; Timepieces</option>
            <option>Fashion</option>
            <option>Electronics</option>
          </select>

          {/* Search Input Box */}
          <input
            type="text"
            value={headerQuery}
            onChange={(e) => setHeaderQuery(e.target.value)}
            placeholder="Search Amazon or speak naturally (e.g. 'white sneakers under 1000')..."
            className="w-full h-full px-3 text-xs sm:text-sm text-[#0F1111] placeholder-slate-500 outline-none bg-transparent"
          />

          {/* Integrated Mic Icon Button -> Triggers Pop-Up Round Voice Modal */}
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="h-full px-3 flex items-center justify-center transition-colors text-[#FF9900] hover:text-[#e08600] bg-slate-50 hover:bg-slate-100"
            title="Speak your shopping search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Bright Orange Amazon Search Button */}
          <button
            type="submit"
            className="bg-[#FEBD69] hover:bg-[#F3A847] text-[#0F1111] px-4 h-full flex items-center justify-center font-bold transition-colors shrink-0"
          >
            <svg className="w-5 h-5 text-[#0F1111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Right Tools: Returns & Orders, Cart */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 text-xs">
          <div className="hidden md:flex flex-col cursor-pointer p-1.5 hover:border hover:border-white rounded leading-tight">
            <span className="text-[11px] text-slate-300">Returns</span>
            <span className="font-bold text-white">&amp; Orders</span>
          </div>

          <div className="flex items-center space-x-1 font-bold text-white cursor-pointer p-1.5 hover:border hover:border-white rounded">
            <div className="relative">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="absolute -top-1 right-2 text-[#FF9900] font-black text-xs">0</span>
            </div>
            <span className="hidden sm:inline font-bold mt-2">Cart</span>
          </div>
        </div>
      </div>

      {/* Amazon Sub-Navbar (#232F3E) */}
      <div className="w-full bg-[#232F3E] border-t border-slate-700 px-4 py-1 flex items-center justify-between text-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-4 font-medium text-slate-200 whitespace-nowrap">
          <span onClick={handleLogoClick} className="font-bold text-white cursor-pointer flex items-center gap-1 hover:text-amber-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            All Categories
          </span>
          <span onClick={onOpenVoiceModal} className="hover:text-amber-400 cursor-pointer font-bold text-amber-300 flex items-center gap-1">
            🎙️ VoiceFilter Assistant
          </span>
          <span className="hover:text-amber-400 cursor-pointer">Fresh</span>
          <span className="hover:text-amber-400 cursor-pointer">Amazon MiniTV</span>
          <span className="hover:text-amber-400 cursor-pointer">Sell</span>
          <span className="hover:text-amber-400 cursor-pointer">Best Sellers</span>
          <span className="hover:text-amber-400 cursor-pointer">Today&apos;s Deals</span>
          <span className="hover:text-amber-400 cursor-pointer">Mobiles</span>
          <span className="hover:text-amber-400 cursor-pointer">Electronics</span>
          <span className="hover:text-amber-400 cursor-pointer">Prime</span>
        </div>

        {chips.length > 0 && (
          <div className="flex items-center space-x-2 shrink-0 ml-4">
            <button
              onClick={undo}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-[11px] font-semibold transition-all"
            >
              ↩ Undo
            </button>
            <button
              onClick={handleLogoClick}
              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition-all"
            >
              Reset to Home
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
