import React from 'react';
import { prisma } from '@/lib/prisma';
import { Building2, ListTree, Star, Link as LinkIcon, Clock, ArrowUpRight } from 'lucide-react';
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
        slug: true,
      }
    })
  ]);

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ikhtisar Panel</h2>
        <p className="text-gray-500 mt-2 text-lg">Pantau dan kelola konten utama website Anda dari sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between group hover:border-[#1E356A]/20 transition-all">
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Properti</p>
            <h3 className="text-4xl font-extrabold text-gray-900">{totalProjects}</h3>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 text-[#1E356A] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between group hover:border-amber-500/20 transition-all">
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Properti Promo</p>
            <h3 className="text-4xl font-extrabold text-gray-900">{promoProjects}</h3>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Star className="w-6 h-6" />
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between group hover:border-purple-500/20 transition-all">
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Menu</p>
            <h3 className="text-4xl font-extrabold text-gray-900">{totalMenus}</h3>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <ListTree className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
        {/* Recent Projects Table */}
        <div className="xl:col-span-2 bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Baru Ditambahkan
            </h3>
            <Link href="/admin/projects" className="text-sm font-semibold text-[#1E356A] hover:text-[#2B4A93] flex items-center gap-1">
              Lihat Semua <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50/50 hover:border-gray-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-[#1E356A] transition-colors">{project.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-medium text-gray-500 capitalize">{project.category.replace('_', ' ')}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-xs text-gray-400">
                            {project.created_at ? new Date(project.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {project.is_promo && (
                        <span className="hidden sm:inline-flex px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100/50">
                          Promo
                        </span>
                      )}
                      <Link href={`/admin/projects/${project.id}/edit`} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  Belum ada properti ditambahkan.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-1">
          <div className="bg-gradient-to-br from-[#1E356A] to-[#2B4A93] rounded-[1.5rem] shadow-lg shadow-blue-900/20 p-6 sm:p-8 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-[#81A649] blur-3xl opacity-30 pointer-events-none"></div>
            
            <h3 className="text-lg font-bold mb-6 relative z-10">Jalan Pintas</h3>
            <div className="space-y-4 relative z-10">
              <Link href="/admin/projects/create" className="group flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white border border-white/5 hover:border-transparent transition-all hover:text-[#1E356A]">
                <span className="font-semibold group-hover:text-[#1E356A]">Tambah Properti Baru</span>
                <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-[#1E356A]/5 flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white group-hover:text-[#1E356A]" />
                </div>
              </Link>
              <Link href="/admin/menus" className="group flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white border border-white/5 hover:border-transparent transition-all hover:text-[#1E356A]">
                <span className="font-semibold group-hover:text-[#1E356A]">Ubah Menu Navigasi</span>
                <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-[#1E356A]/5 flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white group-hover:text-[#1E356A]" />
                </div>
              </Link>
              <Link href="/admin/settings" className="group flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white border border-white/5 hover:border-transparent transition-all hover:text-[#1E356A]">
                <span className="font-semibold group-hover:text-[#1E356A]">Pengaturan Website</span>
                <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-[#1E356A]/5 flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white group-hover:text-[#1E356A]" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
