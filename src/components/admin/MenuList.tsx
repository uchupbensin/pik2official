'use client';

import React, { useState } from 'react';
import { createMenu, deleteMenu } from '@/app/admin/actions';
import { Menus } from '@prisma/client';
import { Trash2, Plus } from 'lucide-react';

export default function MenuList({ menus }: { menus: Menus[] }) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleAddMenu(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    await createMenu(formData);
    setIsSaving(false);
    (e.target as HTMLFormElement).reset();
  }

  async function handleDelete(id: number) {
    if (confirm('Yakin ingin menghapus menu ini?')) {
      await deleteMenu(id);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Tambah Menu */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#1E356A] mb-4 border-b pb-2">Tambah Menu Baru</h3>
          <form onSubmit={handleAddMenu} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label Menu</label>
              <input type="text" name="label" required className="w-full px-4 py-2 border rounded-xl focus:ring-[#81A649] focus:border-[#81A649]" placeholder="Contoh: Tentang Kami" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL / Link</label>
              <input type="text" name="url" required className="w-full px-4 py-2 border rounded-xl focus:ring-[#81A649] focus:border-[#81A649]" placeholder="Contoh: /about atau https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Menu Induk (Opsional)</label>
              <select name="parent_id" className="w-full px-4 py-2 border rounded-xl focus:ring-[#81A649] focus:border-[#81A649]">
                <option value="">-- Tidak Ada --</option>
                {menus.filter(m => !m.parent_id).map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="is_active" defaultChecked className="rounded text-[#81A649] focus:ring-[#81A649]" />
                Aktif
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="open_in_new_tab" className="rounded text-[#81A649] focus:ring-[#81A649]" />
                Buka di Tab Baru
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
              <input type="number" name="sort_order" defaultValue={0} className="w-full px-4 py-2 border rounded-xl focus:ring-[#81A649] focus:border-[#81A649]" />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E356A] text-white rounded-xl font-bold hover:bg-[#14244B] transition-colors disabled:opacity-70"
            >
              <Plus className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Menu'}
            </button>
          </form>
        </div>
      </div>

      {/* Daftar Menu */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Label</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Urutan</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menus.map((menu) => (
                <tr key={menu.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {menu.parent_id && <span className="text-gray-300 mr-2">└─</span>}
                      <span className={`font-medium ${menu.parent_id ? 'text-gray-600' : 'text-gray-900'}`}>{menu.label}</span>
                      {!menu.is_active && <span className="ml-2 px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">Nonaktif</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{menu.sort_order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(menu.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {menus.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Belum ada menu navigasi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
