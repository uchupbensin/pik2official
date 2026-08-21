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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label Topbar</label>
            <input type="text" name="topbar_label" defaultValue={siteSettings?.topbar_label || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" />
          </div>
        </div>
      </div>

      {/* Home Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#1E356A] mb-4 border-b pb-2">Halaman Utama (Hero Section)</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Utama (Hero)</label>
            <input type="text" name="hero_title" defaultValue={homeSettings?.hero_title || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Utama</label>
            <textarea name="hero_description" defaultValue={homeSettings?.hero_description || ''} rows={3} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Video YouTube (Opsional, untuk diputar di latar belakang)</label>
            <input type="text" name="hero_youtube_url" defaultValue={homeSettings?.hero_youtube_url || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#1E356A] mb-4 border-b pb-2">Halaman Utama (Promo Section)</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-judul Promo</label>
            <input type="text" name="promo_subtitle" defaultValue={homeSettings?.promo_subtitle || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Promo</label>
            <input type="text" name="promo_title" defaultValue={homeSettings?.promo_title || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Promo</label>
            <textarea name="promo_description" defaultValue={homeSettings?.promo_description || ''} rows={3} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daftar Keuntungan (Pisahkan dengan baris baru)</label>
            <textarea name="promo_benefits" defaultValue={homeSettings?.promo_benefits || ''} rows={5} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" placeholder="Lokasi Strategis&#10;Bebas Banjir&#10;..."></textarea>
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
