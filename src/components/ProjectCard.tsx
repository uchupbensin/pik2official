import React from 'react';
import Link from 'next/link';
import { Projects } from '@prisma/client';

export default function ProjectCard({ project }: { project: Projects }) {
  // We'll assume cover_image holds the path/URL to the image
  const coverUrl = project.cover_image ? `/storage/${project.cover_image}` : null;
  const alt = `${project.name} PIK 2`;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full relative">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E356A] to-[#81A649] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
        
        {/* Cover */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
            {coverUrl ? (
                <>
                    <img src={coverUrl} alt={alt} loading="lazy"
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    {/* Gradient Overlay for better contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-[#1E356A]/5">
                    <svg className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4M12 11v10"/></svg>
                </div>
            )}
            {project.is_promo && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-[#81A649] to-[#8BC34A] text-white text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg shadow-[#81A649]/30 tracking-wider">
                    NEW LAUNCHING
                </span>
            )}
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col flex-1 bg-white relative">
            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 leading-tight group-hover:text-[#1E356A] transition-colors">{project.name}</h3>
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
