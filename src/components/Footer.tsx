import React from 'react';
import Link from 'next/link';
import { Menus, SiteSettings } from '@prisma/client';

export default function Footer({
  siteSetting,
  menus
}: {
  siteSetting: SiteSettings | null;
  menus: (Menus & { children?: Menus[] })[];
}) {
  const siteName = siteSetting?.site_name ?? 'PIK 2 OFFICIAL';
  const siteTagline = siteSetting?.site_tagline ?? 'Katalog Properti & Hunian Pilihan di PIK 2';
  // Note: the legacy view had site_description, but the DB schema doesn't have it. We'll fallback to a default text.
  const siteDescription = 'PIK 2 OFFICIAL hadir sebagai katalog properti dan website marketing resmi yang menyediakan informasi lengkap seputar hunian, ruko, gudang, apartemen, dan kavling di kawasan strategis PIK 2.';
  
  const waNumber = siteSetting?.sales_whatsapp_number ?? '6281234567890';
  let cleanWa = waNumber.replace(/\D+/g, '');
  if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.substring(1);
  }
  const waLink = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent('Halo, saya ingin bertanya mengenai properti di PIK 2.');

  return (
    <footer className="bg-[#1E356A] text-white mt-auto relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">

                {/* Branding */}
                <div className="md:col-span-5 lg:col-span-4">
                    <div className="flex items-center gap-3 mb-2">
                        <img src="/icon.svg" alt={siteName} className="h-10 w-auto" />
                        <h2 className="text-3xl font-extrabold tracking-tight text-white">{siteName}</h2>
                    </div>
                    <p className="text-[#81A649] font-semibold text-sm uppercase tracking-widest">{siteTagline}</p>
                    <p className="text-white/70 text-sm mt-6 leading-relaxed pr-4">{siteDescription}</p>
                </div>

                {/* Nav */}
                <div className="md:col-span-3 lg:col-span-4 lg:pl-12">
                    <h3 className="font-bold text-lg mb-6 text-white border-b border-white/10 pb-3 inline-block">Navigasi Utama</h3>
                    <ul className="space-y-3">
                        {menus.map((menu) => (
                          <React.Fragment key={menu.id}>
                            <li>
                                <Link href={menu.url} target={menu.open_in_new_tab ? '_blank' : '_self'}
                                   className="group flex items-center text-white/70 hover:text-white text-sm transition-colors font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#81A649] mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></span>
                                    {menu.label}
                                </Link>
                            </li>
                            {menu.children && menu.children.length > 0 && menu.children.map((child) => (
                                <li className="pl-5" key={child.id}>
                                    <Link href={child.url} target={child.open_in_new_tab ? '_blank' : '_self'}
                                       className="group flex items-center text-white/50 hover:text-[#97C05C] text-sm transition-colors">
                                        <span className="mr-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span> {child.label}
                                    </Link>
                                </li>
                            ))}
                          </React.Fragment>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div className="md:col-span-4 lg:col-span-4">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                        <h3 className="font-bold text-lg mb-2 text-white">Hubungi Sales</h3>
                        <p className="text-white/60 text-sm mb-6 leading-relaxed">Konsultasi sekarang untuk info detail unit, ketersediaan, dan penawaran harga spesial.</p>
                        <a href={waLink} target="_blank" rel="noopener noreferrer"
                           className="group flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#20bd5a] hover:shadow-[0_8px_25px_rgba(37,211,102,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                            <svg className="w-5 h-5 group-hover:animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Chat WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-white/50 text-xs font-medium tracking-wide">&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
                <div className="flex items-center gap-1 text-white/40 text-xs">
                    <span>Designed for</span>
                    <span className="font-semibold text-white/60">PIK 2</span>
                </div>
            </div>
        </div>
    </footer>
  );
}
