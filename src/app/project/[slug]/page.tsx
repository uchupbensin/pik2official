import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProjectCard from '@/components/ProjectCard';
import { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site-url';

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
    where: { slug },
    include: {
      project_images: {
        orderBy: { sort_order: 'asc' },
        take: 5
      }
    }
  });

  if (!project) {
    return { title: 'Not Found' };
  }

  const siteUrl = getSiteUrl();
  
  const images: string[] = [];
  if (project.cover_image) {
    images.push(project.cover_image.startsWith('http') ? project.cover_image : `${siteUrl}${project.cover_image.startsWith('/') ? '' : '/'}${project.cover_image}`);
  }
  if (project.project_images && project.project_images.length > 0) {
    project.project_images.forEach((img: any) => {
      if (img.image_path) {
        const fullUrl = img.image_path.startsWith('http') 
          ? img.image_path 
          : `${siteUrl}${img.image_path.startsWith('/') ? '' : '/api/uploads/'}${img.image_path}`;
        if (!images.includes(fullUrl)) images.push(fullUrl);
      }
    });
  }

  const title = project.meta_title || `${project.name} | PIK 2 OFFICIAL`;
  const description = project.meta_description || project.short_description || `Detail spesifikasi, tipe unit, denah, dan promo harga ${project.name} di kawasan mandiri PIK 2. Hubungi marketing resmi.`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/project/${slug}`,
      siteName: 'PIK 2 OFFICIAL',
      locale: 'id_ID',
      type: 'article',
      images: images.map(url => ({
        url,
        width: 1200,
        height: 675,
        alt: `${project.name} - PIK 2`,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length > 0 ? [images[0]] : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/project/${slug}`,
    },
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
  }) as any;

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

  let finalMapEmbedUrl = '';
  const isSearchShare = project.gmaps_url && (project.gmaps_url.includes('share.google') || project.gmaps_url.includes('google.com/search'));
  const isEmbedCode = project.gmaps_url && (project.gmaps_url.includes('<iframe') || project.gmaps_url.includes('google.com/maps/embed'));

  // URL yang dibuka saat pengunjung klik tombol "Buka di Google Maps"
  const directMapsUrl = (project.gmaps_url?.startsWith('http') && !isSearchShare)
    ? project.gmaps_url 
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((project.location || project.name) + ' PIK')}`;

  if (isEmbedCode) {
    // 1. Jika dimasukkan kode embed resmi Google Maps
    if (project.gmaps_url.includes('src="')) {
      const match = project.gmaps_url.match(/src="([^"]+)"/);
      finalMapEmbedUrl = match ? match[1] : project.gmaps_url;
    } else {
      finalMapEmbedUrl = project.gmaps_url;
    }
  } else if (project.gmaps_url && !isSearchShare) {
    // 2. Jika dimasukkan link Google Maps biasa (maps.app.goo.gl / link browser)
    const fallbackCoords = '-6.046897,106.68297';
    const resolved = await resolveGmapsQuery(project.gmaps_url, fallbackCoords);
    if (resolved && resolved.includes(',')) {
      const [lat, lng] = resolved.split(',');
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        finalMapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(lngNum - 0.02).toFixed(5)}%2C${(latNum - 0.015).toFixed(5)}%2C${(lngNum + 0.02).toFixed(5)}%2C${(latNum + 0.015).toFixed(5)}&layer=mapnik&marker=${latNum}%2C${lngNum}`;
      } else {
        finalMapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=106.65%2C-6.08%2C106.75%2C-6.02&layer=mapnik&marker=-6.046897%2C106.68297`;
      }
    } else {
      finalMapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=106.65%2C-6.08%2C106.75%2C-6.02&layer=mapnik&marker=-6.046897%2C106.68297`;
    }
  } else {
    // 3. Fallback peta kawasan PIK / Golf Island jika link share google atau kosong
    const isGolfIsland = (project.name || '').toLowerCase().includes('orchestra') || (project.location || '').toLowerCase().includes('golf island');
    const defaultLat = isGolfIsland ? -6.109867 : -6.046897;
    const defaultLng = isGolfIsland ? 106.739221 : 106.68297;
    finalMapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(defaultLng - 0.02).toFixed(5)}%2C${(defaultLat - 0.015).toFixed(5)}%2C${(defaultLng + 0.02).toFixed(5)}%2C${(defaultLat + 0.015).toFixed(5)}&layer=mapnik&marker=${defaultLat}%2C${defaultLng}`;
  }

  const siteUrl = getSiteUrl();
  const schemaImages: string[] = [];
  if (project.cover_image) {
    schemaImages.push(project.cover_image.startsWith('http') ? project.cover_image : `${siteUrl}${project.cover_image.startsWith('/') ? '' : '/'}${project.cover_image}`);
  }
  if (project.project_images && project.project_images.length > 0) {
    project.project_images.forEach((img: any) => {
      if (img.image_path) {
        const fullUrl = img.image_path.startsWith('http') 
          ? img.image_path 
          : `${siteUrl}${img.image_path.startsWith('/') ? '' : '/api/uploads/'}${img.image_path}`;
        if (!schemaImages.includes(fullUrl)) schemaImages.push(fullUrl);
      }
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${project.name} PIK 2`,
    "description": project.short_description || `Properti pilihan di kawasan terpadu PIK 2: ${project.name}`,
    "image": schemaImages,
    "brand": {
      "@type": "Brand",
      "name": "Agung Sedayu Group & Salim Group"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "IDR",
      "price": project.price ? project.price.replace(/\D+/g, '') || "0" : "0",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "url": `${siteUrl}/project/${project.slug}`
    }
  };

  return (
    <>
      <main className="bg-white min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      {/* HERO SHOWCASE SECTION (100% UTUH DI MOBILE & DESKTOP) */}
      <section className="relative w-full bg-gradient-to-b from-[#f8fafc] via-white to-gray-50/40 pt-28 sm:pt-32 lg:pt-36 pb-14 lg:pb-20 border-b border-gray-100 overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1E356A]/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#81A649]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* KOLOM KIRI: Informasi & Spesifikasi Properti */}
            <div className="lg:col-span-7 flex flex-col order-2 lg:order-1 pt-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {project.category && (
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#1E356A]/10 text-[#1E356A] uppercase tracking-wider">
                    {project.category}
                  </span>
                )}
                {project.is_promo && (
                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-red-100 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    Hot Promo 🔥
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  PIK 2 Official
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight leading-[1.15] mb-3 capitalize">
                {project.name}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base font-medium mb-5">
                <svg className="w-4 h-4 text-[#81A649] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth="2"/></svg>
                <span>{project.location || "Kawasan Premium PIK 2, Jakarta Utara"}</span>
              </div>

              {/* Description */}
              <div className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                {project.short_description ? (
                  <p>{project.short_description}</p>
                ) : (
                  <p>
                    Wujudkan gaya hidup modern dan investasi menjanjikan di <strong className="text-gray-900 font-semibold">{project.name}</strong>. Terletak strategis di jantung mega proyek PIK 2, kawasan ini menawarkan kenyamanan hunian eksklusif dan fasilitas kota mandiri berkelas dunia.
                  </p>
                )}
              </div>

              {/* Quick Benefits / Features */}
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2.5">Keunggulan Utama</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(project?.features ? project.features.split(',') : ["Akses Tol Langsung", "Bebas Banjir", "Fasilitas Lengkap"]).map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200/80 p-2.5 rounded-xl shadow-xs">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold shrink-0">✓</div>
                      <span className="truncate">{feature?.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center pt-2">
                <a href={projectWaLink} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm sm:text-base shadow-lg shadow-green-600/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.056-1.135-.084-.28-.09-.643-.222-1.076-.407-1.85-.794-3.045-2.673-3.138-2.798-.093-.125-.75-1.002-.75-1.911 0-.909.47-1.356.637-1.541.167-.185.364-.232.486-.232.122 0 .243.002.349.007.112.006.262-.043.41.312.153.366.52 1.272.565 1.365.045.093.076.202.015.324-.061.123-.092.198-.183.305-.091.107-.193.24-.275.323-.092.093-.188.194-.081.378.107.184.475.783 1.021 1.27.702.626 1.294.82 1.478.913.184.093.292.081.4-.044.108-.124.464-.54.588-.725.123-.185.247-.154.415-.092.167.062 1.062.5 1.246.593.185.093.308.139.354.216.046.077.046.448-.098.853z"/></svg>
                  <span>Chat WhatsApp Sales</span>
                </a>
                {project.project_images && project.project_images.length > 0 && (
                  <a href="#katalog" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm sm:text-base hover:bg-gray-50 transition-colors">
                    Lihat Denah & Brosur ↓
                  </a>
                )}
              </div>
            </div>

            {/* KOLOM KANAN: Foto / Flyer Cover Utama (Showcase Frame Rapi) */}
            <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
              {project?.cover_image ? (
                <div className="w-full max-w-md lg:max-w-none">
                  {/* Outer Frame with clean studio finish */}
                  <div className="relative rounded-2xl lg:rounded-3xl p-2.5 sm:p-3 bg-gradient-to-b from-gray-100 to-gray-200/70 border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.07)]">
                    {/* Inner Picture Container */}
                    <div className="relative rounded-xl lg:rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                      {/* Blur background */}
                      <img 
                        src={project.cover_image?.startsWith('http') ? project.cover_image : `/api/${project.cover_image}`}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-125 pointer-events-none"
                      />
                      {/* Main Cover Image - 100% Utuh dan Terbingkai Rapi */}
                      <img 
                        src={project.cover_image?.startsWith('http') ? project.cover_image : `/api/${project.cover_image}`} 
                        alt={project.name}
                        className="relative z-10 w-full h-auto max-h-[65vh] lg:max-h-[70vh] object-contain block mx-auto"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                  Foto cover belum tersedia
                </div>
              )}
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



      {/* Minimalist E-Brochure Gallery */}
      {project.project_images && project.project_images.length > 0 && (
      <section id="katalog" className="bg-gray-50 border-t border-gray-100 py-20 lg:py-32 overflow-hidden scroll-mt-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 lg:mb-24">
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E356A] tracking-tight mb-4">Katalog Digital</h2>
                  <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Jelajahi keunggulan desain, fasilitas, dan tata ruang secara mendetail.</p>
              </div>
              
              <div className="space-y-16 lg:space-y-24">
                  {project.project_images.map((image: any, index: number) => (
                      <div className="flex flex-col items-center group" key={image.id}>
                          {/* Image Box */}
                          <div className="relative w-full overflow-hidden rounded-[1.5rem] lg:rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 bg-white">
                              <img 
                                src={image?.image_path?.startsWith('http') ? image.image_path : `/api/uploads/${image?.image_path}`} 
                                alt={image?.caption || `${project.name} - Image ${index + 1}`}
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
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E356A] tracking-tight mb-4">Peta Lokasi</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">Lokasi strategis {project.name} di kawasan terpadu PIK 2.</p>
          </div>
          
          <div className="relative aspect-video lg:aspect-[21/9] w-full rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-200/60 bg-gray-50 group">
            <iframe 
              src={finalMapEmbedUrl} 
              className="w-full h-full border-0 grayscale-[15%] group-hover:grayscale-0 transition-all duration-700" 
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Peta Lokasi ${project.name}`}
            ></iframe>
            
            {/* Tombol Buka di Maps overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
              <a href={directMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md text-[#1E356A] px-6 py-3 rounded-full font-bold shadow-xl border border-gray-100 hover:bg-[#1E356A] hover:text-white transition-all duration-300 hover:scale-105 whitespace-nowrap">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span>Buka di Google Maps ↗</span>
              </a>
            </div>
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

