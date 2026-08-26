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

  return (
    <>
      {/* Ultra Elegant Split Hero Section */}
      <section className="bg-[#FAFAFA] pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Text Content */}
            <div className="text-left order-2 lg:order-1">
              {project.is_promo && (
                <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest shadow-sm">
                  🔥 Promo Eksklusif
                </span>
              )}
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#111827] mb-6 tracking-tight leading-[1.1]">
                {project.name}
              </h1>
              
              {project.location && (
                <div className="flex items-center gap-3 text-gray-500 text-lg font-medium mb-8">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth="2.5"/></svg>
                  </div>
                  <span>{project.location}</span>
                </div>
              )}

              {project.short_description && (
                <p className="text-gray-600 text-lg lg:text-xl leading-relaxed mb-10 max-w-xl">
                  {project.short_description}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={projectWaLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#111827] text-white font-semibold text-lg hover:bg-[#1f2937] hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
                  <svg className="w-6 h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Tanya Harga / Unit
                </a>
              </div>
            </div>

            {/* Image Content */}
            {project.cover_image && (
              <div className="order-1 lg:order-2 relative w-full h-[350px] sm:h-[450px] lg:h-[650px] rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src={`/${project.cover_image}`} 
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Soft Background Orbs for elegance */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[500px] h-[500px] rounded-full bg-amber-50/50 blur-3xl pointer-events-none"></div>
      </section>

      {/* Elegant E-Brochure Gallery */}
      {project.project_images && project.project_images.length > 0 && (
      <section className="bg-white py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 lg:mb-24 gap-6">
                  <div className="max-w-2xl">
                      <h2 className="text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight mb-4">Katalog Digital</h2>
                      <p className="text-gray-500 text-lg">Jelajahi keunggulan desain, fasilitas, dan tata ruang dari {project.name}.</p>
                  </div>
                  <div className="hidden md:block w-24 h-1 bg-[#111827] rounded-full mb-3"></div>
              </div>
              
              <div className="space-y-16 lg:space-y-32">
                  {project.project_images.map((image, index) => (
                      <div className="flex flex-col" key={image.id}>
                          {image.caption && (
                              <div className="flex items-center gap-4 mb-6 lg:mb-8">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">{index + 1}</div>
                                <h3 className="text-2xl md:text-3xl font-bold text-[#111827]">{image.caption}</h3>
                              </div>
                          )}
                          <div className="w-full overflow-hidden rounded-2xl lg:rounded-[2rem] bg-gray-50 border border-gray-100">
                              <img 
                                src={image.image_path.startsWith('http') ? image.image_path : `/storage/${image.image_path}`} 
                                alt={image.caption || `${project.name} - Image ${index + 1}`}
                                loading="lazy"
                                className="w-full h-auto block" 
                              />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>
      )}

      {/* Related Projects */}
      {related.length > 0 && (
      <section className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="mb-10">
                  <h2 className="text-3xl font-extrabold text-[#1E356A]">Properti Serupa Lainnya</h2>
                  <p className="text-gray-500 mt-2 text-lg">Pilihan alternatif yang mungkin Anda suka di PIK 2.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {related.map((item) => (
                      <ProjectCard key={item.id} project={item} />
                  ))}
              </div>
          </div>
      </section>
      )}
    </>
  );
}
