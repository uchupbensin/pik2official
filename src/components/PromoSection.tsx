'use client';

import React from 'react';
import Link from 'next/link';
import { HomeSettings } from '@prisma/client';
import { 
  Flame, 
  Sparkles, 
  Gift, 
  Percent, 
  CreditCard, 
  FileCheck2, 
  MapPin, 
  MessageCircle, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Building
} from 'lucide-react';

interface PromoSectionProps {
  promoProjects: any[];
  homeSetting: HomeSettings | null;
  waNumber: string;
}

export default function PromoSection({ promoProjects, homeSetting, waNumber }: PromoSectionProps) {
  if (!promoProjects || promoProjects.length === 0) {
    return null;
  }

  // Format clean WhatsApp number
  let cleanWa = (waNumber || '6281234567890').replace(/\D+/g, '');
  if (cleanWa.startsWith('0')) {
    cleanWa = '62' + cleanWa.substring(1);
  }

  const formatImageUrl = (imgPath?: string | null) => {
    if (!imgPath) return '/pik2.png';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('/')) {
      return imgPath;
    }
    if (imgPath.startsWith('uploads/')) {
      return `/api/${imgPath}`;
    }
    return `/api/uploads/${imgPath}`;
  };

  const isSingle = promoProjects.length === 1;
  const singleProject = isSingle ? promoProjects[0] : null;

  return (
    <section 
      id="promo" 
      aria-label="Promo Properti PIK 2" 
      className="relative py-20 lg:py-32 bg-gradient-to-b from-[#091122] via-[#0E1B38] to-[#0A1325] text-white overflow-hidden border-b border-blue-950"
    >
      {/* Ambient Lighting & Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/15 via-[#81A649]/10 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#1E356A]/30 via-blue-500/10 to-transparent rounded-full blur-[140px] pointer-events-none"></div>

      {/* Subtle Grid Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          
          {/* Animated Flame Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 text-amber-300 font-extrabold text-xs sm:text-sm tracking-widest uppercase mb-6 border border-amber-500/40 shadow-lg shadow-amber-500/10">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400" />
            <span>Hot Promo Bulan Ini • Kuota Terbatas</span>
          </div>

          {/* Grand Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {homeSetting?.promo_title || 'Penawaran Eksklusif & Unit Pilihan Terbaik'}
          </h2>

          {/* Luxury Gold/Emerald Gradient Accent Bar */}
          <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 via-[#81A649] to-amber-300 mx-auto mt-6 rounded-full shadow-lg shadow-amber-400/20"></div>

          {/* Subtitle */}
          <p className="mt-6 text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            {homeSetting?.promo_description || 'Jangan lewatkan kesempatan emas ini! Dapatkan harga perdana, kemudahan cicilan developer hingga 60x, dan cashback spesial khusus unit pilihan Anda.'}
          </p>

          {/* 4 Promo Advantage Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Percent className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Harga Perdana</p>
                <p className="text-[10px] text-gray-400">Diskon Spesial</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Cicilan Developer</p>
                <p className="text-[10px] text-gray-400">Hingga 60x</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Free BPHTB</p>
                <p className="text-[10px] text-gray-400">Biaya Pengalihan</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Hadiah Langsung</p>
                <p className="text-[10px] text-gray-400">Bonus Khusus</p>
              </div>
            </div>
          </div>
        </div>

        {/* PROMO DISPLAY: CASE A (SINGLE FEATURED SHOWCASE) OR CASE B (MULTI-CARDS) */}
        {isSingle && singleProject ? (
          /* VIP FEATURED SHOWCASE BANNER FOR SINGLE PROMO PROJECT */
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/15 backdrop-blur-xl shadow-2xl p-6 sm:p-8 md:p-12 transition-all duration-500 hover:border-amber-400/40 group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Image Showcase */}
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden bg-[#0A1325] border border-white/10 shadow-2xl group/img">
                  {/* Subtle Background Glow under image */}
                  <img
                    src={formatImageUrl(singleProject.cover_image)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none"
                  />
                  <img
                    src={formatImageUrl(singleProject.cover_image)}
                    alt={singleProject.name}
                    className="relative z-10 w-full h-full object-contain p-2 group-hover/img:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Golden Ribbon Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs shadow-xl tracking-wider uppercase border border-amber-300/40">
                      <Sparkles className="w-3.5 h-3.5" />
                      Promo Pilihan Utama
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Content & Exclusive Benefits */}
              <div className="lg:col-span-6 flex flex-col justify-center text-left">
                
                {/* Category & Group Tag */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {singleProject.group_name && (
                    <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider border border-white/10">
                      {singleProject.group_name}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-[#81A649]/20 text-[#81A649] text-xs font-bold uppercase tracking-wider border border-[#81A649]/30">
                    {singleProject.category || 'Residensial PIK 2'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 group-hover:text-amber-300 transition-colors">
                  {singleProject.name}
                </h3>

                {/* Location */}
                {singleProject.location && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-300 mb-4 font-medium">
                    <MapPin className="w-4 h-4 text-[#81A649]" />
                    <span>{singleProject.location}</span>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
                  {singleProject.short_description || 'Unit properti berkelas dunia dengan lokasi strategis, fasilitas terlengkap, dan potensi investasi masa depan terbaik di kawasan mandiri PIK 2.'}
                </p>

                {/* Benefits Checklist */}
                <div className="space-y-2.5 mb-8 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-[#81A649] shrink-0" />
                    <span>Akses cepat & mudah terhubung langsung Tol Interchange PIK 2</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-[#81A649] shrink-0" />
                    <span>Program subsidi DP & cicilan ringan developer jangka panjang</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-[#81A649] shrink-0" />
                    <span>Dekat fasilitas premium, area rekreasi pasir putih, dan pusat CBD</span>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo, saya tertarik dengan Promo Spesial ${singleProject.name} di PIK 2. Mohon info pricelist dan cara bayarnya.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-xl shadow-green-500/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Klaim Promo via WhatsApp</span>
                  </a>

                  <Link
                    href={`/project/${singleProject.slug}`}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Lihat Detail Unit</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* MULTIPLE PROMO CARDS (GRID VIEW) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {promoProjects.map((project: any) => {
              const coverImg = formatImageUrl(project.cover_image);

              return (
                <div
                  key={project.id}
                  className="rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/15 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col group hover:border-amber-400/50 hover:-translate-y-1.5 transition-all duration-500"
                >
                  {/* Card Cover */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#0A1325]">
                    <img
                      src={coverImg}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-125 pointer-events-none"
                    />
                    <img
                      src={coverImg}
                      alt={project.name}
                      className="relative z-10 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Ribbon Tag */}
                    <div className="absolute top-3.5 left-3.5 z-20">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-[11px] shadow-lg tracking-wider uppercase">
                        <Flame className="w-3 h-3 fill-white" />
                        HOT DEAL
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 sm:p-7 flex flex-col flex-grow">
                    {project.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#81A649]" />
                        <span>{project.location}</span>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                      {project.name}
                    </h3>

                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-2 font-light">
                      {project.short_description || 'Dapatkan harga perdana dan promo cicilan eksklusif untuk unit pilihan ini.'}
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
                      <a
                        href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo, saya tertarik dengan promo ${project.name} di PIK 2.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>Konsultasi WhatsApp</span>
                      </a>

                      <Link
                        href={`/project/${project.slug}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer"
                      >
                        <span>Lihat Detail Unit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
