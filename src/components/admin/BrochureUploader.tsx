'use client';

import React, { useState, useRef } from 'react';
import { uploadProjectImages, deleteProjectImage } from '@/app/admin/actions';
import { ProjectImages } from '@prisma/client';
import { Trash2, Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Setting worker path dynamically from the node_modules using unpkg or cdnjs
// Alternatively, we can use a stable known CDN version, but using the exact installed version is safer
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface BrochureUploaderProps {
  projectId: number;
  existingImages: ProjectImages[];
}

export default function BrochureUploader({ projectId, existingImages }: BrochureUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Tolong unggah file PDF!');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setTotal(0);

    try {
      // 1. Read PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotal(pdf.numPages);
      
      const extractedFiles: File[] = [];

      // 2. Extract each page
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(i);
        const page = await pdf.getPage(i);
        // Set scale for high quality WebP
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

        // Convert to WebP blob
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/webp', 0.85);
        });

        if (blob) {
          extractedFiles.push(new File([blob], `page_${i}.webp`, { type: 'image/webp' }));
        }
      }

      // 3. Upload to Server sequentially to prevent payload size limits
      for (let i = 0; i < extractedFiles.length; i++) {
        const formData = new FormData();
        formData.append('images', extractedFiles[i]);
        
        const result = await uploadProjectImages(projectId, formData);
        if (!result.success) {
          console.error(`Gagal mengunggah halaman ${i + 1}: `, result.error);
          alert(`Gagal mengunggah halaman ${i + 1}. Beberapa gambar mungkin tidak tersimpan.`);
        }
      }

    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat mengekstrak PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Yakin ingin menghapus gambar ini?')) {
      await deleteProjectImage(id);
    }
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#1E356A]" />
        E-Brochure (PDF ke WebP)
      </h3>
      <p className="text-gray-600 mb-6 text-sm">
        Unggah file brosur PDF di sini. Sistem akan otomatis mengubah setiap halaman brosur menjadi gambar WebP berkualitas tinggi dan menyimpannya ke proyek ini.
      </p>

      {/* Uploader UI */}
      <div className="mb-8">
        <input 
          type="file" 
          accept="application/pdf" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
          id="brochure-upload"
          disabled={isProcessing}
        />
        <label 
          htmlFor="brochure-upload"
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
            ${isProcessing ? 'border-gray-300 bg-gray-50' : 'border-[#1E356A]/30 bg-[#1E356A]/5 hover:bg-[#1E356A]/10'}`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-[#1E356A] animate-spin mb-3" />
              <p className="font-bold text-gray-800">Memproses PDF... ({progress}/{total})</p>
              <p className="text-xs text-gray-500 mt-1">Harap jangan tutup halaman ini.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-[#1E356A] mb-3 opacity-70" />
              <p className="font-bold text-gray-800">Klik untuk Mengunggah File PDF</p>
              <p className="text-xs text-gray-500 mt-1">Maksimal resolusi otomatis disesuaikan</p>
            </div>
          )}
        </label>
      </div>

      {/* Existing Images */}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Gambar Brosur yang Tersimpan ({existingImages.length})
        </h4>
        
        {existingImages.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
            Belum ada gambar brosur.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-[3/4] bg-gray-100">
                <img 
                  src={img.image_path.startsWith('http') ? img.image_path : `/storage/${img.image_path}`} 
                  alt={`Brochure ${img.id}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDelete(img.id)}
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
    </div>
  );
}
