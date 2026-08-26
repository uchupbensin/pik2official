'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createProject, updateProject, deleteProjectImage, updateProjectImageCaption } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Trash2, CheckCircle2, Save, FileImage, Type, Check } from 'lucide-react';
import Link from 'next/link';
import { Projects, ProjectImages } from '@prisma/client';

type ProjectWithImages = Projects & { project_images?: ProjectImages[] };

export default function ProjectForm({ project }: { project?: ProjectWithImages }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // PDF Extraction States
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfTotal, setPdfTotal] = useState(0);
  const [webpFiles, setWebpFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [pdfCaptions, setPdfCaptions] = useState<string[]>([]);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Cleanup preview URLs on unmount
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Append generated WebP files and their captions
    webpFiles.forEach((file, idx) => {
      formData.append('images', file);
      formData.append('image_captions', pdfCaptions[idx] || '');
    });

    // Check if user uploaded a manual cover image
    const manualCover = formData.get('cover_image') as File | null;
    if ((!manualCover || manualCover.size === 0) && selectedCoverIndex !== null && webpFiles[selectedCoverIndex]) {
      // Override cover_image with the selected WebP file from PDF
      formData.set('cover_image', webpFiles[selectedCoverIndex]);
    }
    
    const result = project 
      ? await updateProject(project.id, formData)
      : await createProject(formData);

    if (result.success) {
      router.push('/admin/projects');
      router.refresh();
    } else {
      setError(result.error || 'Terjadi kesalahan saat menyimpan.');
      setIsSaving(false);
    }
  }

  async function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setWebpFiles([]);
      setPreviewUrls([]);
      setPdfCaptions([]);
      setSelectedCoverIndex(null);
      return;
    }
    
    if (file.type !== 'application/pdf') {
      return;
    }

    setIsProcessingPdf(true);
    setPdfProgress(0);
    setPdfTotal(0);
    setWebpFiles([]);
    setPreviewUrls([]);
    setPdfCaptions([]);
    setSelectedCoverIndex(null);

    try {
      let pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = () => {
            pdfjsLib = (window as any).pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve();
          };
          script.onerror = () => reject(new Error('Gagal memuat library PDF'));
          document.head.appendChild(script);
        });
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfTotal(pdf.numPages);
      
      const extractedFiles: File[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        setPdfProgress(i);
        const page = await pdf.getPage(i);
        const scale = 2.0; 
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext: any = {
          canvasContext: context!,
          viewport: viewport
        };
        await page.render(renderContext).promise;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/webp', 0.85);
        });

        if (blob) {
          extractedFiles.push(new File([blob], `page_${i}.webp`, { type: 'image/webp' }));
        }
      }
      
      setWebpFiles(extractedFiles);
      setPreviewUrls(extractedFiles.map(f => URL.createObjectURL(f)));
      setPdfCaptions(new Array(extractedFiles.length).fill(''));
      if (extractedFiles.length > 0) {
        setSelectedCoverIndex(0); // Default first page as cover
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat mengekstrak PDF: ' + err.message);
    } finally {
      setIsProcessingPdf(false);
    }
  }

  function handleDeletePage(idx: number) {
    if (confirm('Yakin ingin menghapus halaman ini dari daftar upload?')) {
      const newWebpFiles = [...webpFiles];
      newWebpFiles.splice(idx, 1);
      setWebpFiles(newWebpFiles);

      const newPreviewUrls = [...previewUrls];
      URL.revokeObjectURL(newPreviewUrls[idx]);
      newPreviewUrls.splice(idx, 1);
      setPreviewUrls(newPreviewUrls);

      const newPdfCaptions = [...pdfCaptions];
      newPdfCaptions.splice(idx, 1);
      setPdfCaptions(newPdfCaptions);

      if (selectedCoverIndex === idx) {
        setSelectedCoverIndex(null);
      } else if (selectedCoverIndex !== null && selectedCoverIndex > idx) {
        setSelectedCoverIndex(selectedCoverIndex - 1);
      }
    }
  }

  async function handleDeleteImage(id: number) {
    if (confirm('Yakin ingin menghapus gambar ini?')) {
      await deleteProjectImage(id);
    }
  }

  async function handleCaptionChange(id: number, newCaption: string) {
    await updateProjectImageCaption(id, newCaption);
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-600 transition-colors mb-2 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h2 className="text-2xl font-bold text-gray-600">{project ? 'Edit Properti' : 'Tambah Properti Baru'}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* SECTION: DATA UTAMA */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-600 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
            Informasi Dasar
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Nama Properti <span className="text-red-500">*</span></label>
              <input type="text" name="name" defaultValue={project?.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none text-sm text-gray-900" placeholder="Contoh: Tokyo Riverside" />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Kategori <span className="text-red-500">*</span></label>
              <select name="category" defaultValue={project?.category || 'rumah'} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none text-sm text-gray-900">
                <option value="rumah">Rumah</option>
                <option value="ruko_gudang">Ruko & Gudang</option>
                <option value="apartemen">Apartemen</option>
                <option value="kavling">Kavling</option>
              </select>
            </div>
            
            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Deskripsi Singkat</label>
              <textarea name="short_description" defaultValue={project?.short_description || ''} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none text-sm text-gray-900" placeholder="Ceritakan keunggulan properti ini secara singkat..."></textarea>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Lokasi / Area</label>
              <input type="text" name="location" defaultValue={project?.location || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none text-sm text-gray-900" placeholder="Contoh: Pantai Indah Kapuk 2" />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Nomor WhatsApp Sales (Opsional)</label>
              <input type="text" name="whatsapp_number" defaultValue={project?.whatsapp_number || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none font-mono text-sm" placeholder="62812345..." />
              <p className="text-xs text-gray-500">Gunakan format 62... Kosongkan untuk pakai nomor utama.</p>
            </div>

            {/* Info Tambahan */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Link Video YouTube (Opsional)</label>
                <input
                  type="url"
                  name="youtube_url"
                  defaultValue={project?.youtube_url || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] transition-all"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Link Google Maps (Opsional)</label>
                <input
                  type="url"
                  name="gmaps_url"
                  defaultValue={project?.gmaps_url || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] transition-all"
                  placeholder="https://maps.app.goo.gl/..."
                />
                <p className="text-xs text-gray-500 mt-1">Cukup tempelkan link Google Maps biasa. Peta akan ditampilkan secara otomatis.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3 items-center">
            <input type="checkbox" name="is_promo" defaultChecked={project?.is_promo} id="is_promo" className="w-4 h-4 rounded text-[#1E356A] focus:ring-[#1E356A]/30 border-gray-300" />
            <label htmlFor="is_promo" className="text-sm font-medium text-gray-500 cursor-pointer">
              Tandai sebagai Properti Promo 🔥 (Muncul di utama)
            </label>
          </div>
        </div>

        {/* SECTION: MEDIA & E-BROSUR */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-600 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
            Media & Brosur
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2">Upload E-Brosur (PDF)</label>
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center relative">
                <input type="file" name="brochure_file" accept="application/pdf" onChange={handlePdfChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm font-medium text-[#1E356A]">Pilih File PDF Brosur</p>
                  <p className="text-xs text-gray-500 mt-1">Otomatis diekstrak menjadi galeri WebP.</p>
                </div>
              </div>
              
              {isProcessingPdf && (
                <div className="mt-3 text-sm text-[#1E356A] font-medium flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Memproses PDF... ({pdfProgress}/{pdfTotal})
                </div>
              )}
              
              {!isProcessingPdf && webpFiles.length > 0 && (
                <div className="mt-3 text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Berhasil mengekstrak {webpFiles.length} halaman.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2">Gambar Cover (Manual)</label>
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center relative">
                <input type="file" name="cover_image" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm font-medium text-gray-500">Pilih gambar dari komputer</p>
                  <p className="text-xs text-gray-500 mt-1">Abaikan ini jika Anda ingin menggunakan halaman PDF sebagai cover.</p>
                </div>
              </div>
              {project?.cover_image && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> Cover sudah ada. Upload baru untuk menimpa.
                </div>
              )}
            </div>
          </div>

          {/* PDF Pages Thumbnails for Cover Selection */}
          {!isProcessingPdf && previewUrls.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-500 mb-3">Halaman Brosur (Pilih Cover & Isi Label):</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {previewUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    className={`relative flex flex-col rounded-xl border overflow-hidden transition-all shadow-sm ${selectedCoverIndex === idx ? 'border-[#1E356A] bg-[#1E356A]/5' : 'border-gray-200 bg-white'}`}
                  >
                    <button 
                      type="button" 
                      onClick={() => handleDeletePage(idx)}
                      className="absolute top-2 left-2 z-10 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                      title="Hapus Halaman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="relative aspect-[3/4] cursor-pointer" onClick={() => setSelectedCoverIndex(idx)}>
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2 px-2 text-white text-xs font-medium font-mono text-center">
                        Halaman {idx + 1}
                      </div>
                      {selectedCoverIndex === idx && (
                        <div className="absolute top-2 right-2 bg-[#1E356A] text-white rounded-full p-1.5 shadow-md">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <input
                        type="text"
                        value={pdfCaptions[idx] || ''}
                        onChange={(e) => {
                          const newCaptions = [...pdfCaptions];
                          newCaptions[idx] = e.target.value;
                          setPdfCaptions(newCaptions);
                        }}
                        placeholder={`Tulis caption...`}
                        className="w-full text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-md focus:border-[#1E356A] focus:ring-[#1E356A]/20 focus:bg-white px-3 py-2 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION: GALERI GAMBAR TERSIMPAN */}
        {project?.project_images && project.project_images.length > 0 && (
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-600 mb-2 border-b border-gray-100 pb-3">Galeri Brosur Tersimpan</h3>
            <p className="text-xs text-gray-500 mb-4">Ubah label gambar dengan langsung mengetik di kotaknya.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {project.project_images.map((img) => (
                <div key={img.id} className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <div className="aspect-[3/4] bg-gray-200">
                    <img 
                      src={`/storage/${img.image_path}`} 
                      alt={img.caption || `Brochure ${img.id}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                    #{img.sort_order}
                  </div>
                  <div className="p-2 border-t border-gray-200 bg-white">
                    <input 
                      type="text" 
                      defaultValue={img.caption || ''}
                      onBlur={(e) => handleCaptionChange(img.id, e.target.value)}
                      placeholder="Label..." 
                      className="w-full text-sm md:text-base text-center border-none focus:ring-0 px-0 py-1 text-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: SEO */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-600 mb-4 border-b border-gray-100 pb-3">SEO (Mesin Pencari)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-500">URL Slug</label>
              <input type="text" name="slug" defaultValue={project?.slug} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900" placeholder="Otomatis jika dikosongkan" />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Meta Title</label>
              <input type="text" name="meta_title" defaultValue={project?.meta_title || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900" />
            </div>
            
            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Meta Description</label>
              <textarea name="meta_description" defaultValue={project?.meta_description || ''} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900"></textarea>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 sticky bottom-4 z-10 bg-white/90 backdrop-blur border border-gray-200 p-3 rounded-xl shadow-lg">
          <Link href="/admin/projects" className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSaving || isProcessingPdf}
            className="px-6 py-2.5 bg-[#1E356A] text-white text-sm font-semibold rounded-lg hover:bg-[#2B4A93] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : (isProcessingPdf ? 'Memproses WebP...' : 'Simpan Properti')}
          </button>
        </div>
      </form>
    </div>
  );
}
