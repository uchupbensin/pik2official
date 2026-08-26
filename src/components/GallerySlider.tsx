'use client';

import React, { useRef, useState, useEffect } from 'react';

type ProjectImage = {
    id: number;
    image_path: string;
    caption: string | null;
};

export default function GallerySlider({ images, projectName }: { images: ProjectImage[], projectName: string }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const maxScroll = scrollWidth - clientWidth;
            
            if (maxScroll <= 0) {
                setProgress(100);
            } else {
                const scrolled = (scrollLeft / maxScroll) * 100;
                setProgress(scrolled);
            }
        }
    };

    // Calculate initial progress on mount
    useEffect(() => {
        handleScroll();
        // Optional: recalculate on window resize
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, [images]);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const width = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollBy({ left: -width, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const width = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollBy({ left: width, behavior: 'smooth' });
        }
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="w-full relative">
            {/* Slider Container */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4 sm:px-6 lg:px-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* CSS to hide webkit scrollbar */}
                <style dangerouslySetInnerHTML={{__html: `
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}} />

                {images.map((img, index) => (
                    <div 
                        key={img.id} 
                        className="flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[45vw] snap-center relative group rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden bg-gray-100 shadow-xl"
                    >
                        {/* 4/5 Aspect Ratio for Portrait/Magazine look */}
                        <div className="w-full aspect-[4/5] relative">
                            <img 
                                src={img.image_path.startsWith('http') ? img.image_path : `/storage/${img.image_path}`} 
                                alt={img.caption || `${projectName} - Image ${index + 1}`}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            {/* Subtle Gradient Overlay for Text Readability */}
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

                            {/* Simple, Unobtrusive Caption Text */}
                            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10">
                                {img.caption ? (
                                    <div className="inline-block px-5 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white shadow-sm">
                                        <p className="text-sm md:text-[15px] font-medium tracking-wide">
                                            {img.caption}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="inline-block px-5 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white shadow-sm">
                                        <p className="text-sm md:text-[15px] font-medium tracking-wide">
                                            {projectName}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 mt-4 max-w-7xl mx-auto">
                {/* Left Button */}
                <button 
                    onClick={scrollLeft}
                    className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-[#1E356A] transition-all shadow-sm focus:outline-none flex-shrink-0"
                    aria-label="Previous image"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                </button>

                {/* Progress Bar */}
                <div className="flex-grow mx-6 md:mx-12 h-0.5 bg-gray-200 rounded-full relative overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-[#1E356A] rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.max(5, progress)}%` }} // Minimum 5% width so it's always visible
                    />
                </div>

                {/* Right Button */}
                <button 
                    onClick={scrollRight}
                    className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-[#1E356A] transition-all shadow-sm focus:outline-none flex-shrink-0"
                    aria-label="Next image"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                </button>
            </div>
        </div>
    );
}
