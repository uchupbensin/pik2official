'use client';

import React, { useState, useEffect } from 'react';
import { createFacility, editFacility, deleteFacility, updateFacilitySortOrders } from '@/app/admin/actions';
import { Facilities } from '@prisma/client';
import { Trash2, Plus, GripVertical, Edit2, X, Check, Image as ImageIcon, Sparkles, ExternalLink } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

function OrderInput({ value, max, onChange }: { value: number; max: number; onChange: (newIndexStr: string) => void }) {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    onChange(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="number"
      min="1"
      max={max}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-16 bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded border border-transparent hover:border-gray-300 focus:border-[#1E356A] focus:bg-white focus:ring-2 focus:ring-[#1E356A]/20 outline-none text-center transition-all shrink-0"
      title="Ketik angka dan tekan Enter untuk mengubah urutan"
    />
  );
}

export default function FacilitiesList({ initialData }: { initialData: Facilities[] }) {
  const [isSaving, setIsSaving] = useState(false);
  const [facilities, setFacilities] = useState(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewAddImage, setPreviewAddImage] = useState<string | null>(null);
  const [editPreviewImage, setEditPreviewImage] = useState<{ [id: number]: string | null }>({});

  useEffect(() => {
    const sorted = [...initialData].sort((a, b) => a.sort_order - b.sort_order);
    setFacilities(sorted);
  }, [initialData]);

  const formatImageUrl = (imgPath?: string | null) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('/')) {
      return imgPath;
    }
    if (imgPath.startsWith('uploads/')) {
      return `/api/${imgPath}`;
    }
    return `/api/uploads/${imgPath}`;
  };

  async function handleAddFacility(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await createFacility(formData);
    if (res.success) {
      form.reset();
      setPreviewAddImage(null);
      setShowAddForm(false);
    } else {
      alert(res.error || 'Gagal menambahkan fasilitas');
    }
    setIsSaving(false);
  }

  async function handleEditFacility(e: React.FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const res = await editFacility(id, formData);
    if (res.success) {
      setEditingId(null);
    } else {
      alert(res.error || 'Gagal mengedit fasilitas');
    }
    setIsSaving(false);
  }

  async function handleDelete(id: number, title: string) {
    if (confirm(`Yakin ingin menghapus fasilitas "${title}"?`)) {
      setIsSaving(true);
      await deleteFacility(id);
      setIsSaving(false);
    }
  }

  async function handleManualOrderChange(sourceIndex: number, newIndexStr: string) {
    let newIndex = parseInt(newIndexStr) - 1;
    if (isNaN(newIndex)) return;

    if (newIndex < 0) newIndex = 0;
    if (newIndex >= facilities.length) newIndex = facilities.length - 1;

    if (sourceIndex === newIndex) {
      setFacilities([...facilities]);
      return;
    }

    const newList = Array.from(facilities);
    const [reorderedItem] = newList.splice(sourceIndex, 1);
    newList.splice(newIndex, 0, reorderedItem);

    const updates = newList.map((item, index) => {
      item.sort_order = index + 1;
      return { id: item.id, sort_order: index + 1 };
    });

    setFacilities(newList);
    setIsSaving(true);
    await updateFacilitySortOrders(updates);
    setIsSaving(false);
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newList = Array.from(facilities);
    const [reorderedItem] = newList.splice(sourceIndex, 1);
    newList.splice(destinationIndex, 0, reorderedItem);

    const updates = newList.map((item, index) => {
      item.sort_order = index + 1;
      return { id: item.id, sort_order: index + 1 };
    });

    setFacilities(newList);
    setIsSaving(true);
    await updateFacilitySortOrders(updates);
    setIsSaving(false);
  }

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#81A649]" />
            Daftar Fasilitas & Keunggulan Kawasan
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Total {facilities.length} fasilitas terdaftar. Geser atau ubah angka untuk mengatur posisi tampilan slider di Homepage.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E356A] text-white rounded-xl text-sm font-bold hover:bg-[#2B4A93] shadow-md transition-all shrink-0 cursor-pointer"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Tutup Formulir' : 'Tambah Fasilitas Baru'}</span>
        </button>
      </div>

      {/* Add New Facility Form */}
      {showAddForm && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-[#1E356A]/20 transition-all">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#81A649]" />
              Formulir Tambah Fasilitas / Keunggulan
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddFacility} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Judul Fasilitas / Keunggulan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: Green Belt PIK2"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Kategori
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="Contoh: Ruang Terbuka Hijau, Aksesibilitas, Wisata"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Badge / Sorotan Singkat (Opsional)
                </label>
                <input
                  type="text"
                  name="badge"
                  placeholder="Contoh: 7-15 Menit ke Bandara, Pasir Putih 4 KM"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Upload Foto Fasilitas
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPreviewAddImage(URL.createObjectURL(file));
                    } else {
                      setPreviewAddImage(null);
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1E356A]/10 file:text-[#1E356A] hover:file:bg-[#1E356A]/20 cursor-pointer border border-gray-200 rounded-xl p-1.5 bg-gray-50/50"
                />
                <p className="text-xs text-gray-500 mt-1">Format JPG, PNG, atau WebP.</p>
                {previewAddImage && (
                  <div className="mt-3 relative w-36 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <img src={previewAddImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Deskripsi / Penjelasan Fasilitas <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={3}
                required
                placeholder="Tuliskan keterangan lengkap tentang fasilitas atau keunggulan ini..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] outline-none text-sm transition-all"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#81A649] text-white font-bold rounded-xl text-sm hover:bg-[#72943e] shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Fasilitas'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drag & Drop Reorderable List */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="facilities-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {facilities.map((facility, index) => {
                const isEditing = editingId === facility.id;
                const formattedImg = formatImageUrl(facility.image_url);

                return (
                  <Draggable key={facility.id.toString()} draggableId={facility.id.toString()} index={index} isDragDisabled={isEditing}>
                    {(providedDraggable) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isEditing
                            ? 'border-[#1E356A] ring-2 ring-[#1E356A]/10 shadow-md'
                            : 'border-gray-100 shadow-xs hover:border-gray-200 hover:shadow-sm'
                        }`}
                      >
                        {isEditing ? (
                          /* Edit Form */
                          <form
                            onSubmit={(e) => handleEditFacility(e, facility.id)}
                            className="p-6 space-y-5 bg-blue-50/20"
                          >
                            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                              <div className="flex items-center gap-2">
                                <div {...providedDraggable.dragHandleProps} className="p-1 text-gray-400 opacity-60">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-[#1E356A] flex items-center gap-1.5">
                                  <Edit2 className="w-4 h-4 text-[#81A649]" />
                                  Edit Fasilitas #{index + 1}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                  Judul Fasilitas
                                </label>
                                <input
                                  type="text"
                                  name="title"
                                  defaultValue={facility.title}
                                  required
                                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                  Kategori
                                </label>
                                <input
                                  type="text"
                                  name="category"
                                  defaultValue={facility.category || ''}
                                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                  Badge Sorotan
                                </label>
                                <input
                                  type="text"
                                  name="badge"
                                  defaultValue={facility.badge || ''}
                                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Deskripsi
                              </label>
                              <textarea
                                name="description"
                                rows={3}
                                defaultValue={facility.description}
                                required
                                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] outline-none"
                              ></textarea>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Ganti Foto Fasilitas
                              </label>
                              <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setEditPreviewImage({
                                      ...editPreviewImage,
                                      [facility.id]: URL.createObjectURL(file),
                                    });
                                  }
                                }}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1E356A]/10 file:text-[#1E356A] cursor-pointer border border-gray-300 rounded-xl p-1 bg-white"
                              />
                              <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengganti foto saat ini.</p>
                              
                              <div className="mt-2 flex items-center gap-3">
                                {editPreviewImage[facility.id] ? (
                                  <div>
                                    <span className="text-xs text-blue-600 font-semibold block mb-1">Foto Baru yang Dipilih:</span>
                                    <div className="w-28 h-20 rounded-lg overflow-hidden border border-blue-200 shadow-xs">
                                      <img src={editPreviewImage[facility.id]!} alt="Preview Baru" className="w-full h-full object-cover" />
                                    </div>
                                  </div>
                                ) : formattedImg ? (
                                  <div>
                                    <span className="text-xs text-gray-500 font-medium block mb-1">Foto Saat Ini:</span>
                                    <div className="w-28 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                                      <img src={formattedImg} alt={facility.title} className="w-full h-full object-cover" />
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                Batal
                              </button>
                              <button
                                type="submit"
                                disabled={isSaving}
                                className="px-5 py-2 bg-[#1E356A] text-white font-bold rounded-xl text-xs hover:bg-[#2B4A93] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5 text-[#81A649]" />
                                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* View Card Item */
                          <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              {/* Drag Handle */}
                              <div
                                {...providedDraggable.dragHandleProps}
                                className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-lg cursor-grab active:cursor-grabbing transition-colors shrink-0"
                                title="Tahan dan geser untuk memindahkan urutan"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>

                              {/* Manual Order Input */}
                              <OrderInput
                                value={index + 1}
                                max={facilities.length}
                                onChange={(val) => handleManualOrderChange(index, val)}
                              />

                              {/* Facility Thumbnail */}
                              <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
                                {formattedImg ? (
                                  <img
                                    src={formattedImg}
                                    alt={facility.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <ImageIcon className="w-6 h-6" />
                                  </div>
                                )}
                              </div>

                              {/* Content Details */}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  {facility.category && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-[#1E356A]/10 text-[#1E356A] text-[10px] font-bold uppercase tracking-wider">
                                      {facility.category}
                                    </span>
                                  )}
                                  {facility.badge && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#81A649]/15 text-[#81A649] text-[10px] font-bold">
                                      {facility.badge}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-gray-900 text-base leading-tight truncate">
                                  {facility.title}
                                </h4>
                                <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-1 leading-relaxed">
                                  {facility.description}
                                </p>
                              </div>
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex items-center gap-2 self-end md:self-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                              <button
                                onClick={() => {
                                  setEditingId(facility.id);
                                  setEditPreviewImage({});
                                }}
                                className="px-3.5 py-2 bg-gray-50 text-[#1E356A] hover:bg-[#1E356A] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-gray-200/80 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit & Foto</span>
                              </button>
                              <button
                                onClick={() => handleDelete(facility.id, facility.title)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                title="Hapus Fasilitas"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
