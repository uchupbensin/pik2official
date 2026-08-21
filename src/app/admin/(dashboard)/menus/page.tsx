import React from 'react';
import { prisma } from '@/lib/prisma';
import MenuList from '@/components/admin/MenuList';

export const metadata = {
  title: 'Manajemen Menu - Admin PIK 2 Property',
};

export default async function MenusPage() {
  const menus = await prisma.menus.findMany({
    orderBy: [
      { parent_id: 'asc' },
      { sort_order: 'asc' }
    ]
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Menu Navigasi</h2>
        <p className="text-gray-600 mt-1">Kelola tautan menu navigasi yang muncul di bagian atas website.</p>
      </div>

      <MenuList menus={menus} />
    </div>
  );
}
