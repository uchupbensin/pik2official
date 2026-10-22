'use client';

import React, { useState } from 'react';

export default function ContactInquiryForm({
  salesName,
  waNumber,
}: {
  salesName: string;
  waNumber: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'Rumah',
    purpose: 'Hunian Pribadi',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  let cleanWa = waNumber.replace(/\D+/g, '');
  if (cleanWa.startsWith('0')) {
    cleanWa = '62' + cleanWa.substring(1);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const waText = `Halo Bapak ${salesName}, saya ingin konsultasi mengenai properti di PIK 2.

*Data Calon Pembeli:*
• Nama: ${formData.name || '-'}
• No. WhatsApp: ${formData.phone || '-'}
• Pilihan Kategori: ${formData.category}
• Rencana Pembelian: ${formData.purpose}
${formData.message ? `• Pertanyaan/Catatan: ${formData.message}` : ''}

Mohon informasi ketersediaan unit, promo terbaru, dan jadwal survey lokasi. Terima kasih.`;

    const url = `https://wa.me/${cleanWa}?text=${encodeURIComponent(waText)}`;
    window.open(url, '_blank');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Masukkan nama Anda"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] transition-all"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
          Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          required
          placeholder="Contoh: 08123456789"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
            Kategori yang Diminati
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] transition-all"
          >
            <option value="Rumah">Rumah (Residential)</option>
            <option value="Rukan & SOHO">Rukan & SOHO</option>
            <option value="Apartemen">Apartemen & Office Tower</option>
            <option value="Kavling">Kavling Residensial / Komersial</option>
            <option value="Gudang">Gudang / Bizpark</option>
            <option value="Konsultasi Umum">Konsultasi Umum PIK 2</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
            Rencana Pembelian
          </label>
          <select
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] transition-all"
          >
            <option value="Hunian Pribadi">Hunian Pribadi</option>
            <option value="Investasi Sewa / Capital Gain">Investasi</option>
            <option value="Tempat Usaha / Bisnis">Tempat Usaha / Bisnis</option>
            <option value="Hanya Melihat Promo">Lihat Price List & Promo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
          Pesan atau Pertanyaan Khusus (Opsional)
        </label>
        <textarea
          rows={3}
          placeholder="Contoh: Saya ingin tahu simulasi cicilan developer dan jadwal survey show unit..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-2xl bg-[#81A649] hover:bg-[#6c8d3d] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#81A649]/25 hover:shadow-xl hover:shadow-[#81A649]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span>Kirim Konsultasi ke WhatsApp Resmi</span>
      </button>

      <p className="text-center text-[11px] text-gray-400">
        Data Anda aman &bull; Langsung terhubung dengan Tim In-House Marketing Resmi PIK 2
      </p>
    </form>
  );
}
