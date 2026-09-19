'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  onSelectCategory: (categoryPrompt: string) => void;
  onOpenVoiceModal: () => void;
}

export const LandingHero: React.FC<Props> = ({ onSelectCategory, onOpenVoiceModal }) => {
  const { products } = useAppStore();

  const watchProducts = products.filter((p) => p.category === 'watches');
  const shoeProducts = products.filter((p) => p.category !== 'watches');

  return (
    <div className="w-full bg-[#EAEDED] pb-6 select-none font-sans space-y-6">
      {/* 1. Main Amazon Great Freedom Festival Orange Hero Banner */}
      <div className="relative w-full bg-gradient-to-r from-[#FF6B00] via-[#FF8800] to-[#FF4500] text-white p-6 sm:p-10 shadow-md">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-block bg-white text-[#FF4500] text-[11px] font-black uppercase px-2.5 py-0.5 rounded shadow-sm">
              Great Freedom Sale | Live Now
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Under ₹999 Deals &amp; Steals
            </h1>
            <p className="text-sm sm:text-base text-amber-100 font-medium">
              Massive discounts on Asian Sneakers, Titan Leather Watches &amp; Smartwatches. 10% Instant Discount on SBI &amp; HDFC Cards.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 items-center">
              <button
                onClick={() => onSelectCategory('Show me all products')}
                className="px-6 py-2.5 rounded-full bg-[#131921] hover:bg-[#232F3E] text-white font-bold text-xs sm:text-sm transition-all shadow-lg"
              >
                Shop All Festival Deals &rarr;
              </button>
              <button
                onClick={onOpenVoiceModal}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-[#0F1111] font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center gap-1.5 border border-slate-300"
              >
                <span>🎙️ Try Voice Search</span>
              </button>
            </div>
          </div>

          {/* Hero Banner Image Graphic */}
          <div className="shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
              alt="Festival Deals"
              className="max-h-56 object-contain rounded-2xl shadow-2xl border-4 border-white/20"
            />
          </div>
        </div>
      </div>

      {/* 2. Amazon 4-Card Top Grid (Exact layout from user screenshot) */}
      <div className="max-w-[1500px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-10 sm:-mt-14 relative z-10">
        {/* Card 1: Footwear Curated */}
        <div
          onClick={() => onSelectCategory('Show me white sneakers')}
          className="bg-white border border-[#E7E7E7] rounded-md p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="space-y-3">
            <h3 className="font-bold text-base text-[#0F1111] group-hover:text-[#C7511F]">
              Footwear curated for you
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80" alt="Sneaker" className="h-16 w-full object-contain mx-auto mb-1" />
                <div className="font-bold text-[#0F1111]">Casual | Under ₹1,000</div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&q=80" alt="Sneaker" className="h-16 w-full object-contain mx-auto mb-1" />
                <div className="font-bold text-[#0F1111]">White | Asian Pro</div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&q=80" alt="Sneaker" className="h-16 w-full object-contain mx-auto mb-1" />
                <div className="font-bold text-[#0F1111]">Sports | Running</div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80" alt="Sneaker" className="h-16 w-full object-contain mx-auto mb-1" />
                <div className="font-bold text-[#0F1111]">Premium | Above ₹1,500</div>
              </div>
            </div>
          </div>
          <div className="pt-3 text-xs font-bold text-[#007185] group-hover:underline">
            See all footwear offers
          </div>
        </div>

        {/* Card 2: Shop Watches by Brand */}
        <div
          onClick={() => onSelectCategory('Show me watches')}
          className="bg-white border border-[#E7E7E7] rounded-md p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="space-y-3">
            <h3 className="font-bold text-base text-[#0F1111] group-hover:text-[#C7511F]">
              Shop by brand | Deals on top watches
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&q=80" alt="Titan" className="h-16 w-full object-contain mx-auto mb-1" />
                <div className="font-bold text-[#0F1111]">Titan | Leather</div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1539185441755-769473a23570?w=300&q=80" alt="Casio" className="h-16 w-full object-contain mx-auto mb-1" />
                <div className="font-bold text-[#0F1111]">Casio | Vintage</div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=300&q=80" alt="Fastrack" className="h-16 w-full object-contain mx-auto mb-1" />
                <div className="font-bold text-[#0F1111]">Fastrack | Digital</div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&q=80" alt="boAt" className="h-16 w-full object-contain mx-auto mb-1" />
                <div className="font-bold text-[#0F1111]">boAt | Smartwatch</div>
              </div>
            </div>
          </div>
          <div className="pt-3 text-xs font-bold text-[#007185] group-hover:underline">
            See all watch deals
          </div>
        </div>

        {/* Card 3: Bestselling Smartwatches */}
        <div
          onClick={() => onSelectCategory('Show me smartwatch')}
          className="bg-white border border-[#E7E7E7] rounded-md p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="space-y-3">
            <h3 className="font-bold text-base text-[#0F1111] group-hover:text-[#C7511F]">
              Up to 70% off | Smartwatches &amp; Tech
            </h3>
            <div className="aspect-video w-full bg-slate-100 rounded overflow-hidden flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80"
                alt="Smartwatches"
                className="max-h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <p className="text-xs font-bold text-[#CC0C39]">
              Starting ₹1,499 <span className="text-slate-500 font-normal">| Bluetooth Calling &amp; Fitness Tracker</span>
            </p>
          </div>
          <div className="pt-3 text-xs font-bold text-[#007185] group-hover:underline">
            See all smartwatch offers
          </div>
        </div>

        {/* Card 4: VoiceFilter Assistant Portal */}
        <div
          onClick={onOpenVoiceModal}
          className="bg-gradient-to-br from-[#131921] via-[#232F3E] to-[#131921] text-white border-2 border-[#FF9900]/60 rounded-md p-4 flex flex-col justify-between cursor-pointer shadow-md hover:shadow-xl hover:border-[#FF9900] transition-all group"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎙️</span>
              <div>
                <span className="bg-[#FF9900] text-slate-950 font-black text-[9px] uppercase px-1.5 py-0.2 rounded tracking-widest">
                  VOICEFILTER
                </span>
                <h3 className="font-extrabold text-base text-white leading-tight">
                  Your voice is the new filter.
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Speak naturally. We&apos;ll refine your search. No manual filter dropdowns needed!
            </p>
            <div className="bg-white/10 p-2.5 rounded-lg border border-amber-500/40 text-xs font-bold text-amber-300">
              &ldquo;White sneakers under 1000, only Asian&rdquo;
            </div>
          </div>
          <div className="pt-3 text-xs font-bold text-[#FF9900] group-hover:underline">
            Tap to Launch VoiceFilter &rarr;
          </div>
        </div>
      </div>

      {/* 3. Horizontal Carousel 1: Blockbuster Deals are live | Shop now */}
      <div className="max-w-[1500px] mx-auto px-4">
        <div className="bg-white border border-[#E7E7E7] rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-[#0F1111]">
              Blockbuster Deals are live | Shop now
            </h2>
            <button
              onClick={() => onSelectCategory('Show me all products')}
              className="text-xs font-bold text-[#007185] hover:text-[#C7511F] hover:underline"
            >
              See all deals
            </button>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            {products.slice(0, 10).map((prod) => (
              <div
                key={prod.id}
                onClick={() => onSelectCategory(`Show me ${prod.name}`)}
                className="shrink-0 w-44 bg-slate-50 border border-slate-200 rounded-md p-2.5 cursor-pointer hover:border-[#FF9900] transition-all group"
              >
                <div className="h-32 w-full bg-white rounded p-1 flex items-center justify-center overflow-hidden mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={prod.image_url} alt={prod.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                </div>
                <div className="inline-block bg-[#CC0C39] text-white text-[10px] font-bold px-1.5 py-0.5 rounded mb-1">
                  25% off Freedom Sale
                </div>
                <div className="text-xs font-bold text-[#0F1111] line-clamp-1 group-hover:text-[#C7511F]">
                  {prod.name}
                </div>
                <div className="text-xs font-extrabold text-[#0F1111] mt-0.5">
                  ₹{Math.floor(prod.price)} <span className="text-[10px] text-slate-400 line-through font-normal">₹{Math.round(prod.price * 1.25)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Horizontal Carousel 2: Up to 70% off on | Bestselling Smartwatches & Timepieces */}
      <div className="max-w-[1500px] mx-auto px-4">
        <div className="bg-white border border-[#E7E7E7] rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-[#0F1111]">
              Up to 70% off on | Bestselling Smartwatches &amp; Timepieces
            </h2>
            <button
              onClick={() => onSelectCategory('Show me watches')}
              className="text-xs font-bold text-[#007185] hover:text-[#C7511F] hover:underline"
            >
              See all offers
            </button>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            {watchProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onSelectCategory(`Show me ${prod.brand} watch`)}
                className="shrink-0 w-44 bg-slate-50 border border-slate-200 rounded-md p-2.5 cursor-pointer hover:border-[#FF9900] transition-all group"
              >
                <div className="h-32 w-full bg-white rounded p-1 flex items-center justify-center overflow-hidden mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={prod.image_url} alt={prod.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                </div>
                <div className="text-xs font-bold text-[#0F1111] line-clamp-1 group-hover:text-[#C7511F]">
                  {prod.name}
                </div>
                <div className="text-xs font-extrabold text-[#0F1111] mt-1">
                  ₹{Math.floor(prod.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Horizontal Carousel 3: Up to 60% off | Top Brands in Footwear & Sneakers */}
      <div className="max-w-[1500px] mx-auto px-4">
        <div className="bg-white border border-[#E7E7E7] rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-[#0F1111]">
              Up to 60% off | Top Brands in Footwear &amp; Sneakers
            </h2>
            <button
              onClick={() => onSelectCategory('Show me white sneakers')}
              className="text-xs font-bold text-[#007185] hover:text-[#C7511F] hover:underline"
            >
              See all footwear
            </button>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            {shoeProducts.slice(0, 10).map((prod) => (
              <div
                key={prod.id}
                onClick={() => onSelectCategory(`Show me ${prod.name}`)}
                className="shrink-0 w-44 bg-slate-50 border border-slate-200 rounded-md p-2.5 cursor-pointer hover:border-[#FF9900] transition-all group"
              >
                <div className="h-32 w-full bg-white rounded p-1 flex items-center justify-center overflow-hidden mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={prod.image_url} alt={prod.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                </div>
                <div className="text-xs font-bold text-[#0F1111] line-clamp-1 group-hover:text-[#C7511F]">
                  {prod.name}
                </div>
                <div className="text-xs font-extrabold text-[#0F1111] mt-1">
                  ₹{Math.floor(prod.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
