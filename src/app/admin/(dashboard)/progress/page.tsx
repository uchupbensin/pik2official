import React from 'react';
import { prisma } from '@/lib/prisma';
import ProgressList from '@/components/admin/ProgressList';

export const metadata = {
  title: 'Manajemen Progres PIK 2 - Admin PIK 2 OFFICIAL',
};

export default async function ProgressPage() {
  const progressList = await prisma.progress.findMany({
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Progres PIK 2</h2>
        <p className="text-gray-600 mt-1">Kelola link video YouTube yang menampilkan perkembangan dan progres pembangunan PIK 2.</p>
      </div>

      <ProgressList initialData={progressList} />
    </div>
  );
}
