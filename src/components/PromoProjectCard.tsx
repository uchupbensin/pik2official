'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export default function PromoProjectCard({ project }: { project: any }) {
    const isExternal = project.slug?.startsWith('http');
    const projectUrl = isExternal ? project.slug : `/project/${project.slug}`;

    // Collect all candidate images for the slider
    const images: string[] = [];
    
    // 1. Check if cover_images JSON exists
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

    // 2. Add primary cover_image if not already present
    if (project?.cover_image && !images.includes(project.cover_image)) {
        images.unshift(project.cover_image);
    }

    // 3. Fallback: If still only 1 image or empty, check project_images
    if (images.length <= 1 && project?.project_images && Array.isArray(project.project_images)) {
        project.project_images.forEach((img: any) => {
            const path = img?.image_path || img;
            if (path && typeof path === 'string' && !images.includes(path)) {
                images.push(path);
            }
        });
    }

    // 4. Fallback if no images found
    if (images.length === 0) {
        images.push('/pik2.png');
    }

    // Helper to format image URL
    const formatUrl = (path: string) => {
        if (!path) return '/pik2.png';
        if (path.startsWith('http') || path.startsWith('/')) return path;
        return `/api/${path}`;
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

        // Ensure horizontal swipe is dominant and above threshold
        if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
                // Swiped left -> Next
                setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
            } else {
                // Swiped right -> Prev
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

    const currentImg = images[currentIndex] || images[0];

    return (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-shadow duration-500 h-full relative">
            {/* Top Image Slider Section */}
            <div 
                className="relative w-full aspect-square overflow-hidden bg-gray-100 select-none group/slider"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Background blur from current image for letterbox fill */}
                <img 
                    src={formatUrl(currentImg)}
                    alt="" 
                    aria-hidden="true" 
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-25 scale-125 pointer-events-none transition-all duration-500" 
                />

                {/* Main Link to Project */}
                <Link 
                    href={projectUrl} 
                    target={isExternal ? '_blank' : '_self'} 
                    className="relative z-10 w-full h-full flex items-center justify-center block cursor-pointer"
                >
                    <img 
                        src={formatUrl(currentImg)} 
                        alt={`${project.name} - Foto ${currentIndex + 1}`}
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-all duration-500"
                    />
                </Link>

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
                        {/* Prev Button */}
                        <button
                            type="button"
                            onClick={goToPrev}
                            aria-label="Foto Sebelumnya"
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg backdrop-blur-md transition-all opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 border border-white/40 cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                        </button>

                        {/* Next Button */}
                        <button
                            type="button"
                            onClick={goToNext}
                            aria-label="Foto Berikutnya"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg backdrop-blur-md transition-all opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 border border-white/40 cursor-pointer"
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

            {/* Bottom Content Section */}
            <div className="p-6 md:p-8 flex flex-col flex-grow bg-white relative z-0">
                <Link href={projectUrl} target={isExternal ? '_blank' : '_self'}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-[#1E356A] transition-colors">{project.name}</h3>
                </Link>
                
                {project.location && (
                    <p className="text-sm font-medium text-gray-500 mb-4">{project.location}</p>
                )}
                
                <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2">
                    {project.short_description || 'Temukan berbagai keunggulan dan kenyamanan gaya hidup eksklusif di properti pilihan ini.'}
                </p>

                {/* Footer: CTA Button */}
                <div className="mt-auto pt-4">
                    <Link href={projectUrl} target={isExternal ? '_blank' : '_self'}
                        className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-[#1E356A]/5 text-[#1E356A] border border-[#1E356A]/10 text-[15px] font-bold hover:bg-[#1E356A] hover:text-white transition-all duration-300 group-hover:shadow-md">
                        Lihat Detail Promo
                        <svg className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
