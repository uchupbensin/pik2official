'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createProject, updateProject, deleteProjectImage, updateProjectImageCaption } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Trash2, CheckCircle2, Save, FileImage, Type, Check, Images, Upload } from 'lucide-react';
import Link from 'next/link';
import { Projects, ProjectImages } from '@prisma/client';

type ProjectWithImages = Projects & { project_images?: ProjectImages[] };

export default function ProjectForm({ project, existingCategories }: { project?: any, existingCategories?: { id: string, label: string }[] }) {
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

  // Existing saved images state
  const [existingImages, setExistingImages] = useState<any[]>(project?.project_images || []);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(project?.category || (existingCategories?.[0]?.id || 'rumah'));
  
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
    const rawFormData = new FormData(e.currentTarget);
    const newFormData = new FormData();

    // Salin semua data asli ke FormData baru
    for (const [key, value] of rawFormData.entries()) {
      // 1. Jangan ikutkan brochure_file (sudah tidak dipakai di backend)
      // 2. Jangan ikutkan File kosong (size 0) karena memicu bug "Unexpected end of form" di Next.js
      if (key === 'brochure_file') continue;

      if (value instanceof File && value.size === 0) {
        continue;
      }

      newFormData.append(key, value);
    }

    // Tambahkan file WebP hasil ekstrak
    webpFiles.forEach((file, idx) => {
      newFormData.append('images', file);
      newFormData.append('image_captions', pdfCaptions[idx] || '');
    });

    // Check if user uploaded a manual cover image
    const manualCover = newFormData.get('cover_image') as File | null;
    if ((!manualCover || manualCover.size === 0) && selectedCoverIndex !== null && webpFiles[selectedCoverIndex]) {
      // Override cover_image with the selected WebP file from PDF
      newFormData.set('cover_image', webpFiles[selectedCoverIndex]);
    }

    // Jika tidak ada cover_image sama sekali, hapus field kosong agar parser tidak error
    const finalCover = newFormData.get('cover_image') as File | null;
    if (finalCover && finalCover.size === 0) {
      newFormData.delete('cover_image');
    }

    try {
      const result = project
        ? await updateProject(project.id, newFormData)
        : await createProject(newFormData);

      if (result.success) {
        router.push('/admin/projects');
        router.refresh();
      } else {
        setError(result.error || 'Terjadi kesalahan saat menyimpan.');
        setIsSaving(false);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Terjadi kesalahan jaringan atau server.');
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
        // Optimasi: Gunakan scale 1.5 (cukup untuk web) agar ukuran WebP tidak terlalu raksasa
        // Jika scale 2.0, PDF dengan 30 halaman bisa menghasilkan 40MB data yang membuat Next.js crash
        const scale = 1.5;
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
          // Optimasi: Quality 0.7 untuk menekan ukuran file hingga 70% lebih kecil
          canvas.toBlob(resolve, 'image/webp', 0.7);
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

  function handleManualImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const newUrls = newFiles.map(f => URL.createObjectURL(f));
    const newCaptions = newFiles.map(f => f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));

    setWebpFiles(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newUrls]);
    setPdfCaptions(prev => [...prev, ...newCaptions]);

    if (selectedCoverIndex === null && (webpFiles.length === 0)) {
      setSelectedCoverIndex(0);
    }
    // Reset file input agar pengguna bisa memilih foto lagi jika diperlukan
    e.target.value = '';
  }

  function handleDeletePage(idx: number) {
    if (confirm('Yakin ingin menghapus foto/halaman ini dari daftar upload?')) {
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
    if (confirm('Yakin ingin menghapus gambar ini secara permanen?')) {
      setDeletingImageId(id);
      try {
        const res = await deleteProjectImage(id);
        if (res.success) {
          setExistingImages(prev => prev.filter(img => img.id !== id));
          router.refresh();
        } else {
          alert(res.error || 'Gagal menghapus gambar.');
        }
      } catch (err: any) {
        alert(err.message || 'Terjadi kesalahan saat menghapus gambar.');
      } finally {
        setDeletingImageId(null);
      }
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
              {!isCustomCategory ? (
                <select 
                  name="category" 
                  value={selectedCategory} 
                  onChange={(e) => {
                    if (e.target.value === 'LAINNYA_CUSTOM') {
                      setIsCustomCategory(true);
                      setSelectedCategory('');
                    } else {
                      setSelectedCategory(e.target.value);
                    }
                  }}
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none text-sm text-gray-900"
                >
                  {existingCategories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label.toUpperCase()}</option>
                  ))}
                  <option value="LAINNYA_CUSTOM" className="font-bold text-[#1E356A] bg-blue-50">+ Lainnya (Kustom...)</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="category" 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required 
                    placeholder="Ketik kategori baru (Misal: Villa Eksklusif)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none text-sm text-gray-900" 
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsCustomCategory(false);
                      setSelectedCategory(existingCategories?.[0]?.id || 'rumah');
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Nama Grup / Tahap (Opsional)</label>
              <input type="text" name="group_name" defaultValue={project?.group_name || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none text-sm text-gray-900" placeholder="Contoh: RUMAH TAHAP 3 (MILENIAL)" />
              <p className="text-xs text-gray-500 mt-1">Jika diisi, properti ini akan dikelompokkan ke dalam menu dengan nama ini.</p>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Deskripsi Singkat</label>
              <textarea name="short_description" defaultValue={project?.short_description || ''} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none text-sm text-gray-900" placeholder="Ceritakan keunggulan properti ini secara singkat..."></textarea>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Keunggulan / Checkmarks (Pisahkan dengan koma)</label>
              <textarea name="features" defaultValue={project?.features || ''} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none text-sm text-gray-900" placeholder="Akses Tol Langsung, Bebas Banjir, Fasilitas Lengkap..."></textarea>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Lokasi / Area</label>
              <input type="text" name="location" defaultValue={project?.location || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none text-sm text-gray-900" placeholder="Contoh: Pantai Indah Kapuk 2" />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-500">Nomor WhatsApp Sales (Opsional)</label>
              <input type="text" name="whatsapp_number" defaultValue={project?.whatsapp_number || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E356A]/30 focus:border-transparent outline-none font-mono text-sm text-gray-900" placeholder="62812345..." />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] transition-all"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Link Google Maps (Opsional)</label>
                <input
                  type="url"
                  name="gmaps_url"
                  defaultValue={project?.gmaps_url || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] transition-all"
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
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Images className="w-5 h-5 text-[#1E356A]" />
            Media & Brosur
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* OPSI 1: Upload PDF Brosur */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-2">1. Upload E-Brosur (PDF)</label>
              <div className="border-2 border-dashed border-gray-300 hover:border-[#1E356A] rounded-xl p-5 bg-gray-50/70 text-center relative flex-1 flex flex-col justify-center items-center transition-colors">
                <input type="file" name="brochure_file" accept="application/pdf" onChange={handlePdfChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <FileImage className="w-8 h-8 text-[#1E356A] mb-2" />
                <p className="text-sm font-bold text-[#1E356A]">Pilih File PDF</p>
                <p className="text-xs text-gray-500 mt-1">Otomatis diekstrak jadi gambar WebP</p>
              </div>

              {isProcessingPdf && (
                <div className="mt-3 text-xs text-[#1E356A] font-medium flex items-center gap-2 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Memproses PDF... ({pdfProgress}/{pdfTotal})
                </div>
              )}
            </div>

            {/* OPSI 2: Upload Foto Galeri Manual (Banyak Foto Sekaligus) */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-2">2. Upload Foto Manual (JPG / PNG)</label>
              <div className="border-2 border-dashed border-gray-300 hover:border-[#81A649] rounded-xl p-5 bg-gray-50/70 text-center relative flex-1 flex flex-col justify-center items-center transition-colors">
                <input 
                  type="file" 
                  multiple 
                  accept="image/jpeg,image/png,image/webp,image/jpg" 
                  onChange={handleManualImagesChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <Images className="w-8 h-8 text-[#81A649] mb-2" />
                <p className="text-sm font-bold text-[#81A649]">Pilih Banyak Foto</p>
                <p className="text-xs text-gray-500 mt-1">Bisa pilih 1 atau banyak foto dari HP / laptop</p>
              </div>
            </div>

            {/* OPSI 3: Gambar Cover Khusus */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-2">3. Cover Khusus (Manual)</label>
              <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-5 bg-gray-50/70 text-center relative flex-1 flex flex-col justify-center items-center transition-colors">
                <input type="file" name="cover_image" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="w-8 h-8 text-gray-500 mb-2" />
                <p className="text-sm font-bold text-gray-700">Pilih File Cover</p>
                <p className="text-xs text-gray-500 mt-1">Abaikan jika memilih cover dari foto di bawah</p>
              </div>
              {project?.cover_image && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Cover Saat Ini:</p>
                  <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img src={project.cover_image.startsWith('http') ? project.cover_image : `/api/${project.cover_image}`} alt="Current Cover" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails Foto yang Baru Dipilih / Diekstrak */}
          {!isProcessingPdf && previewUrls.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="block text-sm font-bold text-gray-800">
                  Foto Siap Disimpan ({previewUrls.length} Foto)
                </label>
                <span className="text-xs text-gray-500">
                  💡 Klik foto untuk memilih Cover Utama (centang biru). Klik 🗑️ untuk hapus.
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className={`relative flex flex-col rounded-xl border overflow-hidden transition-all shadow-sm ${selectedCoverIndex === idx ? 'border-[#1E356A] ring-2 ring-[#1E356A]/30 bg-[#1E356A]/5' : 'border-gray-200 bg-white'}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleDeletePage(idx)}
                      className="absolute top-2 left-2 z-10 p-2 bg-red-600/95 hover:bg-red-700 text-white rounded-lg shadow-md backdrop-blur-sm transition-transform active:scale-95"
                      title="Hapus Foto Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="relative aspect-[3/4] cursor-pointer" onClick={() => setSelectedCoverIndex(idx)}>
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2 px-2 text-white text-xs font-medium font-mono text-center">
                        Foto #{idx + 1}
                      </div>
                      {selectedCoverIndex === idx && (
                        <div className="absolute top-2 right-2 bg-[#1E356A] text-white rounded-full px-2.5 py-1 shadow-md flex items-center gap-1 text-[11px] font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Cover</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-100 bg-white">
                      <input
                        type="text"
                        value={pdfCaptions[idx] || ''}
                        onChange={(e) => {
                          const newCaptions = [...pdfCaptions];
                          newCaptions[idx] = e.target.value;
                          setPdfCaptions(newCaptions);
                        }}
                        placeholder={`Tulis label foto...`}
                        className="w-full text-xs text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#1E356A] focus:ring-1 focus:ring-[#1E356A] focus:bg-white px-2 py-1.5 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION: GALERI GAMBAR TERSIMPAN */}
        {existingImages && existingImages.length > 0 && (
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-700 mb-2 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Images className="w-5 h-5 text-[#1E356A]" />
              Galeri Brosur Tersimpan ({existingImages.length} Foto)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Klik ikon tong sampah merah pada foto untuk menghapus dari website. Ketik di kotak bawah untuk mengubah label/caption.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {existingImages.map((img: any) => (
                <div key={img.id} className="relative group border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-sm transition-all hover:shadow-md">
                  <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden">
                    <img
                      src={`/api/uploads/${img.image_path}`}
                      alt={img.caption || `Brochure ${img.id}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Tombol Hapus: Selalu terlihat di layar HP (opacity-100) dan hover di desktop */}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      disabled={deletingImageId === img.id}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all opacity-100 sm:opacity-90 sm:hover:opacity-100 active:scale-95 disabled:opacity-50 z-10 flex items-center justify-center cursor-pointer"
                      title="Hapus Foto Ini"
                    >
                      {deletingImageId === img.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-mono shadow-sm">
                      #{img.sort_order}
                    </div>
                  </div>

                  <div className="p-2 border-t border-gray-200 bg-white">
                    <input
                      type="text"
                      defaultValue={img.caption || ''}
                      onBlur={(e) => handleCaptionChange(img.id, e.target.value)}
                      placeholder="Tulis label..."
                      className="w-full text-xs text-center border border-transparent hover:border-gray-300 focus:border-[#1E356A] rounded px-1 py-1 text-gray-900 outline-none transition-colors"
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
