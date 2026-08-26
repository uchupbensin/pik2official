'use client';

import React from 'react';
import { deleteProject } from '@/app/admin/actions';
import { Projects } from '@prisma/client';
import { Trash2, Plus, ExternalLink, Image as ImageIcon, Edit2, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ProjectList({ projects }: { projects: Projects[] }) {
  async function handleDelete(id: number) {
    if (confirm('Yakin ingin menghapus properti ini beserta gambarnya?')) {
      await deleteProject(id);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 gap-4">
        <div>
           <h3 className="text-2xl font-bold text-gray-900">Portofolio Properti</h3>
           <p className="text-gray-500 mt-1">Kelola daftar properti, gambar *cover*, dan status promo.</p>
        </div>
        <Link
          href="/admin/projects/create"
          className="flex items-center gap-2 px-6 py-3.5 bg-[#111827] text-white rounded-2xl font-bold hover:bg-[#1E356A] transition-all shadow-md hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Tambah Baru
        </Link>
      </div>

      {/* Project List */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-[#1E356A]/30 hover:bg-gray-50/50 transition-all group gap-4">
              
              <div className="flex items-center gap-5 w-full sm:w-auto">
                {/* Thumbnail */}
                <div className="w-20 h-20 sm:w-16 sm:h-16 flex-shrink-0 rounded-[1rem] bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                  {project.cover_image ? (
                    <img 
                      src={project.cover_image.startsWith('http') ? project.cover_image : `/${project.cover_image}`} 
                      alt={project.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                {/* Info */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#1E356A] transition-colors">{project.name}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{project.category.replace('_', ' ')}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {project.location || 'Lokasi tidak ditentukan'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges & Actions */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                <div className="flex items-center">
                  {project.is_promo ? (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg uppercase tracking-wider">
                      Promo
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg">
                      Reguler
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a href={`/project/${project.slug}`} target="_blank" className="p-2.5 rounded-xl text-gray-400 hover:text-[#1E356A] hover:bg-[#1E356A]/5 transition-colors" title="Lihat Halaman">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <Link href={`/admin/projects/${project.id}/edit`} className="p-2.5 rounded-xl text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit Properti">
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button onClick={() => handleDelete(project.id)} className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus Properti">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          ))}

          {projects.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Belum Ada Properti</h3>
              <p className="text-gray-500 mt-2 max-w-sm">Anda belum menambahkan data properti apa pun. Klik tombol "Tambah Baru" untuk memulai.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
