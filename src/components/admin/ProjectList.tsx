'use client';

import React, { useState, useEffect } from 'react';
import { deleteProject, updateProjectSortOrders, renameCategory } from '@/app/admin/actions';
import { Projects } from '@prisma/client';
import { Trash2, Plus, ExternalLink, Image as ImageIcon, Edit2, MapPin, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';


export default function ProjectList({ projects: initialProjects }: { projects: Projects[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isSaving, setIsSaving] = useState(false);

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
    }
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const category = result.source.droppableId; // We used category id as droppableId

    if (sourceIndex === destinationIndex) return;

    // Get projects only for this category
    const categoryProjects = projects.filter(p => p.category === category);
    const otherProjects = projects.filter(p => p.category !== category);

    // Reorder within the category
    const [reorderedItem] = categoryProjects.splice(sourceIndex, 1);
    categoryProjects.splice(destinationIndex, 0, reorderedItem);

    // Re-assign sort_orders for this category
    const updates = categoryProjects.map((p, index) => {
      p.sort_order = index + 1; // update local object too
      return { id: p.id, sort_order: index + 1 };
    });

    // Recombine and update local state
    const newProjects = [...otherProjects, ...categoryProjects].sort((a, b) => a.sort_order - b.sort_order);
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
          {isSaving && <span className="text-sm font-medium text-[#1E356A] animate-pulse bg-blue-50 px-3 py-1 rounded-full">Menyimpan urutan...</span>}
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
                                  {/* Drag Handle */}
                                  <div 
                                    {...provided.dragHandleProps} 
                                    className="p-2 text-gray-300 hover:text-[#1E356A] cursor-grab active:cursor-grabbing transition-colors"
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
                                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">#{index + 1}</span>
                                      <h4 className="text-base font-bold text-gray-900 group-hover:text-[#1E356A] transition-colors">{project.name}</h4>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
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
