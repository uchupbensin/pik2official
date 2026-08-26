'use client';

import React, { useState } from 'react';
import { createProject, updateProject, uploadProjectImages } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Projects } from '@prisma/client';

export default function ProjectForm({ project }: { project?: Projects }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfTotal, setPdfTotal] = useState(0);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const pdfFile = formData.get('brochure_pdf') as File | null;
    
    // Hapus brosur dari formData yang dikirim ke server action createProject 
    // karena ukurannya bisa sangat besar (>10MB) dan bikin error, 
    // padahal createProject tidak butuh PDF ini.
    formData.delete('brochure_pdf');

    let newProjectId: number | null = null;
    let isSuccess = false;

    if (project) {
      const result = await updateProject(project.id, formData);
      isSuccess = result.success;
      if (!isSuccess) setError(result.error || 'Terjadi kesalahan saat menyimpan.');
    } else {
      const result = await createProject(formData);
      isSuccess = result.success;
      if (isSuccess && result.projectId) {
        newProjectId = result.projectId;
      } else if (!isSuccess) {
        setError(result.error || 'Terjadi kesalahan saat menyimpan.');
      }
    }

    if (isSuccess && newProjectId) {
      if (pdfFile && pdfFile.size > 0 && pdfFile.type === 'application/pdf') {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

          const arrayBuffer = await pdfFile.arrayBuffer();
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

            const renderContext: any = { canvasContext: context!, viewport: viewport };
            await page.render(renderContext).promise;

            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, 'image/webp', 0.85);
            });

            if (blob) {
              extractedFiles.push(new File([blob], `page_${i}.webp`, { type: 'image/webp' }));
            }
          }

          for (let i = 0; i < extractedFiles.length; i++) {
            const uploadData = new FormData();
            uploadData.append('images', extractedFiles[i]);
            await uploadProjectImages(newProjectId, uploadData);
          }
        } catch (err: any) {
          console.error(err);
          alert('Properti berhasil dibuat, tetapi gagal memproses brosur PDF: ' + err.message);
        }
      }
    }

    if (isSuccess) {
      router.push('/admin/projects');
      router.refresh();
    } else {
      setIsSaving(false);
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Properti <span className="text-red-500">*</span></label>
                <select name="category" defaultValue={project?.category || 'rumah'} required className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]">
                  <option value="rumah">RUMAH</option>
                  <option value="ruko_gudang">RUKO & GUDANG</option>
                  <option value="apartemen">APARTEMEN</option>
                  <option value="kavling">KAVLING</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL (Biarkan kosong untuk generate otomatis)</label>
              <input type="text" name="slug" defaultValue={project?.slug} className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649]" placeholder="contoh: tokyo-riverside" />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Cover (Upload)</label>
              <input type="file" name="cover_image" accept="image/*" className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1E356A]/10 file:text-[#1E356A] hover:file:bg-[#1E356A]/20" />
              {project?.cover_image && <p className="text-xs text-gray-500 mt-2">Biarkan kosong jika tidak ingin mengubah cover.</p>}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 items-center md:col-span-2">
              <input type="checkbox" name="is_promo" defaultChecked={project?.is_promo} id="is_promo" className="w-5 h-5 rounded text-[#1E356A] focus:ring-[#1E356A]" />
              <label htmlFor="is_promo" className="text-sm font-medium text-gray-800 cursor-pointer">
                Tandai sebagai Properti Promo (Akan muncul di halaman utama bagian Promo)
              </label>
            </div>

            {!project && (
              <div className="md:col-span-2 p-5 bg-gray-50 border border-gray-200 rounded-xl mt-2">
                <label className="block text-sm font-bold text-gray-800 mb-2">Upload E-Brochure (PDF) - <span className="font-normal text-gray-500">Opsional</span></label>
                <input type="file" name="brochure_pdf" accept="application/pdf" className="w-full px-4 py-2 border rounded-xl bg-white text-gray-900 focus:ring-[#81A649] focus:border-[#81A649] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1E356A]/10 file:text-[#1E356A] hover:file:bg-[#1E356A]/20" />
                <p className="text-xs text-gray-500 mt-2">Brosur PDF akan otomatis diekstrak menjadi gambar saat proyek disimpan.</p>
              </div>
            )}
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

        <div className="flex justify-end gap-4">
          <Link href="/admin/projects" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-[#1E356A] text-white rounded-xl font-bold hover:bg-[#14244B] transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? (pdfTotal > 0 ? `Memproses PDF (${pdfProgress}/${pdfTotal})...` : 'Menyimpan...') : 'Simpan Properti'}
          </button>
        </div>
      </form>
    </div>
  );
}
