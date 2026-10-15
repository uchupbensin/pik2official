'use client';

import React, { useState } from 'react';
import { updateSettings } from '@/app/admin/actions';
import { SiteSettings, HomeSettings } from '@prisma/client';

export default function SettingsForm({
  siteSettings,
  homeSettings,
}: {
  siteSettings: SiteSettings | null;
  homeSettings: HomeSettings | null;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateSettings(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Terjadi kesalahan.' });
    }
    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Global Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#1E356A] mb-4 border-b pb-2">Pengaturan Umum (Global)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Website</label>
            <input type="text" name="site_name" defaultValue={siteSettings?.site_name || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input type="text" name="site_tagline" defaultValue={siteSettings?.site_tagline || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp Sales (Mulai dengan 62...)</label>
            <input type="text" name="sales_whatsapp_number" defaultValue={siteSettings?.sales_whatsapp_number || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" />
          </div>
        </div>
      </div>

      {/* Home Settings - Section Editorial (Top Image + Text + Bottom Image) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#1E356A] mb-2 border-b pb-2 flex items-center justify-between">
          <span>Halaman Utama (Hero Showcase / Cerita PIK 2)</span>
          <span className="text-xs font-normal text-gray-500">Tampilan Foto Atas + Judul & Kata-Kata + Foto Bawah</span>
        </h3>

        <div className="grid grid-cols-1 gap-6 pt-2">
          {/* 1. Foto Banner Atas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              1. Foto Banner Atas (Landmark / Bundaran PIK2)
            </label>
            <input 
              type="file" 
              name="hero_image_top" 
              accept="image/*" 
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#1E356A]/10 file:text-[#1E356A] hover:file:bg-[#1E356A]/20 cursor-pointer border border-gray-200 rounded-xl p-2 bg-gray-50/50" 
            />
            <p className="text-xs text-gray-500 mt-1">Format JPG, PNG, atau WebP. Kosongkan jika tidak ingin mengubah.</p>
            {homeSettings?.hero_image_top ? (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">Foto saat ini:</span>
                <div className="h-16 w-32 rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                  <img src={homeSettings.hero_image_top.startsWith('http') ? homeSettings.hero_image_top : `/api/${homeSettings.hero_image_top}`} alt="Top Hero" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#81A649] font-medium mt-1">Menggunakan foto bawaan: Bundaran PIK 2</p>
            )}
          </div>

          {/* 2. Judul Tengah */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">2. Judul Tengah</label>
            <input 
              type="text" 
              name="hero_title" 
              defaultValue={homeSettings?.hero_title || 'P I K 2'} 
              placeholder="Contoh: P I K 2"
              className="w-full px-4 py-2.5 border rounded-xl bg-white text-gray-900 font-bold focus:ring-2 focus:ring-[#1E356A]/30 focus:border-[#1E356A] outline-none" 
            />
          </div>

          {/* 3. Deskripsi / Kata-Kata Tengah */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">3. Kata-Kata & Deskripsi Pengantar</label>
            <textarea 
              name="hero_description" 
              defaultValue={homeSettings?.hero_description || '"PIK2 The New Jakarta City" merupakan mahakarya terbaru persembahan dari Agung Sedayu Group & Salim Group. PIK2 adalah pengembangan besar yang menghubungkan negara Indonesia dengan seluruh dunia. Berlokasi hanya kurang lebih 7 menit dari Bandara Internasional Soekarno-Hatta, bahkan lebih dekat daripada PIK1, tentunya membuat PIK2 unggul dalam hal konektivitas global, ekspansi bisnis, dan berbagai peluang investasi. Keberhasilan PIK1 memicu lahirnya jalinan kerjasama baru antara Agung Sedayu Group dan Salim Group. Kedua grup besar ini kembali menjalin kolaborasi hebatnya dalam pengembangan mahakarya PIK2. PIK2 adalah pengembangan besar-besaran yang akan mencapai sekitar 2.650 hektar. PIK2 akan menjadi pusat kekuatan ekonomi yang memiliki daya tarik yang kuat bagi peluang dan investasi yang menguntungkan dalam berbagai pengembangan properti.'} 
              rows={6} 
              className="w-full px-4 py-2.5 border rounded-xl bg-white text-gray-900 leading-relaxed text-sm focus:ring-2 focus:ring-[#1E356A]/30 focus:border-[#1E356A] outline-none"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Tulis penjelasan lengkap tentang keunggulan mahakarya PIK 2.</p>
          </div>

          {/* 4. Foto Banner Bawah */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              4. Foto Banner Bawah (Menara Syariah / Gedung Ikonik)
            </label>
            <input 
              type="file" 
              name="hero_image_bottom" 
              accept="image/*" 
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#1E356A]/10 file:text-[#1E356A] hover:file:bg-[#1E356A]/20 cursor-pointer border border-gray-200 rounded-xl p-2 bg-gray-50/50" 
            />
            <p className="text-xs text-gray-500 mt-1">Format JPG, PNG, atau WebP. Kosongkan jika tidak ingin mengubah.</p>
            {homeSettings?.hero_image_bottom ? (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">Foto saat ini:</span>
                <div className="h-16 w-32 rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                  <img src={homeSettings.hero_image_bottom.startsWith('http') ? homeSettings.hero_image_bottom : `/api/${homeSettings.hero_image_bottom}`} alt="Bottom Hero" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#81A649] font-medium mt-1">Menggunakan foto bawaan: Menara Syariah PIK 2</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#1E356A] mb-4 border-b pb-2">Halaman Utama (Promo Section)</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Promo</label>
            <input type="text" name="promo_title" defaultValue={homeSettings?.promo_title || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Promo</label>
            <textarea name="promo_description" defaultValue={homeSettings?.promo_description || ''} rows={3} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]"></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 bg-[#1E356A] text-white rounded-xl font-bold hover:bg-[#14244B] transition-colors disabled:opacity-70"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </form>
  );
}
