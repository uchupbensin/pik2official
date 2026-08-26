import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProjectCard from '@/components/ProjectCard';
import { Metadata } from 'next';

export const revalidate = 0;

async function resolveGmapsQuery(url: string, fallbackQuery: string) {
  if (!url) return fallbackQuery;
  try {
    const res = await fetch(url, { redirect: 'follow', next: { revalidate: 86400 } });
    const finalUrl = res.url;
    
    // Extract exact pin coordinates
    const pinMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (pinMatch) {
      return `${pinMatch[1]},${pinMatch[2]}`;
    }
    
    // Extract viewport coordinates as fallback
    const viewMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (viewMatch) {
      return `${viewMatch[1]},${viewMatch[2]}`;
    }

    // Extract place name
    const placeMatch = finalUrl.match(/\/place\/([^\/]+)\//);
    if (placeMatch) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }
  } catch (e) {
    console.error("Failed to resolve gmaps url:", e);
  }
  return fallbackQuery;
}

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

  let finalMapEmbedUrl = null;
  if (project.gmaps_url) {
    if (project.gmaps_url.includes('<iframe') && project.gmaps_url.includes('src="')) {
      const match = project.gmaps_url.match(/src="([^"]+)"/);
      if (match) finalMapEmbedUrl = match[1];
    } else if (project.gmaps_url.includes('embed')) {
      finalMapEmbedUrl = project.gmaps_url;
    } else {
      const fallbackQuery = encodeURIComponent(project.location || project.name);
      const resolvedQuery = await resolveGmapsQuery(project.gmaps_url, fallbackQuery);
      finalMapEmbedUrl = `https://maps.google.com/maps?q=${resolvedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  return (
    <>
      <main className="bg-white min-h-screen">
      {/* SPLIT-SCREEN ANGLED HERO SECTION */}
      <section className="relative w-full flex flex-col lg:flex-row min-h-screen lg:min-h-[90vh] bg-white overflow-hidden">
        
        {/* Mobile Image (Visible only on mobile) */}
        <div className="w-full h-[40vh] sm:h-[50vh] lg:hidden relative z-0">
          {project.cover_image && (
            <img 
              src={project.cover_image.startsWith('http') ? project.cover_image : `/${project.cover_image}`} 
              alt={project.name}
              className="w-full h-full object-cover object-center"
            />
          )}
        </div>

        {/* Desktop Image (Absolute full bleed, visible only on desktop) */}
        <div className="hidden lg:block absolute inset-0 z-0">
          {project.cover_image && (
            <img 
              src={project.cover_image.startsWith('http') ? project.cover_image : `/${project.cover_image}`} 
              alt={project.name}
              className="w-full h-full object-cover object-right"
            />
          )}
        </div>

        {/* Text Block - Angled on Desktop, Standard on Mobile */}
        <div 
          className="relative w-full lg:w-[65%] xl:w-[60%] min-h-full z-10 bg-gradient-to-br from-white via-[#f4f9f6] to-[#e6f0eb] lg:[clip-path:polygon(0_0,100%_0,75%_100%,0_100%)] flex flex-col justify-center py-16 lg:py-24 shadow-[20px_0_50px_rgba(0,0,0,0.05)]"
        >
          {/* Content Container */}
          <div className="w-full max-w-2xl px-6 sm:px-12 lg:px-20 xl:px-24">
            
            {project.is_promo && (
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest border border-red-100 shadow-sm">
                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Promo Terbatas
              </div>
            )}
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#111827] tracking-tighter leading-[1.05] mb-6">
              {project.name}
            </h1>
            
            <div className="flex items-center gap-3 text-gray-600 text-lg font-medium mb-6">
              <svg className="w-6 h-6 text-[#81A649]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth="2"/></svg>
              <span>{project.location || "Kawasan Premium PIK 2"}</span>
            </div>

            <div className="text-gray-600 text-lg lg:text-xl leading-relaxed mb-8 font-light">
              {project.short_description ? (
                <p>{project.short_description}</p>
              ) : (
                <p>
                  Wujudkan gaya hidup modern dan investasi menjanjikan di <strong className="text-gray-900 font-semibold">{project.name}</strong>. Terletak strategis di jantung mega proyek PIK 2, kawasan ini menawarkan keseimbangan sempurna antara kenyamanan hunian eksklusif dan fasilitas kota mandiri berkelas dunia.
                </p>
              )}
            </div>

            {/* Quick Benefits - Now Dynamic! */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mb-10">
              {(project.features ? project.features.split(',') : ["Akses Tol Langsung", "Bebas Banjir", "Fasilitas Lengkap"]).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                  {feature.trim()}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <a href={projectWaLink} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#111827] hover:bg-black text-white font-bold text-[15px] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-fit">
                Tanya Penawaran Spesial
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* YOUTUBE VIDEO SECTION */}
      {youtubeEmbedUrl && (
        <section className="bg-white py-16 lg:py-24 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 lg:mb-14">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Video Show Unit & Progress</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Tonton cuplikan langsung dari {project.name}.</p>
            </div>
            <div className="aspect-video w-full rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 bg-gray-50">
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
      {project.gmaps_url && (
        <section className="bg-white py-16 lg:py-24 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 lg:mb-14">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E356A] tracking-tight mb-4">Lokasi & Peta</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Kunjungi lokasi {project.name} secara langsung.</p>
            </div>
            
            <div className="relative aspect-video lg:aspect-[21/9] w-full rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-200/60 bg-gray-50 group">
              {/* Iframe otomatis menggunakan nama lokasi atau koordinat asli */}
              <iframe 
                src={finalMapEmbedUrl!} 
                className="w-full h-full border-0 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Peta Lokasi ${project.name}`}
              ></iframe>
              
              {/* Tombol Buka di Maps overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                <a href={project.gmaps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md text-[#1E356A] px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#1E356A] hover:text-white transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth="2"/></svg>
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Minimalist E-Brochure Gallery */}
      {project.project_images && project.project_images.length > 0 && (
      <section className="bg-gray-50 border-t border-gray-100 py-20 lg:py-32 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 lg:mb-24">
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E356A] tracking-tight mb-4">Katalog Digital</h2>
                  <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Jelajahi keunggulan desain, fasilitas, dan tata ruang secara mendetail.</p>
              </div>
              
              <div className="space-y-16 lg:space-y-24">
                  {project.project_images.map((image, index) => (
                      <div className="flex flex-col items-center group" key={image.id}>
                          {/* Image Box */}
                          <div className="relative w-full overflow-hidden rounded-[1.5rem] lg:rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 bg-white">
                              <img 
                                src={image.image_path.startsWith('http') ? image.image_path : `/storage/${image.image_path}`} 
                                alt={image.caption || `${project.name} - Image ${index + 1}`}
                                loading="lazy"
                                className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-700 ease-out" 
                              />
                          </div>
                          
                          {/* Caption Below Image */}
                          <div className="mt-6 text-center max-w-3xl px-4">
                              <h3 className="text-lg md:text-xl font-bold text-gray-800 tracking-wide">
                                  {image.caption || `Spesifikasi & Denah ${project.name}`}
                              </h3>
                              <div className="w-12 h-1 bg-[#81A649] mx-auto mt-4 rounded-full opacity-60"></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>
      )}

      {/* LOCATION MAP SECTION */}
      <section className="bg-white py-16 lg:py-24 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 lg:mb-14">
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Peta Lokasi</h2>
                  <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Lokasi strategis {project.name} di kawasan terpadu PIK 2.</p>
              </div>
              <div className="aspect-[4/3] sm:aspect-video w-full rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 bg-gray-50">
                  <iframe 
                      src={project.gmaps_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126938.86877995648!2d106.6329705972656!3d-6.046897100000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6a1d82b3a987d7%3A0xc3cf9c98ba9c1e19!2sPantai%20Indah%20Kapuk%202!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"}
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Peta Lokasi ${project.name}`}
                  ></iframe>
              </div>
          </div>
      </section>

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

