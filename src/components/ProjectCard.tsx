'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export default function ProjectCard({ project }: { project: any }) {
  // Collect all candidate images for the slider
  const images: string[] = [];
  
  if (project?.cover_images) {
    try {
      const parsed = JSON.parse(project.cover_images);
      if (Array.isArray(parsed)) {
        parsed.forEach((img: string) => {
          if (img && typeof img === 'string') images.push(img);
        });
      }
    } catch {
      const split = project.cover_images.split(',').map((s: string) => s.trim()).filter(Boolean);
      images.push(...split);
    }
  }

  if (project?.cover_image && !images.includes(project.cover_image)) {
    images.unshift(project.cover_image);
  }

  if (images.length <= 1 && project?.project_images && Array.isArray(project.project_images)) {
    project.project_images.forEach((img: any) => {
      const path = img?.image_path || img;
      if (path && typeof path === 'string' && !images.includes(path)) {
        images.push(path);
      }
    });
  }

  const formatUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('/')) return path;
    if (path.startsWith('uploads/')) return `/api/${path}`;
    return `/api/uploads/${path}`;
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(idx);
  };

  const currentRawImg = images[currentIndex] || images[0];
  const coverUrl = formatUrl(currentRawImg);
  const alt = `${project.name} PIK 2 - ${currentIndex + 1}`;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full relative">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E356A] to-[#81A649] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
        
        {/* Cover with slider support */}
        <div 
          className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
            {coverUrl ? (
                <>
                    {/* Background subtle blur to fill letterbox gracefully */}
                    <img src={coverUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-25 scale-125 pointer-events-none transition-all duration-500" />
                    
                    {/* Main image completely visible without any cropping */}
                    <Link href={`/project/${project.slug}`} className="relative z-10 w-full h-full flex items-center justify-center cursor-pointer">
                      <img src={coverUrl} alt={alt} loading="lazy"
                           className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out" />
                    </Link>
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-[#1E356A]/5">
                    <svg className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4M12 11v10"/></svg>
                </div>
            )}

            {project.is_promo && (
                <span className="absolute top-4 left-4 z-20 bg-gradient-to-r from-[#81A649] to-[#8BC34A] text-white text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg shadow-[#81A649]/30 tracking-wider">
                    NEW LAUNCHING
                </span>
            )}

            {/* Multiple Images Indicator Badge */}
            {images.length > 1 && (
                <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 pointer-events-none">
                    <svg className="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span>{currentIndex + 1} / {images.length}</span>
                </div>
            )}

            {/* Left & Right Arrow Buttons (Shown when > 1 image) */}
            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={goToPrev}
                        aria-label="Foto Sebelumnya"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg backdrop-blur-md transition-all opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 border border-white/40 cursor-pointer"
                    >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                    </button>

                    <button
                        type="button"
                        onClick={goToNext}
                        aria-label="Foto Berikutnya"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg backdrop-blur-md transition-all opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 border border-white/40 cursor-pointer"
                    >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-2.5 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={(e) => goToIndex(e, idx)}
                                aria-label={`Slide ${idx + 1}`}
                                className={`transition-all duration-300 rounded-full cursor-pointer ${
                                    idx === currentIndex
                                        ? 'w-5 h-1.5 bg-white shadow-md'
                                        : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/90'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col flex-1 bg-white relative">
            <Link href={`/project/${project.slug}`}>
              <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 leading-tight group-hover:text-[#1E356A] transition-colors">{project.name}</h3>
            </Link>
            {project.location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2 font-medium">
                    <svg className="w-4 h-4 text-[#81A649]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth="2"/></svg>
                    <span>{project.location}</span>
                </div>
            )}
            {project.short_description && (
                <p className="text-sm text-gray-600 mt-4 line-clamp-3 leading-relaxed">{project.short_description}</p>
            )}
            <div className="mt-auto pt-6">
                <Link href={`/project/${project.slug}`}
                   className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-gray-50 text-[#1E356A] text-sm font-bold hover:bg-[#1E356A] hover:text-white transition-all duration-300 group-hover:shadow-md">
                    Lihat Detail Properti
                    <svg className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
            </div>
        </div>
    </div>
  );
}
