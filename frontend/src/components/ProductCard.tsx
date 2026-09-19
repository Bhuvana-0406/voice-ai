'use client';

import React from 'react';
import { Product } from '@/types/product';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const originalPrice = Math.round(product.price * 1.25);

  return (
    <div className="group relative bg-white border border-[#E7E7E7] hover:border-[#FF9900] rounded-md overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md flex flex-col h-full p-3 font-sans">
      {/* #1 Best Seller Badge */}
      {product.rating >= 4.5 && (
        <div className="absolute top-0 left-0 z-10 bg-[#E67A00] text-white font-bold text-[10px] uppercase px-2 py-0.5 shadow-sm rounded-br">
          #1 Best Seller
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-white p-2 flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>

      {/* Details Block */}
      <div className="pt-2 flex flex-col flex-grow justify-between space-y-2.5">
        <div>
          {/* Brand Tag */}
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            {product.brand}
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-xs sm:text-sm text-[#0F1111] group-hover:text-[#C7511F] transition-colors line-clamp-2 leading-snug cursor-pointer">
            {product.name}
          </h3>

          {/* Star Rating & Review Count */}
          <div className="flex items-center space-x-1 mt-1 text-xs">
            <div className="flex text-[#FFA41C]">
              {'★'.repeat(Math.floor(product.rating))}
              {'☆'.repeat(5 - Math.floor(product.rating))}
            </div>
            <span className="text-[#007185] hover:text-[#C7511F] text-[11px] font-medium cursor-pointer">
              {product.rating} <span className="text-slate-500">({product.review_count.toLocaleString()})</span>
            </span>
          </div>

          {/* Amazon Price Block */}
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-xs text-[#0F1111] font-normal"><sup>₹</sup></span>
            <span className="text-xl font-bold text-[#0F1111] leading-none">
              {Math.floor(product.price).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 line-through ml-1">
              M.R.P.: ₹{originalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-bold text-[#CC0C39] ml-1">
              (20% off)
            </span>
          </div>

          {/* Amazon Prime & Delivery Tag */}
          <div className="mt-1.5 text-[11px] font-bold flex items-center space-x-1">
            <span className="text-[#00A8E1] italic">✓ prime</span>
            <span className="text-[#565959] font-normal">Get it by <strong className="text-[#0F1111]">Tomorrow</strong></span>
          </div>
          <div className="text-[10px] text-[#565959]">FREE Delivery by Amazon</div>
        </div>

        {/* Action Button: Authentic Amazon Yellow Button (#FFD814) */}
        <div className="pt-2 border-t border-[#E7E7E7]">
          <button className="w-full py-1.5 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium text-xs transition-colors shadow-sm border border-[#FCD200] active:bg-[#F0B800]">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
