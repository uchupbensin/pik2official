import React from 'react';
import Link from 'next/link';

export default function PromoProjectCard({ project }: { project: any }) {
    const isExternal = project.slug.startsWith('http');

    return (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-shadow duration-500">
            {/* Top Image Section */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                <img 
                    src={project.cover_image ? (project.cover_image.startsWith('http') ? project.cover_image : `/${project.cover_image}`) : '/pik2.png'} 
                    alt={project.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Green Arrow Button */}
                <Link href={isExternal ? project.slug : `/project/${project.slug}`} target={isExternal ? '_blank' : '_self'}
                    className="absolute -bottom-6 right-8 w-12 h-12 bg-[#81A649] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#6b8c3d] transition-colors z-10 group-hover:scale-110 duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                </Link>
            </div>

            {/* Bottom Content Section */}
            <div className="p-6 md:p-8 flex flex-col flex-grow bg-white relative z-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{project.name}</h3>
                
                {project.location && (
                    <p className="text-sm font-medium text-gray-500 mb-4">{project.location}</p>
                )}
                
                <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2">
                    {project.short_description || 'Temukan berbagai keunggulan dan kenyamanan gaya hidup eksklusif di properti pilihan ini.'}
                </p>

                {/* Footer: Avatars and Price/Badge */}
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex -space-x-2">
                        <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://ui-avatars.com/api/?name=Agent+1&background=random" alt="Agent 1" />
                        <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://ui-avatars.com/api/?name=Agent+2&background=random" alt="Agent 2" />
                        <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://ui-avatars.com/api/?name=Agent+3&background=random" alt="Agent 3" />
                    </div>
                    
                    <div className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-700 text-sm font-bold shadow-sm">
                        Mulai Rp 1 M
                    </div>
                </div>
            </div>
        </div>
    );
}
