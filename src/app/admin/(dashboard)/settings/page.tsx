import React from 'react';
import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/admin/SettingsForm';

export const metadata = {
  title: 'Pengaturan Web - Admin PIK 2 OFFICIAL',
};

export default async function SettingsPage() {
  const siteSettings = await prisma.siteSettings.findFirst();
  const homeSettings = await prisma.homeSettings.findFirst();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Pengaturan Website</h2>
        <p className="text-gray-600 mt-1">Ubah identitas website, nomor kontak, dan konten halaman utama di sini.</p>
      </div>

      <SettingsForm siteSettings={siteSettings} homeSettings={homeSettings} />
    </div>
  );
}
