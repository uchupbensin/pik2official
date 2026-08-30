'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteSettings } from '@prisma/client';

type MenuItem = {
    label: string;
    url: string;
    children?: MenuItem[];
};

export default function Navbar({
    siteSetting,
    menus
}: {
    siteSetting: SiteSettings | null;
    menus: MenuItem[];
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    const isHome = pathname === '/';
    const isTransparent = false; // Disabled because home page now has a white background

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Trigger once to set initial state
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleDropdown = (id: string) => {
        setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const siteName = siteSetting?.site_name ?? 'PIK 2 OFFICIAL';
    const waNumber = siteSetting?.sales_whatsapp_number ?? '6281234567890';

    let cleanWa = waNumber.replace(/\D+/g, '');
    if (cleanWa.startsWith('0')) {
        cleanWa = '62' + cleanWa.substring(1);
    }
    const waLink = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent('Halo, saya ingin bertanya mengenai properti di PIK 2.');

    return (
        <>
            {/* MAIN NAVBAR */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparent ? 'bg-transparent border-transparent text-white pt-2' : 'bg-white border-b border-gray-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] text-gray-800'}`}>
                <div className="max-w-[100rem] mx-auto px-4 sm:px-8 lg:px-12">
                    <div className="flex items-center justify-between h-20 sm:h-24">
                        {/* Left: Logo */}
                        <div className="flex-1 flex justify-start">
                            <Link href="/" className="flex items-center gap-3 group z-50">
                                <img src="/logo.png" alt={siteName} className="h-10 sm:h-12 w-auto group-hover:scale-105 transition-transform duration-300" />
                            </Link>
                        </div>

                        {/* Center: Desktop nav */}
                        <div className="hidden lg:flex flex-none items-center justify-center gap-6 xl:gap-8">
                            {menus.map((menu) => {
                                const hasChildren = menu.children && menu.children.length > 0;
                                return (
                                    <div className="relative group" key={menu.label}>
                                        <Link href={menu.url}
                                            target={menu.url.startsWith('http') ? '_blank' : '_self'}
                                            className="flex items-center gap-1.5 px-4 py-2 text-[15px] font-medium transition-all duration-300 rounded-full text-gray-600 hover:bg-[#1E356A] hover:text-white">
                                            {menu.label}
                                            {hasChildren && (
                                                <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180 group-hover:text-white text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            )}
                                        </Link>

                                        {/* Dropdown */}
                                        {hasChildren && (
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                                                <div className="bg-white text-gray-800 border border-gray-100 shadow-xl rounded-2xl py-2 relative">
                                                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#81A649] rounded-t-2xl"></div>
                                                    {menu.children!.map((child) => {
                                                        const hasGrandChildren = child.children && child.children.length > 0;
                                                        return (
                                                        <div key={child.label} className="relative group/sub">
                                                            <Link href={child.url}
                                                                target={child.url.startsWith('http') ? '_blank' : '_self'}
                                                                className="flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-600 hover:bg-[#1E356A] hover:text-white transition-colors">
                                                                {child.label}
                                                                {hasGrandChildren && (
                                                                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover/sub:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                                )}
                                                            </Link>
                                                            {hasGrandChildren && (
                                                                <div className="absolute left-full top-0 pl-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 w-56 z-50">
                                                                    <div className="bg-white text-gray-800 border border-gray-100 shadow-xl rounded-2xl py-2 relative">
                                                                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#81A649] rounded-l-2xl"></div>
                                                                        {child.children!.map((grandChild) => (
                                                                            <Link href={grandChild.url}
                                                                                key={grandChild.label}
                                                                                target={grandChild.url.startsWith('http') ? '_blank' : '_self'}
                                                                                className="block px-5 py-3 text-sm font-medium text-gray-600 hover:bg-[#1E356A] hover:text-white transition-colors">
                                                                                {grandChild.label}
                                                                            </Link>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )})}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex-1 flex justify-end items-center gap-4 z-50">
                            {/* Desktop Marketing Info & CTA */}
                            <div className="hidden lg:flex items-center gap-5">
                                <div className="flex flex-col items-end text-right justify-center">
                                    <span className={`text-[9px] font-bold tracking-widest uppercase leading-tight ${isTransparent ? 'text-white/80' : 'text-gray-400'} mb-0.5`}>Official Marketing InHouse PIK2</span>
                                    <span className={`text-sm font-extrabold leading-none ${isTransparent ? 'text-white' : 'text-[#1E356A]'}`}>Wisnu Manggala</span>
                                    <a href={waLink} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 mt-1 group/wa`}>
                                        <svg className={`w-3.5 h-3.5 ${isTransparent ? 'text-white' : 'text-[#81A649]'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        <span className={`text-[12px] font-bold leading-none ${isTransparent ? 'text-white' : 'text-[#81A649]'} group-hover/wa:underline`}>+6282210100303</span>
                                    </a>
                                </div>
                                <a href={waLink} target="_blank" rel="noopener noreferrer"
                                    className={`group inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 ${isTransparent ? 'bg-white text-[#1E356A] hover:shadow-lg hover:-translate-y-0.5' : 'bg-[#81A649] text-white hover:bg-[#6c8d3d] shadow-md shadow-[#81A649]/20 hover:shadow-lg hover:shadow-[#81A649]/40 hover:-translate-y-0.5'}`}>
                                    <svg className="w-4 h-4 group-hover:animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    Konsultasi
                                </a>
                            </div>

                            {/* Mobile Marketing Info & Menu */}
                            <div className="lg:hidden flex items-center gap-2 sm:gap-4">
                                <div className="flex flex-col items-end text-right justify-center">
                                    <span className={`text-[7px] sm:text-[8px] font-bold tracking-widest uppercase leading-tight ${isTransparent ? 'text-white/70' : 'text-gray-400'} mb-0.5`}>Official Marketing InHouse PIK2</span>
                                    <span className={`text-[11px] sm:text-xs font-extrabold leading-none ${isTransparent ? 'text-white' : 'text-[#1E356A]'}`}>Wisnu Manggala</span>
                                    <a href={waLink} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 mt-0.5 group/wa`}>
                                        <svg className={`w-3 h-3 ${isTransparent ? 'text-white' : 'text-[#81A649]'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        <span className={`text-[10px] sm:text-[11px] font-bold leading-none ${isTransparent ? 'text-white' : 'text-[#81A649]'} group-hover/wa:underline`}>+6282210100303</span>
                                    </a>
                                </div>
                                <button type="button" className={`inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-[11px] sm:text-xs tracking-wide transition-all ${isTransparent ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#1E356A]/5 text-[#1E356A] hover:bg-[#1E356A]/10'}`}
                                    onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                                    {!mobileOpen ? 'MENU' : 'CLOSE'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    <div className={`lg:hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-[85vh] overflow-y-auto opacity-100 py-3 pb-6' : 'max-h-0 overflow-hidden opacity-0'}`}>
                        <div className={`pt-2 space-y-1 rounded-2xl ${isTransparent ? 'bg-white/10 backdrop-blur-md border border-white/20 p-4' : 'border-t border-gray-100'}`}>
                            {menus.map((menu) => {
                                const hasChildren = menu.children && menu.children.length > 0;
                                return hasChildren ? (
                                    <div key={menu.label} className="rounded-xl overflow-hidden">
                                        <button type="button" className={`w-full flex items-center justify-between px-4 py-3.5 text-left text-[15px] font-semibold transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                                            onClick={() => toggleDropdown(menu.label)}>
                                            <span>{menu.label}</span>
                                            <svg className={`w-4 h-4 transition-transform duration-300 ${openDropdowns[menu.label] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ${openDropdowns[menu.label] ? 'max-h-[800px] overflow-y-auto' : 'max-h-0'}`}>
                                            <div className="pl-6 pr-4 py-2 space-y-1">
                                                {menu.children!.map((child) => {
                                                    const hasGrandChildren = child.children && child.children.length > 0;
                                                    const childKey = `${menu.label}-${child.label}`;
                                                    return hasGrandChildren ? (
                                                        <div key={child.label} className="rounded-lg overflow-hidden">
                                                            <button type="button" className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium transition-colors ${isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'}`}
                                                                onClick={() => toggleDropdown(childKey)}>
                                                                <span>{child.label}</span>
                                                                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${openDropdowns[childKey] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                            </button>
                                                            <div className={`overflow-hidden transition-all duration-300 ${openDropdowns[childKey] ? 'max-h-[1000px]' : 'max-h-0'}`}>
                                                                <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-gray-100 ml-4 mt-1 mb-2">
                                                                    {child.children!.map((grandChild) => (
                                                                        <Link href={grandChild.url}
                                                                            key={grandChild.label}
                                                                            onClick={() => setMobileOpen(false)}
                                                                            className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-[#1E356A] hover:bg-gray-50'}`}>
                                                                            {grandChild.label}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Link href={child.url}
                                                            key={child.label}
                                                            target={child.url.startsWith('http') ? '_blank' : '_self'}
                                                            onClick={() => setMobileOpen(false)}
                                                            className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-[#1E356A] hover:bg-gray-50'}`}>
                                                            {child.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link href={menu.url}
                                        key={menu.label}
                                        target={menu.url.startsWith('http') ? '_blank' : '_self'}
                                        onClick={() => setMobileOpen(false)}
                                        className={`block px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50 hover:text-[#1E356A]'}`}>
                                        {menu.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
