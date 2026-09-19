'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Header } from '@/components/Header';
import { LandingHero } from '@/components/LandingHero';
import { SidebarFilters } from '@/components/SidebarFilters';
import { SearchChips } from '@/components/SearchChips';
import { AcknowledgmentBar } from '@/components/AcknowledgmentBar';
import { ProductGrid } from '@/components/ProductGrid';
import { VoiceListeningModal } from '@/components/VoiceListeningModal';
import { FloatingMicButton } from '@/components/FloatingMicButton';
import { AmazonFooter } from '@/components/AmazonFooter';

export default function Home() {
  const { initSession, fetchInitialProducts, converse, chips, searchState, reset } = useAppStore();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFilteredView, setIsFilteredView] = useState(false);

  useEffect(() => {
    initSession();
    fetchInitialProducts();
  }, [initSession, fetchInitialProducts]);

  // Sync isFilteredView with search state & chips
  const hasActiveFilterState =
    chips.length > 0 ||
    searchState.category !== null ||
    searchState.subcategory !== null ||
    searchState.brand !== null ||
    searchState.color !== null ||
    searchState.max_price !== null ||
    searchState.min_price !== null ||
    searchState.query !== null;

  useEffect(() => {
    setIsFilteredView(hasActiveFilterState);
  }, [hasActiveFilterState]);

  const handleSelectCategory = (prompt: string) => {
    setIsFilteredView(true);
    converse(prompt);
  };

  const handleGoHome = () => {
    reset();
    setIsFilteredView(false);
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] text-[#0F1111] font-sans flex flex-col justify-between selection:bg-[#FEBD69] selection:text-[#0F1111] antialiased">
      <div>
        {/* Authentic Amazon Header */}
        <Header
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onGoHome={handleGoHome}
        />

        {/* CONDITION 1: AMAZON HOMEPAGE VIEW (Deals, Carousels, Deal Cards) */}
        {!isFilteredView ? (
          <LandingHero
            onSelectCategory={handleSelectCategory}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          />
        ) : (
          /* CONDITION 2: AMAZON SEARCH & FILTER RESULTS VIEW (Sidebar + Active Chips + Product Grid) */
          <div>
            {/* Active Search State Filter Chips */}
            <SearchChips />

            {/* AI Acknowledgment Bar */}
            <AcknowledgmentBar />

            {/* Main Amazon E-Commerce Grid with Left Filter Sidebar */}
            <div className="flex-grow max-w-[1500px] mx-auto w-full flex min-h-[60vh]">
              {/* Left Filter Sidebar */}
              <SidebarFilters />

              {/* Right Main Product Listing Grid */}
              <main className="flex-grow min-w-0 bg-[#EAEDED] p-3 sm:p-4">
                <ProductGrid />
              </main>
            </div>
          </div>
        )}
      </div>

      {/* Authentic Amazon Footer */}
      <AmazonFooter />

      {/* Floating Bottom-Right Microphone Action Button */}
      <FloatingMicButton onClick={() => setIsVoiceModalOpen(true)} />

      {/* Round Voice Search Listening Modal with Text Fallback */}
      <VoiceListeningModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
}
