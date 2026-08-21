import React from 'react';
import { prisma } from '@/lib/prisma';
import { Building2, ListTree, Star, Link as LinkIcon } from 'lucide-react';

export default async function AdminDashboard() {
  const [totalProjects, promoProjects, totalMenus] = await Promise.all([
    prisma.projects.count(),
    prisma.projects.count({ where: { is_promo: true } }),
    prisma.menus.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Selamat Datang di Panel Admin</h2>
        <p className="text-gray-600 mt-1">Berikut adalah ringkasan data website PIK 2 Property saat ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-[#1E356A] rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Properti</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalProjects}</h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-green-50 text-[#81A649] rounded-xl">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Properti Promo</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{promoProjects}</h3>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <ListTree className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Menu</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalMenus}</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pintasan Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/admin/projects" className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-[#1E356A] hover:shadow-md transition-all">
            <span className="font-medium text-gray-700 group-hover:text-[#1E356A]">Kelola Properti</span>
            <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-[#1E356A]" />
          </a>
          <a href="/admin/settings" className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-[#1E356A] hover:shadow-md transition-all">
            <span className="font-medium text-gray-700 group-hover:text-[#1E356A]">Ubah Pengaturan</span>
            <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-[#1E356A]" />
          </a>
        </div>
      </div>
    </div>
  );
}
