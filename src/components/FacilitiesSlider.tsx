'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Facilities } from '@prisma/client';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Building, Waves, Trees, Trophy, GraduationCap, Compass, Activity } from 'lucide-react';

interface FacilitiesSliderProps {
  facilities: Facilities[];
}

// Icon mapping based on category or title keywords
function getFacilityIcon(category?: string | null, title?: string | null) {
  const text = `${category || ''} ${title || ''}`.toLowerCase();
  if (text.includes('lokasi') || text.includes('akses') || text.includes('bandara') || text.includes('tol')) {
    return <MapPin className="w-4 h-4" />;
  }
  if (text.includes('cbd') || text.includes('bisnis') || text.includes('finansial')) {
    return <Building className="w-4 h-4" />;
  }
  if (text.includes('wisata') || text.includes('lifestyle') || text.includes('pantai') || text.includes('pasir')) {
    return <Waves className="w-4 h-4" />;
  }
  if (text.includes('green') || text.includes('taman') || text.includes('hijau')) {
    return <Trees className="w-4 h-4" />;
  }
  if (text.includes('mice') || text.includes('nice') || text.includes('hiburan') || text.includes('konser')) {
    return <Trophy className="w-4 h-4" />;
  }
  if (text.includes('pendidikan') || text.includes('kesehatan') || text.includes('sekolah') || text.includes('rumah sakit')) {
    return <GraduationCap className="w-4 h-4" />;
  }
  if (text.includes('ibadah') || text.includes('masjid') || text.includes('doa') || text.includes('religi')) {
    return <Compass className="w-4 h-4" />;
  }
  if (text.includes('olahraga') || text.includes('komunitas') || text.includes('sepeda') || text.includes('club')) {
    return <Activity className="w-4 h-4" />;
  }
  return <Sparkles className="w-4 h-4" />;
}

export default function FacilitiesSlider({ facilities }: FacilitiesSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);

    // Calculate approximate index
    const cardWidth = 360;
    const idx = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(idx, 0), facilities.length - 1));
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [facilities]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 380;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const formatImageUrl = (imgPath?: string | null) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('/')) {
      return imgPath;
    }
    if (imgPath.startsWith('uploads/')) {
      return `/api/${imgPath}`;
    }
    return `/api/uploads/${imgPath}`;
  };

  if (!facilities || facilities.length === 0) {
    return null;
  }

  return (
    <section id="fasilitas" aria-label="Keunggulan dan Fasilitas Kawasan PIK 2" className="relative py-20 lg:py-28 bg-[#F8FAFC] border-t border-b border-gray-100 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1E356A]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#81A649]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E356A]/10 text-[#1E356A] text-xs sm:text-sm font-bold tracking-wider uppercase mb-4">
              <Sparkles className="w-4 h-4 text-[#81A649]" />
              Masterplan & Kawasan Mandiri
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E356A] tracking-tight leading-tight">
              Keunggulan & Fasilitas Kawasan PIK 2
            </h2>
            <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed">
              Dirancang sebagai kota mandiri terintegrasi bertaraf internasional dengan fasilitas hunian, bisnis, pariwisata, dan konektivitas kelas dunia.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
            <span className="text-xs font-semibold text-gray-500 mr-2 hidden sm:inline-block">
              Geser untuk melihat ({facilities.length} Fasilitas)
            </span>
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Geser ke kiri"
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
                canScrollLeft
                  ? 'bg-white border-gray-200 text-[#1E356A] hover:bg-[#1E356A] hover:text-white shadow-md hover:shadow-lg cursor-pointer'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-60'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Geser ke kanan"
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
                canScrollRight
                  ? 'bg-[#1E356A] border-[#1E356A] text-white hover:bg-[#2B4A93] shadow-md hover:shadow-xl hover:shadow-[#1E356A]/20 cursor-pointer'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-60'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Horizontal Slider / Carousel Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto pb-8 pt-2 scroll-smooth snap-x snap-mandatory focus:outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollBehavior: 'smooth' }}
        >
          {facilities.map((facility, index) => {
            const imgUrl = formatImageUrl(facility.image_url);

            return (
              <div
                key={facility.id || index}
                className="w-[290px] sm:w-[340px] md:w-[380px] shrink-0 snap-start bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 flex flex-col group"
              >
                {/* Image Cover Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={facility.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1E356A]/10 via-[#81A649]/10 to-gray-100 flex items-center justify-center text-gray-400">
                      <Sparkles className="w-10 h-10 opacity-30 text-[#1E356A]" />
                    </div>
                  )}

                  {/* Top Gradient for Badge Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none"></div>

                  {/* Category / Icon Badge */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none gap-2">
                    {facility.category && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1E356A] text-[11px] font-bold shadow-sm uppercase tracking-wider">
                        {getFacilityIcon(facility.category, facility.title)}
                        <span>{facility.category}</span>
                      </span>
                    )}
                    {facility.badge && (
                      <span className="ml-auto inline-flex items-center px-2.5 py-1 rounded-full bg-[#81A649] text-white text-[11px] font-extrabold shadow-sm">
                        {facility.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 bg-white">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1E356A] transition-colors leading-snug mb-3">
                    {facility.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-normal">
                    {facility.description}
                  </p>

                  {/* Bottom Line Accent */}
                  <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-semibold text-[#1E356A] group-hover:text-[#81A649] transition-colors">
                    <span className="w-6 h-0.5 bg-[#81A649] rounded-full group-hover:w-10 transition-all duration-300"></span>
                    <span>Kawasan Eksklusif PIK 2</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pagination / Indicator Dots for Mobile swipe visual feedback */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {facilities.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => {
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTo({
                    left: dotIdx * 380,
                    behavior: 'smooth'
                  });
                }
              }}
              aria-label={`Slide ${dotIdx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === dotIdx
                  ? 'w-8 bg-[#1E356A]'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
