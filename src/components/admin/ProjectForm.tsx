'use client';

import React, { useState, useRef } from 'react';
import { createProject, updateProject, deleteProjectImage } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
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
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    // Append generated WebP files
    webpFiles.forEach(file => {
      formData.append('images', file);
    });
    const result = project 
      ? await updateProject(project.id, formData)
      : await createProject(formData);

    let isSuccess = result.success;

    if (isSuccess) {
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
      return;
    }
    
    if (file.type !== 'application/pdf') {
      // It's still fine if they want to upload a raw PDF for download without conversion, 
      // but if we want conversion it must be PDF.
      return;
    }

    setIsProcessingPdf(true);
    setPdfProgress(0);
    setPdfTotal(0);
    setWebpFiles([]); // reset

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat mengekstrak PDF: ' + err.message);
    } finally {
      setIsProcessingPdf(false);
    }
  }

  async function handleDeleteImage(id: number) {
    if (confirm('Yakin ingin menghapus gambar ini?')) {
      await deleteProjectImage(id);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1E356A] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Properti
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">{project ? 'Edit Properti' : 'Tambah Properti Baru'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Properti <span className="text-red-500">*</span></label>
                <input type="text" name="name" defaultValue={project?.name} required className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" placeholder="Contoh: Tokyo Riverside" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL (Biarkan kosong untuk generate otomatis)</label>
                <input type="text" name="slug" defaultValue={project?.slug} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" placeholder="contoh: tokyo-riverside" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
              <textarea name="short_description" defaultValue={project?.short_description || ''} rows={3} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input type="text" name="location" defaultValue={project?.location || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" placeholder="Contoh: PIK 2, Jakarta Utara" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp Khusus (Opsional)</label>
                <input type="text" name="whatsapp_number" defaultValue={project?.whatsapp_number || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" placeholder="62812345..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Cover (Upload)</label>
                <input type="file" name="cover_image" accept="image/*" className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1E356A]/10 file:text-[#1E356A] hover:file:bg-[#1E356A]/20" />
                {project?.cover_image && <p className="text-xs text-gray-500 mt-2">Biarkan kosong jika tidak ingin mengubah cover.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File E-Brosur (PDF)</label>
                <input type="file" name="brochure_file" accept="application/pdf" onChange={handlePdfChange} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200" />
                {project?.brochure_file && <p className="text-xs text-gray-500 mt-2">File saat ini: <a href={`/${project.brochure_file}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Lihat PDF</a></p>}
                
                {isProcessingPdf && (
                  <div className="mt-4 flex items-center gap-2 text-[#1E356A]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Memproses PDF... ({pdfProgress}/{pdfTotal})</span>
                  </div>
                )}
                {!isProcessingPdf && webpFiles.length > 0 && (
                  <div className="mt-4 text-green-600 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Berhasil mengekstrak {webpFiles.length} halaman dari PDF (Siap diunggah).
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 items-center md:col-span-2">
              <input type="checkbox" name="is_promo" defaultChecked={project?.is_promo} id="is_promo" className="w-5 h-5 rounded text-[#1E356A] focus:ring-[#1E356A]" />
              <label htmlFor="is_promo" className="text-sm font-medium text-gray-800 cursor-pointer">
                Tandai sebagai Properti Promo (Akan muncul di halaman utama bagian Promo)
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#1E356A] mb-4 border-b pb-2">Pengaturan SEO</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input type="text" name="meta_title" defaultValue={project?.meta_title || ''} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea name="meta_description" defaultValue={project?.meta_description || ''} rows={2} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]"></textarea>
            </div>
          </div>
        </div>

        {project?.project_images && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#1E356A] mb-4 border-b pb-2">Gambar Brosur (Tersimpan)</h3>
            {project.project_images.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada halaman brosur yang tersimpan.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {project.project_images.map((img) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-[3/4] bg-gray-100">
                    <img 
                      src={`/storage/${img.image_path}`} 
                      alt={`Brochure ${img.id}`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all"
                        title="Hapus Gambar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-mono">
                      #{img.sort_order}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/admin/projects" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSaving || isProcessingPdf}
            className="px-8 py-3 bg-[#1E356A] text-white rounded-xl font-bold hover:bg-[#14244B] transition-colors disabled:opacity-70"
          >
            {isSaving ? 'Menyimpan...' : (isProcessingPdf ? 'Memproses PDF...' : 'Simpan Properti')}
          </button>
        </div>
      </form>
    </div>
  );
}
