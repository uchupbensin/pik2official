import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ContactInquiryForm from '@/components/ContactInquiryForm';

export async function generateMetadata(): Promise<Metadata> {
  let siteSetting = null;
  try {
    siteSetting = await prisma.siteSettings.findFirst();
  } catch {
    // Database fallback
  }

  const salesName = siteSetting?.sales_name || 'Wisnu';
  const siteName = siteSetting?.site_name || 'PIK 2 OFFICIAL';

  return {
    title: `Hubungi Marketing Resmi - ${salesName} | ${siteName}`,
    description: `Hubungi ${salesName}, Senior In-House Property Consultant ${siteName}. Konsultasikan rumah, ruko, apartemen, kavling, survey show unit, dan price list resmi.`,
    alternates: {
      canonical: '/contact',
    },
  };
}

export default async function ContactPage() {
  let siteSetting = null;
  try {
    siteSetting = await prisma.siteSettings.findFirst();
  } catch {
    // Database fallback
  }

  const salesName = siteSetting?.sales_name || 'Wisnu';
  const salesTitle = siteSetting?.sales_title || 'Senior In-House Property Consultant';
  const salesPhone = siteSetting?.sales_phone || siteSetting?.sales_whatsapp_number || '082210100303';
  const salesEmail = siteSetting?.sales_email || 'sales@pik2official.id';
  const officeName = (siteSetting as any)?.office_name || 'PIK 2 SIGNATURE GALLERY';
  const officeAddress = siteSetting?.office_address || 'CBD PIK2, Jl. Letjen S. Parman, Lot CBD SPR3, West Kosambi, Kosambi, Tangerang Regency, Banten 15213';
  const officeMapsUrl = (siteSetting as any)?.office_maps_url || 'https://maps.app.goo.gl/mgVV7Ut8qKd241iz9?g_st=ac';
  const officeHours = siteSetting?.office_hours || 'Buka Setiap Hari: 09.00 - 20.00 WIB';

  const salesPhoto = siteSetting?.sales_photo
    ? (siteSetting.sales_photo.startsWith('http') || siteSetting.sales_photo.startsWith('/')
        ? siteSetting.sales_photo
        : `/api/${siteSetting.sales_photo}`)
    : '/sales-wisnu-default.jpg';

  let cleanWa = salesPhone.replace(/\D+/g, '');
  if (cleanWa.startsWith('0')) {
    cleanWa = '62' + cleanWa.substring(1);
  }
  const waLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo Bapak ${salesName}, saya ingin konsultasi mengenai properti di PIK 2.`)}`;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-28 sm:pt-32 lg:pt-36 pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#1E356A] transition-colors">
            Beranda
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[#1E356A]">Hubungi Sales</span>
        </nav>

        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E356A]/5 border border-[#1E356A]/10 text-[#1E356A] text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#81A649] animate-pulse"></span>
            Official In-House Marketing PIK 2
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E356A] tracking-tight mb-4">
            Konsultasi & Layanan Resmi
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Dapatkan informasi ketersediaan unit terbaru, jadwal survey lokasi & show unit, 
            serta simulasi cara bayar terbaik langsung dari konsultan resmi pengembang.
          </p>
        </div>

        {/* Main Content Grid: Sales Profile Card + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* LEFT: Sales Consultant Executive Profile Card (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#81A649]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#1E356A]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Photo Container */}
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-md mb-6 group">
              <img
                src={salesPhoto}
                alt={salesName}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              {/* Online Status Badge Overlay */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold text-gray-800">Online &bull; Siap Melayani</span>
              </div>
              
              {/* Developer Tag Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-[#1E356A]/95 to-[#1E356A]/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#81A649]">Agung Sedayu Group & Salim Group</p>
                <p className="text-xs font-semibold text-white/90">Official In-House Property Consultant</p>
              </div>
            </div>

            {/* Sales Identity Info */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {salesName}
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-[#81A649]">
                    {salesTitle}
                  </p>
                </div>
                <img src="/logo.png" alt="PIK 2" className="h-8 w-auto object-contain" />
              </div>
            </div>

            {/* Direct Quick Action Buttons */}
            <div className="space-y-3 mb-6">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-[#81A649] hover:bg-[#6c8d3d] text-white font-extrabold text-sm shadow-md shadow-[#81A649]/20 hover:shadow-lg hover:shadow-[#81A649]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Chat WhatsApp ({salesPhone})</span>
              </a>

              <a
                href={`tel:${cleanWa}`}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-[#1E356A] hover:bg-[#14244B] text-white font-extrabold text-sm shadow-md shadow-[#1E356A]/20 hover:shadow-lg hover:shadow-[#1E356A]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Telepon Langsung ({salesPhone})</span>
              </a>
            </div>

            {/* Quick Contact Specification List */}
            <div className="pt-4 border-t border-gray-100 space-y-3 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400">Jam Layanan:</span>
                <span className="font-bold text-gray-800">{officeHours}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-400">Email Resmi:</span>
                <span className="font-bold text-gray-800">{salesEmail}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-400">Status Legalitas:</span>
                <span className="font-bold text-emerald-600">In-House Official Verified</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Fast Consultation Form Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-[#81A649] text-xs font-extrabold uppercase tracking-wider mb-2">
                Fast Response
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E356A] tracking-tight">
                Formulir Konsultasi Properti
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Isi data singkat di bawah ini untuk mendapatkan rekomendasi unit, brosur PDF, dan promo terbaik langsung di WhatsApp Anda.
              </p>
            </div>

            {/* Interactive Form Component */}
            <ContactInquiryForm salesName={salesName} waNumber={salesPhone} />
          </div>
        </div>

        {/* Marketing Gallery Office & Operational Hours Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-lg shadow-gray-100 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#81A649]">Kantor Pemasaran</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#1E356A] mt-1 mb-3">
                {officeName}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                {officeAddress}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#81A649]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{officeHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1E356A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  <span>Parkir Luas & Akses Tol Langsung</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3.5 px-6 rounded-2xl bg-[#1E356A] hover:bg-[#14244B] text-white font-bold text-sm shadow-md transition-all hover:-translate-y-0.5"
              >
                📅 Jadwalkan Kunjungan Show Unit
              </a>
              <a
                href={officeMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3.5 px-6 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>Buka Petunjuk Arah (Google Maps)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Why Consult In-House Official Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#1E356A]/10 text-[#1E356A] flex items-center justify-center font-black text-xl mb-4">
              🛡️
            </div>
            <h4 className="text-lg font-bold text-[#1E356A] mb-2">Unit Resmi & Valid</h4>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Seluruh transaksi unit langsung terdaftar ke sistem resmi pengembang Agung Sedayu Group & Salim Group.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#81A649]/10 text-[#81A649] flex items-center justify-center font-black text-xl mb-4">
              💎
            </div>
            <h4 className="text-lg font-bold text-[#1E356A] mb-2">Bebas Biaya Komisi</h4>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Layanan konsultasi, pendampingan survey lokasi, dan pengurusan berkas 100% gratis tanpa komisi dari pembeli.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#1E356A]/10 text-[#1E356A] flex items-center justify-center font-black text-xl mb-4">
              🎁
            </div>
            <h4 className="text-lg font-bold text-[#1E356A] mb-2">Promo Developer Terkini</h4>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Dapatkan informasi promo cicilan developer, diskon early bird, subsidi DP, dan hadiah langsung promo bulan ini.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
