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
  const slug = (await params).slug;
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
  const slug = (await params).slug;

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

  return (
    <>
      <main className="bg-white min-h-screen">
        {/* ELEGANT HERO SECTION */}
        <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
          {/* Elegant Background Accents */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#1E356A]/5 blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#81A649]/10 blur-[100px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Text Content */}
              <div className="lg:col-span-5 text-left order-2 lg:order-1">
                {project.is_promo && (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#81A649]/20 to-[#81A649]/10 text-[#81A649] text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest shadow-sm ring-1 ring-[#81A649]/30">
                    <span className="animate-pulse">🔥</span> Promo Eksklusif
                  </div>
                )}
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1E356A] mb-6 tracking-tight leading-[1.1]">
                  {project.name}
                </h1>
                
                {project.location && (
                  <div className="flex items-center gap-3 text-gray-600 text-lg font-medium mb-8">
                    <div className="flex items-center justify-center w-10 h-10 bg-[#1E356A]/5 text-[#1E356A] rounded-full">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth="2"/></svg>
                    </div>
                    <span>{project.location}</span>
                  </div>
                )}

                {project.short_description && (
                  <p className="text-gray-500 text-lg leading-relaxed mb-10 font-light">
                    {project.short_description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href={projectWaLink} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#1E356A] text-white font-bold text-lg hover:bg-[#2B4A93] hover:shadow-2xl hover:shadow-[#1E356A]/20 transition-all duration-300 transform hover:-translate-y-1">
                    <svg className="w-6 h-6 text-[#81A649] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Tanya Detail & Harga
                  </a>
                </div>
              </div>

              {/* Image Content */}
              {project.cover_image && (
                <div className="lg:col-span-7 order-1 lg:order-2">
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
        <section className="bg-gray-50/50 py-20 lg:py-32 border-t border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#1E356A]/[0.02] pointer-events-none"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E356A] tracking-tight mb-4">Video Show Unit & Progress</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Tonton cuplikan langsung dari {project.name}.</p>
            </div>
            <div className="aspect-video w-full rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(30,53,106,0.15)] border-4 border-white bg-gray-900 group">
              <iframe 
                src={youtubeEmbedUrl} 
                className="w-full h-full border-0 group-hover:scale-[1.01] transition-transform duration-700 ease-out" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title={`Video ${project.name}`}
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* Modern 2-Column E-Brochure Gallery */}
      {project.project_images && project.project_images.length > 0 && (
      <section className="bg-white py-20 lg:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 lg:mb-24">
                  <h2 className="text-3xl lg:text-5xl font-extrabold text-[#1E356A] tracking-tight mb-4">Katalog Digital</h2>
                  <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Jelajahi keunggulan desain, fasilitas, dan tata ruang dari {project.name}.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  {project.project_images.map((image, index) => (
                      <div className="flex flex-col group bg-gray-50/50 rounded-[2rem] p-4 lg:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(30,53,106,0.08)] hover:bg-white hover:border-[#1E356A]/10 transition-all duration-500" key={image.id}>
                          <div className="w-full overflow-hidden rounded-[1.5rem] bg-gray-100 aspect-[3/4] relative shadow-inner">
                              <img 
                                src={image.image_path.startsWith('http') ? image.image_path : `/storage/${image.image_path}`} 
                                alt={image.caption || `${project.name} - Image ${index + 1}`}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
                              />
                          </div>
                          {image.caption && (
                              <div className="mt-6 px-4 pb-2 text-center">
                                <h3 className="text-[#1E356A] text-xl lg:text-2xl font-bold tracking-tight">
                                  {image.caption}
                                </h3>
                                <div className="w-12 h-1.5 bg-[#81A649] mx-auto mt-4 rounded-full opacity-30 group-hover:opacity-100 group-hover:w-20 transition-all duration-300"></div>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </section>
      )}

      {/* Related Projects */}
      {related.length > 0 && (
      <section className="bg-gray-50/50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
                  <div>
                      <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E356A] tracking-tight">Properti Serupa Lainnya</h2>
                      <p className="text-gray-500 mt-3 text-lg font-light">Pilihan alternatif yang mungkin Anda suka di kawasan PIK 2.</p>
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

