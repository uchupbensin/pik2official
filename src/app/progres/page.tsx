import React from 'react';
import { prisma } from '@/lib/prisma';
import { PlayCircle } from 'lucide-react';

export const metadata = {
  title: 'Progres PIK 2 - PIK 2 OFFICIAL',
};

function getYoutubeEmbedUrl(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const id = (match && match[2].length === 11) ? match[2] : null;
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export default async function ProgresPage() {
  const progressVideos = await prisma.progress.findMany({
    orderBy: { sort_order: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E356A] tracking-tight mb-6">
            Pantau Progres <span className="text-[#81A649]">PIK 2</span>
          </h1>
          <p className="text-lg text-gray-600">
            Ikuti perkembangan terbaru pembangunan kawasan PIK 2 melalui cuplikan video progres langsung dari lokasi.
          </p>
        </div>

        {/* Video Grid */}
        {progressVideos.length === 1 && (
          <div className="grid grid-cols-1 max-w-3xl mx-auto gap-8">
            {progressVideos.map((video) => {
              const embedUrl = getYoutubeEmbedUrl(video.youtube_url);
              if (!embedUrl) return null;
              return (
                <div key={video.id} className="w-full bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <div className="aspect-video w-full bg-gray-100 relative">
                    <iframe src={embedUrl} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-0"></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium text-gray-500">{new Date(video.created_at || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><PlayCircle className="w-5 h-5" /></a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {progressVideos.length === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-8">
            {progressVideos.map((video) => {
              const embedUrl = getYoutubeEmbedUrl(video.youtube_url);
              if (!embedUrl) return null;
              return (
                <div key={video.id} className="w-full bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <div className="aspect-video w-full bg-gray-100 relative">
                    <iframe src={embedUrl} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-0"></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium text-gray-500">{new Date(video.created_at || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><PlayCircle className="w-5 h-5" /></a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {progressVideos.length > 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {progressVideos.map((video) => {
              const embedUrl = getYoutubeEmbedUrl(video.youtube_url);
              if (!embedUrl) return null;
              return (
                <div key={video.id} className="w-full bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <div className="aspect-video w-full bg-gray-100 relative">
                    <iframe src={embedUrl} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full border-0"></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium text-gray-500">{new Date(video.created_at || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><PlayCircle className="w-5 h-5" /></a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {progressVideos.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <PlayCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Video</h3>
            <p className="text-gray-500">Video progres pembangunan PIK 2 akan segera hadir di sini.</p>
          </div>
        )}

      </div>
    </div>
  );
}
