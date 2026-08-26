'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});

    const toggleDropdown = (id: number) => {
        setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const siteName = siteSetting?.site_name ?? 'PIK 2 OFFICIAL';
    const topbarLabel = siteSetting?.topbar_label ?? 'Sales Property';
    const waNumber = siteSetting?.sales_whatsapp_number ?? '6281234567890';

    let cleanWa = waNumber.replace(/\D+/g, '');
    if (cleanWa.startsWith('0')) {
        cleanWa = '62' + cleanWa.substring(1);
    }
    const waLink = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent('Halo, saya ingin bertanya mengenai properti di PIK 2.');

    return (
        <>
            {/* MAIN NAVBAR */}
            <nav className="bg-white border-b border-gray-200/50 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">

                        {/* Left: Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <img src="/logo.png" alt={siteName} className="h-10 sm:h-12 w-auto group-hover:scale-105 transition-transform duration-300" />
                        </Link>

                        {/* Desktop nav */}
                        <div className="hidden lg:flex lg:items-center lg:justify-center lg:gap-2 mx-auto">
                            {menus.map((menu) => {
                                const hasChildren = menu.children && menu.children.length > 0;
                                return (
                                    <div className="relative group" key={menu.label}>
                                        <Link href={menu.url}
                                            target={menu.url.startsWith('http') ? '_blank' : '_self'}
                                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-[#1E356A] rounded-full hover:bg-gray-50/80 transition-all duration-300 ${hasChildren ? 'cursor-default' : ''}`}>
                                            {menu.label}
                                            {hasChildren && (
                                                <svg className="w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            )}
                                        </Link>

                                        {/* Dropdown */}
                                        {hasChildren && (
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                                <div className="bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden py-2 relative">
                                                    {/* Decorative top border */}
                                                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#81A649]"></div>
                                                    {menu.children!.map((child) => (
                                                        <Link href={child.url}
                                                            key={child.label}
                                                            target={child.url.startsWith('http') ? '_blank' : '_self'}
                                                            className="block px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-[#1E356A] hover:bg-gray-50/80 transition-colors">
                                                            {child.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* CTA (desktop) */}
                            <div className="hidden lg:block">
                                <a href={waLink} target="_blank" rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#81A649] text-white text-sm font-bold hover:shadow-[0_8px_20px_rgba(129,166,73,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                                    <svg className="w-4 h-4 group-hover:animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    Konsultasi
                                </a>
                            </div>

                            {/* Mobile hamburger */}
                            <button type="button" className="lg:hidden inline-flex items-center justify-center p-2 rounded-xl text-[#1E356A] hover:bg-[#1E356A]/5 transition-colors"
                                onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                                {!mobileOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-screen opacity-100 py-3' : 'max-h-0 opacity-0'}`}>
                        <div className="border-t border-gray-100/50 pt-2 space-y-1">
                            {menus.map((menu) => {
                                const hasChildren = menu.children && menu.children.length > 0;
                                return hasChildren ? (
                                    <div key={menu.label} className="rounded-xl overflow-hidden">
                                        <button type="button" className="w-full flex items-center justify-between px-4 py-3.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50/80 transition-colors"
                                            onClick={() => toggleDropdown(menu.label as any)}>
                                            <span>{menu.label}</span>
                                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openDropdowns[menu.label as any] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 bg-gray-50/50 ${openDropdowns[menu.label as any] ? 'max-h-60' : 'max-h-0'}`}>
                                            <div className="pl-6 pr-4 py-2 space-y-0.5">
                                                {menu.children!.map((child) => (
                                                    <Link href={child.url}
                                                        key={child.label}
                                                        target={child.url.startsWith('http') ? '_blank' : '_self'}
                                                        className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#1E356A] rounded-lg hover:bg-white/80 transition-colors">
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link href={menu.url}
                                        key={menu.label}
                                        target={menu.url.startsWith('http') ? '_blank' : '_self'}
                                        className="block px-4 py-3.5 text-sm font-semibold text-gray-700 hover:text-[#1E356A] hover:bg-gray-50/80 rounded-xl transition-colors">
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
