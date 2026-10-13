import React from 'react';
import Link from 'next/link';
import { SiteSettings } from '@prisma/client';
import { MapPin, ExternalLink } from 'lucide-react';

type MenuItem = {
    label: string;
    url: string;
    children?: MenuItem[];
};

export default function Footer({
    siteSetting,
    menus
}: {
    siteSetting: SiteSettings | null;
    menus: MenuItem[];
}) {
    const siteName = siteSetting?.site_name || 'PIK 2 OFFICIAL';
    const siteTagline = siteSetting?.site_tagline || 'Kawasan Residensial & Komersial Elite di Jakarta Utara';
    const siteDescription = 'Dapatkan informasi resmi dan terbaru mengenai hunian eksklusif, ruko premium, apartemen mewah, serta lahan komersial strategis di kawasan mega proyek PIK 2.';

    const officeAddress = 'Jl. Marina Indah Raya No. 1, Kamal Muara, Kecamatan Penjaringan, Jakarta Utara, 14470';
    const mapsLink = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Marketing Gallery PIK 2, ' + officeAddress);

    const waNumber = siteSetting?.sales_whatsapp_number || '6281234567890';
    let cleanWa = waNumber.replace(/\D+/g, '');
    if (cleanWa.startsWith('0')) {
        cleanWa = '62' + cleanWa.substring(1);
    }
    const waLink = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent('Halo, saya tertarik dan ingin berkonsultasi mengenai properti di PIK 2.');

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto relative overflow-hidden">
            <div className="relative z-10 max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
                    {/* Branding, Logo & Alamat Kantor */}
                    <div className="md:col-span-6 lg:col-span-5">
                        {/* Logo PIK 2 & Developer Agung Sedayu */}
                        <div className="flex items-center gap-4 mb-5 flex-wrap">
                            <img src="/logo.png" alt={siteName} className="h-10 sm:h-12 w-auto object-contain" />
                            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/80 px-3.5 py-1.5 rounded-2xl shadow-sm">
                                <img src="/agung-sedayu-group.png" alt="Agung Sedayu Group" className="h-7 sm:h-8 w-auto object-contain" />
                                <div className="text-[11px] leading-tight text-gray-500 font-semibold">
                                    <span className="block text-[9px] uppercase tracking-wider text-gray-400 font-bold">Developer</span>
                                    Agung Sedayu Group
                                </div>
                            </div>
                        </div>

                        <p className="text-[#81A649] font-bold text-sm uppercase tracking-widest mb-3">{siteTagline}</p>
                        <p className="text-gray-500 text-[14px] leading-relaxed pr-4 mb-6">{siteDescription}</p>

                        {/* Alamat Kantor Marketing Gallery */}
                        <div className="bg-gray-50/80 rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm max-w-lg">
                            <div className="flex items-start gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#1E356A]/10 text-[#1E356A] flex items-center justify-center shrink-0 mt-0.5 border border-[#1E356A]/10">
                                    <MapPin className="w-5 h-5 text-[#81A649]" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#1E356A] text-xs uppercase tracking-wider mb-1">
                                        Kantor Pemasaran / Marketing Gallery
                                    </h4>
                                    <p className="text-gray-600 text-[13px] leading-relaxed mb-2.5">
                                        {officeAddress}
                                    </p>
                                    <a 
                                        href={mapsLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E356A] hover:text-[#81A649] transition-colors"
                                    >
                                        <span>Buka Petunjuk Arah di Google Maps</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <div className="md:col-span-6 lg:col-span-3 lg:pl-6">
                        <h3 className="font-extrabold text-lg mb-6 text-[#1E356A]">Jelajahi PIK 2</h3>
                        <ul className="grid grid-cols-2 gap-y-4 gap-x-4">
                            {menus.map((menu) => (
                                <li key={menu.label}>
                                    <Link href={menu.url} target={menu.url.startsWith('http') ? '_blank' : '_self'}
                                        className="group flex items-center text-gray-500 hover:text-[#1E356A] text-[15px] transition-colors font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#81A649] mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></span>
                                        {menu.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-12 lg:col-span-4">
                        <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-extrabold text-lg mb-3 text-[#1E356A]">Layanan Konsultasi</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Hubungi tim sales resmi kami untuk mendapatkan detail ketersediaan unit, price list, dan penawaran promo eksklusif bulan ini.</p>
                            <a href={waLink} target="_blank" rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-2.5 w-full px-6 py-4 rounded-xl bg-[#1E356A] text-white text-[15px] font-bold hover:bg-[#2B4A93] hover:shadow-lg hover:shadow-[#1E356A]/20 hover:-translate-y-0.5 transition-all duration-300">
                                <svg className="w-5 h-5 group-hover:animate-bounce" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                Hubungi Sales Resmi
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-400 text-[13px] font-medium tracking-wide">&copy; {new Date().getFullYear()} {siteName}. Hak Cipta Dilindungi.</p>
                    <div className="flex items-center gap-3 text-gray-500 text-[13px]">
                        <img src="/agung-sedayu-group.png" alt="Agung Sedayu Group" className="h-5 w-auto object-contain opacity-80" />
                        <span>A Project by <strong className="text-[#1E356A] font-bold">Agung Sedayu Group</strong> &bull; Marketing Resmi PIK 2</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
