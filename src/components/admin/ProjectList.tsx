'use client';

import React, { useState, useEffect, useRef } from 'react';
import { deleteProject, updateProjectSortOrders, renameCategory, bulkDeleteProjects, updateProjectName, updateProjectGroup, bulkUpdateProjectGroup } from '@/app/admin/actions';
import { Projects } from '@prisma/client';
import { Trash2, Plus, ExternalLink, Image as ImageIcon, Edit2, MapPin, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

function OrderInput({ value, max, onChange }: { value: number, max: number, onChange: (newIndexStr: string) => void }) {
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

function InlineEdit({ initialValue, onSave, textClass = "text-base font-bold text-gray-900", emptyText = "Ubah" }: { initialValue: string, onSave: (val: string) => Promise<void>, textClass?: string, emptyText?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 group/edit cursor-pointer" onClick={() => setIsEditing(true)} title="Klik untuk mengubah dengan cepat">
        <div className={`${textClass} group-hover:text-[#1E356A] transition-colors`}>
          {initialValue || <span className="italic text-gray-400 font-normal">{emptyText}</span>}
        </div>
        <Edit2 className="w-3 h-3 text-gray-300 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter') {
            setIsSaving(true);
            await onSave(value);
            setIsSaving(false);
            setIsEditing(false);
          } else if (e.key === 'Escape') {
            setValue(initialValue);
            setIsEditing(false);
          }
        }}
        onBlur={() => {
            // Option to cancel on blur or just do nothing
            // We do nothing so they can click save if we had a button, but we rely on Enter/Escape
        }}
        disabled={isSaving}
        className="px-3 py-1.5 border-2 border-[#1E356A] rounded-lg text-sm font-bold text-gray-900 w-full min-w-[250px] outline-none shadow-sm focus:ring-2 focus:ring-[#1E356A]/20"
        placeholder="Ketik nama baru dan tekan Enter"
      />
      {isSaving && <span className="text-xs text-gray-400 font-medium">Menyimpan...</span>}
      {!isSaving && <span className="text-[10px] text-gray-400">Tekan Enter untuk simpan, Esc batal</span>}
    </div>
  );
}


export default function ProjectList({ projects: initialProjects }: { projects: Projects[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkSettingGroup, setIsBulkSettingGroup] = useState(false);
  const [bulkGroupValue, setBulkGroupValue] = useState('');

  const baseCategories = [
    { id: 'rumah', label: 'Rumah' },
    { id: 'ruko_gudang', label: 'Ruko & Gudang' },
    { id: 'apartemen', label: 'Apartemen' },
    { id: 'kavling', label: 'Kavling' },
  ];

  const uniqueCategories = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
  const customCategories = uniqueCategories
    .filter(cat => !baseCategories.find(bc => bc.id === cat))
    .map(cat => ({ id: cat, label: cat.replace(/_/g, ' ').toUpperCase() }));

  const activeCategories = [...baseCategories, ...customCategories];

  // Sync state if props change (e.g., from server revalidation)
  useEffect(() => {
    // Sort them by sort_order ascending initially to be safe
    const sorted = [...initialProjects].sort((a, b) => a.sort_order - b.sort_order);
    setProjects(sorted);
  }, [initialProjects]);

  async function handleDelete(id: number) {
    if (confirm('Yakin ingin menghapus properti ini beserta gambarnya?')) {
      await deleteProject(id);
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  function toggleSelectAll(categoryIds: number[]) {
    const allSelected = categoryIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...categoryIds])));
    }
  }

  async function handleBulkDelete() {
    if (confirm(`Yakin ingin menghapus ${selectedIds.length} properti terpilih?`)) {
      setIsSaving(true);
      const res = await bulkDeleteProjects(selectedIds);
      if (res.success) {
        setSelectedIds([]);
      } else {
        alert(res.error);
      }
      setIsSaving(false);
    }
  }

  async function handleInlineSaveName(id: number, newName: string) {
    const res = await updateProjectName(id, newName);
    if (!res.success) {
      alert(res.error);
    } else {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    }
  }

  async function handleInlineSaveGroup(id: number, newGroup: string) {
    const res = await updateProjectGroup(id, newGroup);
    if (!res.success) {
      alert(res.error);
    } else {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, group_name: newGroup } : p));
    }
  }

  async function handleBulkSetGroupSubmit() {
    setIsSaving(true);
    const res = await bulkUpdateProjectGroup(selectedIds, bulkGroupValue);
    if (res.success) {
      setProjects(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, group_name: bulkGroupValue } : p));
      setSelectedIds([]);
      setIsBulkSettingGroup(false);
    } else {
      alert(res.error);
    }
    setIsSaving(false);
  }

  async function handleManualOrderChange(categoryId: string, sourceIndex: number, newIndexStr: string) {
    let newIndex = parseInt(newIndexStr) - 1;
    if (isNaN(newIndex)) return;

    const catProjects = projects.filter(p => p.category === categoryId).sort((a, b) => a.sort_order - b.sort_order);
    
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= catProjects.length) newIndex = catProjects.length - 1;

    if (sourceIndex === newIndex) {
      // Force re-render if they typed a string that wasn't exactly the number
      setProjects([...projects]);
      return;
    }

    const otherProjects = projects.filter(p => p.category !== categoryId);
    
    // Reorder within the category
    const [reorderedItem] = catProjects.splice(sourceIndex, 1);
    catProjects.splice(newIndex, 0, reorderedItem);

    // Re-assign sort_orders for this category
    const updates = catProjects.map((p, index) => {
      p.sort_order = index + 1; // update local object too
      return { id: p.id, sort_order: index + 1 };
    });

    // Recombine and update local state
    const newProjects = [...otherProjects, ...catProjects].sort((a, b) => a.sort_order - b.sort_order);
    setProjects(newProjects);

    // Save to server
    setIsSaving(true);
    try {
      await updateProjectSortOrders(updates);
    } catch (err) {
      console.error('Failed to save order', err);
      // Revert if failed
      setProjects(initialProjects);
    } finally {
      setIsSaving(false);
    }
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const category = result.source.droppableId;
    const draggedId = parseInt(result.draggableId);

    // If dragging a selected item and there are multiple selected items, do multi-drag
    if (selectedIds.includes(draggedId) && selectedIds.length > 1) {
      const catProjects = projects.filter(p => p.category === category).sort((a, b) => a.sort_order - b.sort_order);
      const otherProjects = projects.filter(p => p.category !== category);

      const targetArray = catProjects.filter(p => p.id !== draggedId);
      
      // Find the first unselected item that comes after our insertion point
      let targetUnselected = undefined;
      for (let i = destinationIndex; i < targetArray.length; i++) {
        if (!selectedIds.includes(targetArray[i].id)) {
          targetUnselected = targetArray[i];
          break;
        }
      }

      const unselectedInCategory = catProjects.filter(p => !selectedIds.includes(p.id));
      const selectedInCategory = catProjects.filter(p => selectedIds.includes(p.id));

      let insertIndex = unselectedInCategory.length;
      if (targetUnselected) {
        insertIndex = unselectedInCategory.findIndex(p => p.id === targetUnselected.id);
        if (insertIndex === -1) insertIndex = unselectedInCategory.length;
      }

      unselectedInCategory.splice(insertIndex, 0, ...selectedInCategory);

      const updates = unselectedInCategory.map((p, index) => {
        p.sort_order = index + 1; // update local object
        return { id: p.id, sort_order: index + 1 };
      });

      const newProjects = [...otherProjects, ...unselectedInCategory].sort((a, b) => a.sort_order - b.sort_order);
      setProjects(newProjects);

      setIsSaving(true);
      try {
        await updateProjectSortOrders(updates);
      } catch (err) {
        console.error('Failed to save multi-drag order', err);
        setProjects(initialProjects);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Normal single drag
      await handleManualOrderChange(category, sourceIndex, (destinationIndex + 1).toString());
    }
  }

  async function handleRenameCategory(oldCatId: string, oldCatLabel: string) {
    const newName = window.prompt(`Ubah nama kategori "${oldCatLabel}":\n(PERHATIAN: Ini akan mengubah kategori pada semua properti di dalamnya)`, oldCatLabel);
    if (newName && newName.trim() !== '' && newName.trim() !== oldCatId) {
      setIsSaving(true);
      try {
        const result = await renameCategory(oldCatId, newName.trim());
        if (!result.success) {
          alert(result.error);
        } else {
          // Trigger a local refresh by reloading the page or we just let Next.js revalidate do its thing
          window.location.reload();
        }
      } catch (err) {
        alert('Gagal mengubah nama kategori');
      } finally {
        setIsSaving(false);
      }
    }
  }

  // Helper to group projects
  const getProjectsByCategory = (categoryId: string) => {
    return projects.filter(p => p.category === categoryId).sort((a, b) => a.sort_order - b.sort_order);
  };

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 gap-4">
        <div>
           <h3 className="text-2xl font-bold text-gray-900">Portofolio Properti</h3>
           <p className="text-gray-500 mt-1">Kelola daftar properti, gambar cover, status promo, dan geser (drag) untuk mengatur urutan menu per kategori.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {isSaving && <span className="text-sm font-medium text-[#1E356A] animate-pulse bg-blue-50 px-3 py-1 rounded-full shrink-0">Menyimpan...</span>}
          {selectedIds.length > 0 && (
            isBulkSettingGroup ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto bg-blue-50/50 p-2 rounded-2xl border border-blue-100 shadow-inner">
                <input 
                  type="text"
                  value={bulkGroupValue}
                  onChange={e => setBulkGroupValue(e.target.value)}
                  placeholder="Ketik nama grup baru..."
                  className="px-4 py-2.5 rounded-xl border border-blue-200 focus:border-[#1E356A] outline-none text-sm w-full sm:w-56 focus:ring-2 focus:ring-[#1E356A]/20 transition-all font-medium text-gray-800"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBulkSetGroupSubmit();
                    if (e.key === 'Escape') setIsBulkSettingGroup(false);
                  }}
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleBulkSetGroupSubmit}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#1E356A] text-white font-bold rounded-xl hover:bg-[#15254A] transition-colors shadow-sm text-sm"
                  >
                    Simpan
                  </button>
                  <button 
                    onClick={() => setIsBulkSettingGroup(false)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-white text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm text-sm"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => { setIsBulkSettingGroup(true); setBulkGroupValue(''); }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  Set Grup ({selectedIds.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-200"
                >
                  <Trash2 className="w-5 h-5" />
                  Hapus ({selectedIds.length})
                </button>
              </div>
            )
          )}
          <Link
            href="/admin/projects/create"
            className="flex items-center gap-2 px-6 py-3.5 bg-[#111827] text-white rounded-2xl font-bold hover:bg-[#1E356A] transition-all shadow-md hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Tambah Baru
          </Link>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-6">
          {activeCategories.map((cat) => {
            const catProjects = getProjectsByCategory(cat.id);
            
            return (
              <div key={cat.id} className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-[#1E356A] focus:ring-[#1E356A] cursor-pointer"
                      checked={catProjects.length > 0 && catProjects.every(p => selectedIds.includes(p.id))}
                      onChange={() => toggleSelectAll(catProjects.map(p => p.id))}
                      title="Pilih semua di kategori ini"
                    />
                    <h4 className="font-bold text-[#1E356A] text-lg uppercase tracking-wide">{cat.label}</h4>
                    <button 
                      onClick={() => handleRenameCategory(cat.id, cat.label)} 
                      className="text-gray-400 hover:text-amber-600 hover:bg-amber-50 p-1.5 rounded-md transition-colors" 
                      title="Edit Nama Kategori"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="bg-white text-gray-500 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                    {catProjects.length} Properti
                  </span>
                </div>
                
                <div className="p-4 sm:p-6">
                  <Droppable droppableId={cat.id}>
                    {(provided) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-1 gap-3 min-h-[50px]"
                      >
                        {catProjects.map((project, index) => (
                          <Draggable key={project.id.toString()} draggableId={project.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all group gap-4 bg-white
                                  ${snapshot.isDragging ? 'shadow-xl border-[#1E356A] ring-2 ring-[#1E356A]/20 scale-[1.02] z-50' : 'border-gray-100 hover:border-[#1E356A]/30 hover:bg-gray-50/50'}`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                  {/* Checkbox */}
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-gray-300 text-[#1E356A] focus:ring-[#1E356A] cursor-pointer"
                                    checked={selectedIds.includes(project.id)}
                                    onChange={() => toggleSelect(project.id)}
                                  />

                                  {/* Drag Handle */}
                                  <div 
                                    {...provided.dragHandleProps} 
                                    className="p-1 -ml-2 text-gray-300 hover:text-[#1E356A] cursor-grab active:cursor-grabbing transition-colors"
                                    title="Geser untuk mengatur urutan"
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>

                                  {/* Thumbnail */}
                                  <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                    {project.cover_image ? (
                                      <img 
                                        src={project.cover_image.startsWith('http') ? project.cover_image : `/api/${project.cover_image}`} 
                                        alt={project.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                        draggable={false}
                                      />
                                    ) : (
                                      <ImageIcon className="w-6 h-6 text-gray-400" />
                                    )}
                                  </div>
                                  
                                  {/* Info */}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <OrderInput 
                                        value={index + 1} 
                                        max={catProjects.length} 
                                        onChange={(newIndexStr) => handleManualOrderChange(cat.id, index, newIndexStr)} 
                                      />
                                      <InlineEdit initialValue={project.name} onSave={async (val) => await handleInlineSaveName(project.id, val)} />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-2 border border-gray-200">
                                        Grup/Tahap:
                                        <InlineEdit 
                                          initialValue={project.group_name || ''} 
                                          onSave={async (val) => await handleInlineSaveGroup(project.id, val)} 
                                          textClass="text-xs font-bold text-gray-700" 
                                          emptyText="Atur Grup" 
                                        />
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                      {project.is_promo && (
                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded uppercase tracking-wider">
                                          Promo
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {project.location || 'Lokasi -'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                                  <a href={`/project/${project.slug}`} target="_blank" className="p-2 rounded-lg text-gray-400 hover:text-[#1E356A] hover:bg-[#1E356A]/5 transition-colors" title="Lihat Halaman">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                  <Link href={`/admin/projects/${project.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit Properti">
                                    <Edit2 className="w-4 h-4" />
                                  </Link>
                                  <button onClick={() => handleDelete(project.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus Properti">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {catProjects.length === 0 && (
                          <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 font-medium">
                            Kosong. Belum ada properti di kategori ini.
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

    </div>
  );
}
