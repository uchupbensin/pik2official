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

    const siteName = siteSetting?.site_name || 'PIK 2 OFFICIAL';
    const waNumber = siteSetting?.sales_whatsapp_number || '082210100303';
    const salesName = siteSetting?.sales_name || 'Wisnu';
    const salesTitle = siteSetting?.sales_title || 'Senior In-House Property Consultant';
    const salesPhoto = siteSetting?.sales_photo
      ? (siteSetting.sales_photo.startsWith('http') || siteSetting.sales_photo.startsWith('/')
          ? siteSetting.sales_photo
          : `/api/${siteSetting.sales_photo}`)
      : '/sales-wisnu-default.jpg';

    const officeName = (siteSetting as any)?.office_name || 'PIK 2 SIGNATURE GALLERY';
    const officeAddress = siteSetting?.office_address || 'CBD PIK2, Jl. Letjen S. Parman, Lot CBD SPR3, West Kosambi, Kosambi, Tangerang Regency, Banten 15213';
    const officeMapsUrl = (siteSetting as any)?.office_maps_url || 'https://maps.app.goo.gl/mgVV7Ut8qKd241iz9?g_st=ac';

    let cleanWa = waNumber.replace(/\D+/g, '');
    if (cleanWa.startsWith('0')) {
        cleanWa = '62' + cleanWa.substring(1);
    }
    const waLink = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent(`Halo Bapak ${salesName}, saya ingin bertanya mengenai properti di PIK 2.`);

    return (
        <>
            {/* MAIN NAVBAR */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparent ? 'bg-transparent border-transparent text-white pt-2' : 'bg-white border-b border-gray-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] text-gray-800'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-18 sm:h-20">
                        {/* Left: Logo */}
                        <div className="flex-none flex justify-start">
                            <Link href="/" className="flex items-center gap-3 group z-50">
                                <img src="/logo.png" alt={siteName} className="h-9 sm:h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
                            </Link>
                        </div>

                        {/* Center: Desktop nav */}
                        <div className="hidden lg:flex flex-1 items-center justify-center gap-x-0.5 xl:gap-x-1.5 px-1">
                            {menus.map((menu) => {
                                const isContact = menu.label.toUpperCase() === 'CONTACT' || menu.label.toUpperCase() === 'KONTAK';
                                const hasChildren = menu.children && menu.children.length > 0;
                                const displayLabel = menu.label === 'APARTMENT & OFFICE TOWER' ? 'APARTMENT & OFFICE' : menu.label;

                                if (isContact) {
                                    return (
                                        <div className="relative group" key={menu.label}>
                                            <Link
                                                href={menu.url}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs xl:text-[13px] font-bold transition-all duration-300 rounded-full text-[#1E356A] bg-[#1E356A]/5 hover:bg-[#1E356A] hover:text-white border border-[#1E356A]/10 hover:border-transparent whitespace-nowrap shadow-xs"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#81A649] animate-pulse"></span>
                                                <span>{menu.label}</span>
                                                <svg className="w-2.5 h-2.5 transition-transform duration-300 group-hover:rotate-180 group-hover:text-white text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </Link>

                                            {/* Rich Contact Dropdown */}
                                            <div className="absolute right-0 top-full pt-4 w-[360px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out translate-y-3 group-hover:translate-y-0 z-50">
                                                <div className="bg-white text-gray-800 border border-gray-100 border-t-4 border-t-[#81A649] shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-3xl p-5 relative overflow-hidden">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                                        <div>
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-[#81A649] border border-emerald-200/50">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                In-House Marketing
                                                            </span>
                                                            <h4 className="text-[15px] font-extrabold text-[#1E356A] mt-1">{officeName}</h4>
                                                        </div>
                                                        <img src="/logo.png" alt="PIK 2" className="h-6 w-auto object-contain" />
                                                    </div>

                                                    {/* Senior Consultant Spotlight */}
                                                    <div className="mt-3.5 bg-gradient-to-br from-slate-50 to-gray-50/50 rounded-2xl p-3.5 border border-gray-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1E356A]/20 shadow-md shrink-0 bg-gray-100">
                                                                <img src={salesPhoto} alt={salesName} className="w-full h-full object-cover object-top" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[11px] text-gray-500 font-medium">In-House Consultant</p>
                                                                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100/70 px-1.5 py-0.5 rounded">Online</span>
                                                                </div>
                                                                <p className="text-sm font-black text-gray-900 tracking-tight">{salesName} (Official PIK 2)</p>
                                                                <p className="text-xs text-gray-600 font-mono font-medium">{waNumber}</p>
                                                            </div>
                                                        </div>

                                                        {/* Direct Contact Buttons */}
                                                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200/60">
                                                            <a
                                                                href={waLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-center gap-1.5 bg-[#81A649] hover:bg-[#6c8d3d] text-white py-2 px-3 rounded-xl text-xs font-bold shadow-xs transition-all hover:shadow hover:-translate-y-0.5"
                                                            >
                                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                                Chat WhatsApp
                                                            </a>
                                                            <a
                                                                href={`tel:${cleanWa}`}
                                                                className="flex items-center justify-center gap-1.5 bg-[#1E356A] hover:bg-[#2B4A93] text-white py-2 px-3 rounded-xl text-xs font-bold shadow-xs transition-all hover:shadow hover:-translate-y-0.5"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                                                Telepon
                                                            </a>
                                                        </div>
                                                    </div>

                                                    {/* Location & Operational Hours */}
                                                    <div className="mt-3.5 space-y-2 text-xs text-gray-600">
                                                        <div className="flex items-start gap-2.5">
                                                            <svg className="w-4 h-4 text-[#1E356A] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-gray-900">Kantor Pemasaran</p>
                                                                <p className="text-[11px] text-gray-500 leading-tight">CBD PIK2, Jl. Letjen S. Parman, Tangerang</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2.5">
                                                            <svg className="w-4 h-4 text-[#81A649] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                                            <p className="text-[11px] text-gray-600 font-medium">Buka Setiap Hari: <span className="font-bold text-gray-800">09.00 - 20.00 WIB</span></p>
                                                        </div>
                                                    </div>

                                                    {/* Quick CTA to Page */}
                                                    <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-2">
                                                        <Link
                                                            href="/contact"
                                                            className="w-full text-center py-2.5 px-3 rounded-xl bg-[#1E356A] hover:bg-[#14244B] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                                        >
                                                            <span>Buka Halaman Kontak Lengkap</span>
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                                        </Link>
                                                        <a
                                                            href={waLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full text-center py-2 px-3 rounded-xl bg-gray-50 hover:bg-emerald-50 text-[#1E356A] hover:text-[#81A649] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-gray-200/60"
                                                        >
                                                            <span>📅 Jadwalkan Kunjungan Show Unit</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="relative group" key={menu.label}>
                                        <Link href={menu.url}
                                            target={menu.url.startsWith('http') ? '_blank' : '_self'}
                                            className="flex items-center gap-1 px-2 xl:px-2.5 py-1.5 text-xs xl:text-[13px] font-semibold transition-all duration-300 rounded-full text-gray-600 hover:bg-[#1E356A] hover:text-white whitespace-nowrap tracking-tight">
                                            {displayLabel}
                                            {hasChildren && (
                                                <svg className="w-2.5 h-2.5 transition-transform duration-300 group-hover:rotate-180 group-hover:text-white text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            )}
                                        </Link>

                                        {/* Dropdown */}
                                        {hasChildren && (
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out translate-y-3 group-hover:translate-y-0 z-50">
                                                <div className="bg-white text-gray-800 border border-gray-100 border-t-4 border-t-[#81A649] shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl py-2 px-2 relative">
                                                    {menu.children!.map((child) => {
                                                        const hasGrandChildren = child.children && child.children.length > 0;
                                                        return (
                                                            <div key={child.label} className="relative group/sub">
                                                                <Link href={child.url}
                                                                    target={child.url.startsWith('http') ? '_blank' : '_self'}
                                                                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-slate-50 hover:text-[#1E356A] transition-colors">
                                                                    {child.label}
                                                                    {hasGrandChildren && (
                                                                        <svg className="w-3.5 h-3.5 text-gray-400 group-hover/sub:text-[#1E356A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                                                    )}
                                                                </Link>
                                                                {hasGrandChildren && (
                                                                    <div className="absolute left-full top-0 pl-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 ease-out -translate-x-2 group-hover/sub:translate-x-0 w-56 z-50">
                                                                        <div className="bg-white text-gray-800 border border-gray-100 border-l-4 border-l-[#81A649] shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl py-2 px-2 relative">
                                                                            {child.children!.map((grandChild) => (
                                                                                <Link href={grandChild.url}
                                                                                    key={grandChild.label}
                                                                                    target={grandChild.url.startsWith('http') ? '_blank' : '_self'}
                                                                                    className="block px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-slate-50 hover:text-[#1E356A] transition-colors">
                                                                                    {grandChild.label}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex-none flex justify-end items-center gap-3 z-50">
                            {/* Desktop Marketing CTA Button */}
                            <div className="hidden lg:flex items-center gap-2">
                                <a href={waLink} target="_blank" rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-2 px-3.5 xl:px-4 py-2 rounded-full text-xs font-bold bg-[#81A649] text-white hover:bg-[#6c8d3d] shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                                    <svg className="w-3.5 h-3.5 group-hover:animate-pulse shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    <span>Konsultasi</span>
                                    <span className="text-white/60 font-light">•</span>
                                    <span className="font-extrabold">{waNumber}</span>
                                </a>
                            </div>

                            {/* Mobile Marketing Info & Menu */}
                            <div className="lg:hidden flex items-center gap-2">
                                <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#81A649] text-white text-xs font-bold shadow-xs">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    <span>Konsultasi</span>
                                </a>
                                <button type="button" className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-full font-bold text-xs tracking-wide transition-all ${isTransparent ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#1E356A]/5 text-[#1E356A] hover:bg-[#1E356A]/10'}`}
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
                                const isContact = menu.label.toUpperCase() === 'CONTACT' || menu.label.toUpperCase() === 'KONTAK';
                                const hasChildren = menu.children && menu.children.length > 0;

                                if (isContact) {
                                    const isContactOpen = openDropdowns[menu.label] !== undefined ? openDropdowns[menu.label] : true;
                                    return (
                                        <div key={menu.label} className="rounded-2xl border border-gray-200/80 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 mt-3 shadow-xs">
                                            <button
                                                type="button"
                                                className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors"
                                                onClick={() => toggleDropdown(menu.label)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#81A649] animate-pulse"></span>
                                                    <span className="text-[14px] font-extrabold text-[#1E356A]">CONTACT & MARKETING GALLERY</span>
                                                </div>
                                                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isContactOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                            <div className={`overflow-hidden transition-all duration-300 ${isContactOpen ? 'max-h-[600px]' : 'max-h-0'}`}>
                                                <div className="px-4 pb-4 pt-1 space-y-3">
                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1E356A]/20 shadow-xs shrink-0 bg-gray-100">
                                                            <img src={salesPhoto} alt={salesName} className="w-full h-full object-cover object-top" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] text-gray-500 font-medium">{salesTitle}</p>
                                                            <p className="text-sm font-black text-gray-900">{salesName} (Official PIK 2)</p>
                                                            <p className="text-xs text-gray-600 font-mono font-medium">{waNumber}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <a
                                                            href={waLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={() => setMobileOpen(false)}
                                                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#81A649] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                                                        >
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                            WhatsApp
                                                        </a>
                                                        <a
                                                            href={`tel:${cleanWa}`}
                                                            onClick={() => setMobileOpen(false)}
                                                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1E356A] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                                            Telepon
                                                        </a>
                                                    </div>

                                                    <Link
                                                        href="/contact"
                                                        onClick={() => setMobileOpen(false)}
                                                        className="w-full text-center py-2.5 px-3 rounded-xl bg-[#1E356A] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                                                    >
                                                        <span>Buka Halaman Kontak Lengkap</span>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                                    </Link>

                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1">
                                                        <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5 text-[#1E356A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                            {officeName}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500">CBD PIK2, Jl. Letjen S. Parman, Tangerang</p>
                                                        <p className="text-[11px] text-emerald-700 font-semibold">Buka Setiap Hari (09.00 - 20.00 WIB)</p>
                                                    </div>

                                                    <a
                                                        href={waLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => setMobileOpen(false)}
                                                        className="block text-center py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-emerald-50 text-[#1E356A] font-bold text-xs border border-gray-200"
                                                    >
                                                        📅 Jadwalkan Survey Show Unit
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

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
