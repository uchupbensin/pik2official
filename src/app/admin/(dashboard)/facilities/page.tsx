import React from 'react';
import { prisma } from '@/lib/prisma';
import FacilitiesList from '@/components/admin/FacilitiesList';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Manajemen Keunggulan & Fasilitas PIK 2 - Admin PIK 2 OFFICIAL',
};

export const revalidate = 0;

export default async function FacilitiesAdminPage() {
  const facilities = (prisma as any)?.facilities?.findMany
    ? await (prisma as any).facilities.findMany({
        orderBy: { sort_order: 'asc' }
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E356A]/10 text-[#1E356A] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#81A649]" />
            Konten Homepage
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Keunggulan & Fasilitas Kawasan PIK 2
          </h2>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            Kelola daftar fasilitas, judul, deskripsi, dan upload foto fasilitas yang ditampilkan pada bagian slider/carousel beranda.
          </p>
        </div>
      </div>

      <FacilitiesList initialData={facilities} />
    </div>
  );
}
