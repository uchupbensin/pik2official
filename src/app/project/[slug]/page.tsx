import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProjectCard from '@/components/ProjectCard';
import { Metadata } from 'next';

export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const project = await prisma.projects.findUnique({
    where: { slug }
  });

  if (!project) {
    return { title: 'Not Found' };
  }

  return {
    title: project.meta_title || `${project.name} | PIK 2 OFFICIAL`,
    description: project.meta_description || project.short_description || `Detail proyek ${project.name}`,
  };
}

export default async function ProjectDetail({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);

  const project = await prisma.projects.findUnique({
    where: { slug },
    include: {
      project_images: {
        orderBy: { sort_order: 'asc' }
      }
    }
  });

  if (!project) {
    notFound();
  }

  const related = await prisma.projects.findMany({
    where: {
      id: { not: project.id }
    },
    take: 4,
    orderBy: { id: 'desc' }
  });

  const waNumber = project.whatsapp_number ?? '6281234567890';
  let cleanWa = waNumber.replace(/\D+/g, '');
  if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.substring(1);
  }
  const projectWaLink = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent(`Halo, saya tertarik dengan ${project.name} di PIK 2. Mohon info lebih lanjut.`);

  let youtubeEmbedUrl = null;
  if (project.youtube_url) {
    try {
      let videoId = '';
      if (project.youtube_url.includes('youtu.be/')) {
        videoId = project.youtube_url.split('youtu.be/')[1]?.split('?')[0];
      } else if (project.youtube_url.includes('youtube.com/watch')) {
        videoId = new URL(project.youtube_url).searchParams.get('v') || '';
      }
      if (videoId) {
        youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (e) {
      console.error('Invalid youtube url', e);
    }
  }

  let gmapsEmbedUrl = null;
  if (project.gmaps_url) {
    if (project.gmaps_url.includes('<iframe') && project.gmaps_url.includes('src="')) {
      const match = project.gmaps_url.match(/src="([^"]+)"/);
      if (match) gmapsEmbedUrl = match[1];
    } else {
      gmapsEmbedUrl = project.gmaps_url;
    }
  }

  return (
    <>
      <main className="bg-white min-h-screen">
        {/* ELEGANT HERO SECTION */}
        <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
          {/* Subtle Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-gray-50/30">
            <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-b from-[#1E356A]/5 to-transparent blur-[120px]"></div>
            <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-t from-[#81A649]/5 to-transparent blur-[100px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
              
              {/* Text Content */}
              <div className="w-full lg:w-[45%] text-left order-2 lg:order-1">
                {project.is_promo && (
                  <div className="inline-flex items-center gap-2 bg-[#81A649]/10 text-[#81A649] text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest ring-1 ring-[#81A649]/30">
                    <span className="animate-pulse">🔥</span> Promo Eksklusif
                  </div>
                )}
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1E356A] mb-6 tracking-tight leading-[1.1]">
                  {project.name}
                </h1>
                
                {project.location && (
                  <div className="flex items-center gap-3 text-gray-600 text-lg font-medium mb-8">
                    <div className="flex items-center justify-center w-10 h-10 bg-white border border-gray-100 rounded-full shadow-sm">
                      <svg className="w-5 h-5 text-[#81A649]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth="2"/></svg>
                    </div>
                    <span>{project.location}</span>
                  </div>
                )}

                {project.short_description && (
                  <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-lg font-light">
                    {project.short_description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href={projectWaLink} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#1E356A] text-white font-semibold text-[15px] hover:bg-[#2B4A93] hover:shadow-xl hover:shadow-[#1E356A]/20 transition-all duration-300 transform hover:-translate-y-0.5">
                    <svg className="w-5 h-5 text-[#81A649] group-hover:animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Tanya Detail & Harga
                </a>
              </div>
            </div>

            {/* Image Content */}
            {project.cover_image && (
              <div className="w-full lg:w-[55%] order-1 lg:order-2">
                <div className="relative w-full aspect-[4/3] lg:aspect-[16/11] rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200/50 group">
                  <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                  <img 
                    src={project.cover_image.startsWith('http') ? project.cover_image : `/${project.cover_image}`} 
                    alt={project.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* YOUTUBE VIDEO SECTION */}
      {youtubeEmbedUrl && (
        <section className="bg-gray-50/50 py-16 lg:py-24 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 lg:mb-14">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Video Show unit & Progress</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Tonton cuplikan langsung dari {project.name}.</p>
            </div>
            <div className="aspect-video w-full rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 border border-gray-200/60 bg-gray-900">
              <iframe 
                src={youtubeEmbedUrl} 
                className="w-full h-full border-0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title={`Video ${project.name}`}
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* GOOGLE MAPS SECTION */}
      {gmapsEmbedUrl && (
        <section className="bg-white py-16 lg:py-24 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 lg:mb-14">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E356A] tracking-tight mb-4">Lokasi & Peta</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Kunjungi lokasi {project.name} secara langsung.</p>
            </div>
            <div className="aspect-video lg:aspect-[21/9] w-full rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-200/60 bg-gray-50 group">
              <iframe 
                src={gmapsEmbedUrl} 
                className="w-full h-full border-0 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Peta Lokasi ${project.name}`}
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* Minimalist E-Brochure Gallery */}
      {project.project_images && project.project_images.length > 0 && (
      <section className="bg-gray-50/50 border-t border-gray-100 py-20 lg:py-32 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 lg:mb-24">
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E356A] tracking-tight mb-4">Katalog Digital</h2>
                  <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Jelajahi keunggulan desain, fasilitas, dan tata ruang dari {project.name}.</p>
              </div>
              
              <div className="space-y-12 lg:space-y-20">
                  {project.project_images.map((image, index) => (
                      <div className="relative w-full overflow-hidden rounded-[1.5rem] lg:rounded-[2rem] shadow-xl shadow-gray-200/40 group hover:-translate-y-1 transition-transform duration-500" key={image.id}>
                          <img 
                            src={image.image_path.startsWith('http') ? image.image_path : `/storage/${image.image_path}`} 
                            alt={image.caption || `${project.name} - Image ${index + 1}`}
                            loading="lazy"
                            className="w-full h-auto block group-hover:scale-105 transition-transform duration-700 ease-out" 
                          />
                          
                          {/* Gradient Overlay ONLY at the bottom for text readability */}
                          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                          
                          {/* Caption overlaid at bottom left */}
                          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10 pointer-events-none">
                              <h3 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase drop-shadow-md">
                                {image.caption || project.name}
                              </h3>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>
      )}

      {/* Related Projects */}
      {related.length > 0 && (
      <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
                  <div>
                      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Properti Serupa Lainnya</h2>
                      <p className="text-gray-500 mt-2 text-lg font-light">Pilihan alternatif yang mungkin Anda suka di PIK 2.</p>
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {related.map((item) => (
                      <ProjectCard key={item.id} project={item} />
                  ))}
              </div>
          </div>
      </section>
      )}
      </main>
    </>
  );
}

