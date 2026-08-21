'use client';

import React from 'react';
import { deleteProject } from '@/app/admin/actions';
import { Projects } from '@prisma/client';
import { Trash2, Plus, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function ProjectList({ projects }: { projects: Projects[] }) {
  async function handleDelete(id: number) {
    if (confirm('Yakin ingin menghapus properti ini beserta gambarnya?')) {
      await deleteProject(id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link
          href="/admin/projects/create"
          className="flex items-center gap-2 px-6 py-2.5 bg-[#1E356A] text-white rounded-xl font-bold hover:bg-[#14244B] transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Tambah Properti
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Info Properti</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lokasi</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {project.cover_image ? (
                        <img src={`/${project.cover_image}`} alt="" className="h-12 w-12 object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500">/{project.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.location || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {project.is_promo ? (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#81A649]/10 text-[#81A649]">
                      Promo Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Standard
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <a href={`/project/${project.slug}`} target="_blank" className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleDelete(project.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Belum ada properti. Silakan klik tombol "Tambah Properti" di atas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
