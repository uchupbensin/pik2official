import React from 'react';
import { prisma } from '@/lib/prisma';
import { Building2, ListTree, Star, Link as LinkIcon, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [totalProjects, promoProjects, totalMenus, recentProjects] = await Promise.all([
    prisma.projects.count(),
    prisma.projects.count({ where: { is_promo: true } }),
    prisma.menus.count(),
    prisma.projects.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        is_promo: true,
        created_at: true,
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Selamat Datang di Panel Admin</h2>
        <p className="text-gray-600 mt-1">Berikut adalah ringkasan data website PIK 2 OFFICIAL saat ini.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Projects Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Properti Terbaru
            </h3>
            <Link href="/admin/projects" className="text-sm text-[#1E356A] font-medium hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Properti</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-xs text-gray-500">
                          {project.created_at ? new Date(project.created_at).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-sm text-gray-700">{project.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        {project.is_promo ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">Promo</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">Reguler</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/projects/${project.id}/edit`} className="text-sm text-blue-600 font-medium hover:underline">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Belum ada properti ditambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pintasan Cepat</h3>
            <div className="space-y-3">
              <Link href="/admin/projects" className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-[#1E356A] hover:text-white transition-all border border-transparent hover:shadow-md">
                <span className="font-medium text-gray-700 group-hover:text-white">Kelola Properti</span>
                <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-white/80" />
              </Link>
              <Link href="/admin/menus" className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-[#1E356A] hover:text-white transition-all border border-transparent hover:shadow-md">
                <span className="font-medium text-gray-700 group-hover:text-white">Kelola Menu</span>
                <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-white/80" />
              </Link>
              <Link href="/admin/settings" className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-[#1E356A] hover:text-white transition-all border border-transparent hover:shadow-md">
                <span className="font-medium text-gray-700 group-hover:text-white">Ubah Pengaturan</span>
                <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-white/80" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
