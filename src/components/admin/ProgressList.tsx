'use client';

import React, { useState, useEffect } from 'react';
import { createProgress, deleteProgress, editProgress, updateProgressSortOrders } from '@/app/admin/actions';
import { Progress } from '@prisma/client';
import { Trash2, Plus, PlayCircle, GripVertical, Edit2, X, Check } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function ProgressList({ initialData }: { initialData: Progress[] }) {
  const [isSaving, setIsSaving] = useState(false);
  const [progressList, setProgressList] = useState(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    // Sync state and sort properly
    const sorted = [...initialData].sort((a, b) => a.sort_order - b.sort_order);
    setProgressList(sorted);
  }, [initialData]);

  async function handleAddProgress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    await createProgress(formData);
    
    setIsSaving(false);
    (e.target as HTMLFormElement).reset();
  }

  async function handleDelete(id: number) {
    if (confirm('Yakin ingin menghapus video ini?')) {
      await deleteProgress(id);
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const result = await editProgress(id, formData);
    if (result.success) {
      setEditingId(null);
    } else {
      alert(result.error);
    }
    setIsSaving(false);
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newProgressList = Array.from(progressList);
    const [reorderedItem] = newProgressList.splice(sourceIndex, 1);
    newProgressList.splice(destinationIndex, 0, reorderedItem);

    // Update local state optimistically
    const updates = newProgressList.map((p, index) => {
      p.sort_order = index + 1; // update local object
      return { id: p.id, sort_order: index + 1 };
    });

    setProgressList(newProgressList);

    // Save to server
    setIsSaving(true);
    try {
      await updateProgressSortOrders(updates);
    } catch (err) {
      console.error('Failed to save order', err);
      setProgressList(initialData); // Revert
    } finally {
      setIsSaving(false);
    }
  }

  // Extract Youtube ID to show thumbnail
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Tambah Video */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
          <h3 className="text-lg font-bold text-[#1E356A] mb-4 border-b pb-2">Tambah Video Baru</h3>
          <form onSubmit={handleAddProgress} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Video</label>
              <input type="text" name="title" required className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#1E356A]/30 focus:border-[#1E356A]" placeholder="Contoh: Progres Tahap 1..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link YouTube</label>
              <input type="url" name="youtube_url" required className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#1E356A]/30 focus:border-[#1E356A]" placeholder="https://youtube.com/watch?v=..." />
              <p className="text-xs text-gray-500 mt-1">Gunakan link lengkap atau youtu.be</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E356A] text-white rounded-xl font-bold hover:bg-[#2B4A93] transition-colors disabled:opacity-70"
            >
              <Plus className="w-4 h-4" />
              {isSaving ? 'Memproses...' : 'Simpan Video'}
            </button>
          </form>
        </div>
      </div>

      {/* Daftar Video dengan Drag & Drop */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Daftar Video & Urutan</h3>
            {isSaving && <span className="text-sm font-medium text-[#1E356A] animate-pulse bg-blue-50 px-3 py-1 rounded-full">Menyimpan...</span>}
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="progress-list">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4 min-h-[100px]"
                >
                  {progressList.map((progress, index) => {
                    const ytId = getYoutubeId(progress.youtube_url);
                    const isEditing = editingId === progress.id;

                    return (
                      <Draggable key={progress.id.toString()} draggableId={progress.id.toString()} index={index} isDragDisabled={isEditing}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl border transition-all gap-4 bg-white
                              ${snapshot.isDragging ? 'shadow-xl border-[#1E356A] ring-2 ring-[#1E356A]/20 scale-[1.02] z-50' : 'border-gray-100 hover:border-[#1E356A]/30 hover:bg-gray-50/50'}`}
                            style={{ ...provided.draggableProps.style }}
                          >
                            {isEditing ? (
                              // EDIT MODE
                              <form onSubmit={(e) => handleEdit(e, progress.id)} className="w-full space-y-3">
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase">Judul Video</label>
                                  <input type="text" name="title" defaultValue={progress.title} required className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 mt-1" />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 uppercase">Link YouTube</label>
                                  <input type="url" name="youtube_url" defaultValue={progress.youtube_url} required className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 mt-1" />
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                  <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                                  <button type="submit" disabled={isSaving} className="px-3 py-1.5 text-sm font-medium bg-[#1E356A] text-white rounded-lg flex items-center gap-1"><Check className="w-4 h-4"/> Simpan</button>
                                </div>
                              </form>
                            ) : (
                              // VIEW MODE
                              <>
                                <div className="flex items-center gap-4 w-full sm:w-auto flex-grow">
                                  {/* Drag Handle */}
                                  <div 
                                    {...provided.dragHandleProps} 
                                    className="p-2 -ml-2 text-gray-300 hover:text-[#1E356A] cursor-grab active:cursor-grabbing transition-colors"
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>

                                  {/* Thumbnail */}
                                  <div className="w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm relative group">
                                    {ytId ? (
                                      <>
                                        <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                          <PlayCircle className="w-8 h-8 text-white opacity-80 group-hover:opacity-100" />
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-xs text-gray-400 font-medium">No Thumb</span>
                                    )}
                                  </div>
                                  
                                  {/* Info */}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">#{index + 1}</span>
                                      <h4 className="text-base font-bold text-gray-900 truncate">{progress.title}</h4>
                                    </div>
                                    <a href={progress.youtube_url} target="_blank" rel="noreferrer" className="text-xs text-[#1E356A] hover:underline truncate block">
                                      {progress.youtube_url}
                                    </a>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 w-full sm:w-auto justify-end sm:justify-start">
                                  <button onClick={() => setEditingId(progress.id)} className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit Video">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(progress.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus Video">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                  
                  {progressList.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <PlayCircle className="w-10 h-10 text-gray-300 mb-3" />
                      <h3 className="text-base font-bold text-gray-900">Belum Ada Video</h3>
                      <p className="text-gray-500 mt-1 text-sm">Tambahkan video dari formulir di samping.</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
