import React from 'react';
import Link from 'next/link';

export default function PromoProjectCard({ project }: { project: any }) {
    const isExternal = project.slug.startsWith('http');
    const projectUrl = isExternal ? project.slug : `/project/${project.slug}`;

    return (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-shadow duration-500 h-full">
            {/* Top Image Section */}
            <Link href={projectUrl} target={isExternal ? '_blank' : '_self'} className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 block">
                <img 
                    src={project.cover_image ? (project.cover_image.startsWith('http') ? project.cover_image : `/${project.cover_image}`) : '/pik2.png'} 
                    alt={project.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>

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
