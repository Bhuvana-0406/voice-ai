'use client';

import React from 'react';

export const AmazonFooter: React.FC = () => {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#131921] text-slate-300 font-sans text-xs mt-12 select-none">
      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="w-full py-3 bg-[#232F3E] hover:bg-[#37475A] text-center text-xs font-semibold text-white transition-colors cursor-pointer"
      >
        Back to top
      </button>

      {/* Main Footer Links Columns */}
      <div className="max-w-[1200px] mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-slate-700">
        {/* Col 1 */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-sm mb-3">Get to Know Us</h4>
          <ul className="space-y-1.5 text-slate-300 text-xs">
            <li className="hover:underline cursor-pointer">About Amazon</li>
            <li className="hover:underline cursor-pointer">Careers</li>
            <li className="hover:underline cursor-pointer">Press Releases</li>
            <li className="hover:underline cursor-pointer">Amazon Science</li>
          </ul>
        </div>

        {/* Col 2 */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-sm mb-3">Connect with Us</h4>
          <ul className="space-y-1.5 text-slate-300 text-xs">
            <li className="hover:underline cursor-pointer">Facebook</li>
            <li className="hover:underline cursor-pointer">Twitter</li>
            <li className="hover:underline cursor-pointer">Instagram</li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-sm mb-3">Make Money with Us</h4>
          <ul className="space-y-1.5 text-slate-300 text-xs">
            <li className="hover:underline cursor-pointer">Sell on Amazon</li>
            <li className="hover:underline cursor-pointer">Sell under Amazon Accelerator</li>
            <li className="hover:underline cursor-pointer">Protect and Build Your Brand</li>
            <li className="hover:underline cursor-pointer">Amazon Global Selling</li>
            <li className="hover:underline cursor-pointer">Become an Affiliate</li>
            <li className="hover:underline cursor-pointer">Fulfilment by Amazon</li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-sm mb-3">Let Us Help You</h4>
          <ul className="space-y-1.5 text-slate-300 text-xs">
            <li className="hover:underline cursor-pointer">Your Account</li>
            <li className="hover:underline cursor-pointer">Returns Centre</li>
            <li className="hover:underline cursor-pointer">100% Purchase Protection</li>
            <li className="hover:underline cursor-pointer">Amazon App Download</li>
            <li className="hover:underline cursor-pointer">Help</li>
          </ul>
        </div>
      </div>

      {/* Middle Bar: Logo + Language/Region */}
      <div className="py-6 flex flex-wrap items-center justify-center gap-6 border-b border-slate-800">
        <div className="flex items-center space-x-0.5 cursor-pointer">
          <span className="font-extrabold text-2xl tracking-tighter text-white font-serif">
            amazon<span className="text-[#FF9900] text-sm font-sans font-bold">.in</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="border border-slate-600 px-3 py-1 rounded text-xs text-slate-300 flex items-center gap-2 cursor-pointer hover:border-slate-400">
            <span>🌐 English</span>
          </div>
          <div className="border border-slate-600 px-3 py-1 rounded text-xs text-slate-300 flex items-center gap-2 cursor-pointer hover:border-slate-400">
            <span>🇮🇳 India</span>
          </div>
        </div>
      </div>

      {/* Sub Footer Services */}
      <div className="bg-[#131921] py-8 px-4">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] text-slate-400 text-center sm:text-left">
          <div>
            <div className="font-bold text-slate-200">AbeBooks</div>
            <div>Books, art &amp; collectibles</div>
          </div>
          <div>
            <div className="font-bold text-slate-200">Amazon Web Services</div>
            <div>Scalable Cloud Computing Services</div>
          </div>
          <div>
            <div className="font-bold text-slate-200">Audible</div>
            <div>Download Audio Books</div>
          </div>
          <div>
            <div className="font-bold text-slate-200">IMDb</div>
            <div>Movies, TV &amp; Celebrities</div>
          </div>
        </div>
        <div className="text-center text-[11px] text-slate-500 mt-6">
          &copy; 1996-2026, Amazon.com, Inc. or its affiliates
        </div>
      </div>
    </footer>
  );
};
