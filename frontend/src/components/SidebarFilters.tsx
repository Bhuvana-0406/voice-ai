'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export const SidebarFilters: React.FC = () => {
  const { searchState, converse, removeChip, reset } = useAppStore();

  const isWatchCategory = searchState.category?.toLowerCase() === 'watches' || searchState.subcategory !== null;

  const footwearCategories = [
    { id: 'sneakers', name: 'Sneakers' },
    { id: 'running_shoes', name: 'Running Shoes' },
    { id: 'casual_shoes', name: 'Casual Shoes' },
    { id: 'formal_shoes', name: 'Formal Shoes' },
  ];

  const watchCategories = [
    { id: 'watches', name: 'All Watches' },
    { id: 'smartwatch', name: 'Smartwatches' },
    { id: 'analog', name: 'Analog Watches' },
    { id: 'digital', name: 'Digital Watches' },
  ];

  const footwearBrands = ['Asian', 'Nike', 'Puma', 'Adidas', 'Campus', 'Sparx', 'Woodland', 'Red Tape'];
  const watchBrands = ['Titan', 'Fastrack', 'Casio', 'Fossil', 'Timex', 'boAt', 'Noise', 'Apple', 'Samsung'];

  const brands = isWatchCategory ? watchBrands : footwearBrands;

  const colors = [
    { name: 'white', bg: 'bg-white text-slate-900 border-slate-300 shadow-sm' },
    { name: 'black', bg: 'bg-slate-900 text-white border-slate-700' },
    { name: 'blue', bg: 'bg-blue-600 text-white border-blue-500' },
    { name: 'gold', bg: 'bg-amber-400 text-slate-950 border-amber-500 font-bold' },
    { name: 'silver', bg: 'bg-slate-300 text-slate-900 border-slate-400' },
    { name: 'brown', bg: 'bg-amber-800 text-white border-amber-900' },
  ];

  const priceRanges = [
    { label: 'Under ₹1,000', max: 1000 },
    { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
    { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
    { label: 'Over ₹5,000', min: 5000 },
  ];

  const handleCategoryClick = (catId: string) => {
    if (searchState.category?.toLowerCase() === catId.toLowerCase() || searchState.subcategory?.toLowerCase() === catId.toLowerCase()) {
      removeChip('category');
    } else {
      converse(`Show me ${catId.replace('_', ' ')}`);
    }
  };

  const handleBrandClick = (brandName: string) => {
    if (searchState.brand?.toLowerCase() === brandName.toLowerCase()) {
      removeChip('brand');
    } else {
      converse(`Only ${brandName}`);
    }
  };

  const handleColorClick = (colorName: string) => {
    if (searchState.color?.toLowerCase() === colorName.toLowerCase()) {
      removeChip('color');
    } else {
      converse(`In ${colorName}`);
    }
  };

  const handlePriceClick = (range: { min?: number; max?: number }) => {
    if (range.max && range.min) {
      converse(`Between ${range.min} and ${range.max}`);
    } else if (range.max) {
      converse(`Under ${range.max}`);
    } else if (range.min) {
      converse(`Above ${range.min}`);
    }
  };

  const hasActiveFilters =
    searchState.category ||
    searchState.brand ||
    searchState.color ||
    searchState.max_price !== null ||
    searchState.min_price !== null ||
    searchState.semantic_modifiers.length > 0;

  return (
    <aside className="w-60 shrink-0 hidden lg:block bg-white border-r border-[#E7E7E7] p-4 space-y-5 text-[#0F1111] select-none">
      {/* Category Selector Hub Toggle */}
      <div className="space-y-2 border-b border-[#E7E7E7] pb-3">
        <h3 className="text-xs font-bold text-[#0F1111] uppercase tracking-wide">Category Hub</h3>
        <div className="grid grid-cols-2 gap-1 bg-[#F3F3F3] p-1 rounded-lg">
          <button
            onClick={() => converse('Show me sneakers')}
            className={`py-1 text-xs font-bold rounded text-center transition-all ${
              !isWatchCategory ? 'bg-[#FF9900] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-[#0F1111]'
            }`}
          >
            👟 Shoes
          </button>
          <button
            onClick={() => converse('Show me watches')}
            className={`py-1 text-xs font-bold rounded text-center transition-all ${
              isWatchCategory ? 'bg-[#FF9900] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-[#0F1111]'
            }`}
          >
            ⌚ Watches
          </button>
        </div>
      </div>

      {/* Prime & Delivery Day */}
      <div className="space-y-2 border-b border-[#E7E7E7] pb-4">
        <h3 className="text-xs font-bold text-[#0F1111] uppercase tracking-wide">Amazon Prime</h3>
        <label className="flex items-center space-x-2 text-xs cursor-pointer text-[#007185] hover:text-[#C7511F] font-bold">
          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#007185] focus:ring-0" />
          <span className="text-[#00A8E1] font-extrabold italic">✓ prime</span>
        </label>
      </div>

      {/* Category Section */}
      <div className="space-y-2 border-b border-[#E7E7E7] pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#0F1111] uppercase tracking-wide">
            {isWatchCategory ? 'Watch Types' : 'Footwear Types'}
          </h3>
          {hasActiveFilters && (
            <button onClick={reset} className="text-[11px] font-semibold text-[#007185] hover:text-[#C7511F] underline">
              Clear All
            </button>
          )}
        </div>
        <div className="space-y-1">
          {(isWatchCategory ? watchCategories : footwearCategories).map((cat) => {
            const isSelected = searchState.category?.toLowerCase() === cat.id.toLowerCase() || searchState.subcategory?.toLowerCase() === cat.id.toLowerCase();
            return (
              <label
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center space-x-2 text-xs cursor-pointer p-1 rounded transition-colors ${
                  isSelected ? 'font-bold text-[#C7511F] bg-[#FFF8F5]' : 'text-[#0F1111] hover:text-[#C7511F]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="rounded border-slate-300 text-[#C7511F] focus:ring-0"
                />
                <span>{cat.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Brand Section */}
      <div className="space-y-2 border-b border-[#E7E7E7] pb-4">
        <h3 className="text-xs font-bold text-[#0F1111] uppercase tracking-wide">Brands</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {brands.map((b) => {
            const isSelected = searchState.brand?.toLowerCase() === b.toLowerCase();
            return (
              <label
                key={b}
                onClick={() => handleBrandClick(b)}
                className={`flex items-center space-x-2 text-xs cursor-pointer p-1 rounded transition-colors ${
                  isSelected ? 'font-bold text-[#C7511F] bg-[#FFF8F5]' : 'text-[#0F1111] hover:text-[#C7511F]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="rounded border-slate-300 text-[#C7511F] focus:ring-0"
                />
                <span>{b}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Color Swatches */}
      <div className="space-y-2 border-b border-[#E7E7E7] pb-4">
        <h3 className="text-xs font-bold text-[#0F1111] uppercase tracking-wide">Color</h3>
        <div className="flex flex-wrap gap-1.5">
          {colors.map((c) => {
            const isSelected = searchState.color?.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                onClick={() => handleColorClick(c.name)}
                className={`px-2 py-1 rounded text-[11px] font-medium border flex items-center gap-1 transition-all ${c.bg} ${
                  isSelected ? 'ring-2 ring-[#FF9900] font-bold scale-105' : 'opacity-90 hover:opacity-100'
                }`}
              >
                <span className="capitalize">{c.name}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Links */}
      <div className="space-y-2 border-b border-[#E7E7E7] pb-4">
        <h3 className="text-xs font-bold text-[#0F1111] uppercase tracking-wide">Price</h3>
        <div className="space-y-1">
          {priceRanges.map((r, i) => {
            const isSelected = searchState.max_price === r.max && (r.min ? searchState.min_price === r.min : true);
            return (
              <button
                key={i}
                onClick={() => handlePriceClick(r)}
                className={`w-full text-left text-xs p-1 rounded transition-colors ${
                  isSelected ? 'font-bold text-[#C7511F] bg-[#FFF8F5]' : 'text-[#007185] hover:text-[#C7511F]'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Avg. Customer Review */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#0F1111] uppercase tracking-wide">Customer Reviews</h3>
        <div className="space-y-1.5">
          {[4.5, 4.0, 3.5].map((star) => (
            <button
              key={star}
              onClick={() => converse(`Rated ${star} stars and above`)}
              className="w-full text-left text-xs hover:text-[#C7511F] flex items-center gap-1 text-[#FFA41C]"
            >
              <span className="text-sm">{'★'.repeat(Math.floor(star))}</span>
              <span className="text-[#007185] text-xs font-medium hover:text-[#C7511F]">&amp; Up</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
