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
      {/* Project Header */}
      <section className="relative bg-white pt-16 pb-12 overflow-hidden border-b border-gray-100">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#1E356A]/5 to-transparent"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {project.is_promo && (
                  <span className="inline-block bg-gradient-to-r from-[#81A649] to-[#8BC34A] text-white text-xs font-extrabold px-4 py-1.5 rounded-full mb-6 shadow-md shadow-[#81A649]/20 tracking-wider">
                      NEW LAUNCHING
                  </span>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E356A] leading-tight tracking-tight">{project.name}</h1>
              {project.location && (
                  <div className="flex items-center justify-center gap-2 text-gray-500 mt-6 font-medium text-lg">
                      <svg className="w-5 h-5 text-[#81A649]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" strokeWidth="2.5"/></svg>
                      <span>{project.location}</span>
                  </div>
              )}
              {project.short_description && (
                  <p className="mt-8 text-gray-600 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">{project.short_description}</p>
              )}
              {project.brochure_file && (
                  <div className="mt-8">
                      <a href={`/${project.brochure_file}`} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 hover:-translate-y-1 transition-all duration-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                          Unduh E-Brosur (PDF)
                      </a>
                  </div>
              )}
          </div>
      </section>

      {/* E-Brochure Scroller */}
      {project.project_images && project.project_images.length > 0 && (
      <section className="bg-gray-50 py-12 lg:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white p-2 sm:p-4 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-2 overflow-hidden">
                  {project.project_images.map((image, index) => (
                      <div className="w-full rounded-2xl overflow-hidden shadow-sm" key={image.id}>
                          <img src={image.image_path.startsWith('http') ? image.image_path : `/storage/${image.image_path}`} alt={`${project.name} - Brochure ${index + 1}`}
                               loading="lazy"
                               className="w-full h-auto block hover:scale-[1.02] transition-transform duration-700" />
                      </div>
                  ))}
              </div>
          </div>
      </section>
      )}

      {/* Project Info & CTA */}
      <section className="bg-white relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="p-8 sm:p-12 bg-gradient-to-br from-[#1E356A]/5 via-white to-gray-50 rounded-3xl border border-[#1E356A]/10 text-center shadow-lg relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#81A649] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#1E356A] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                  
                  <div className="relative z-10">
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#1E356A]">Tertarik dengan properti ini?</h3>
                      <p className="text-gray-600 mt-3 text-lg">Hubungi sales kami untuk info detail unit, ketersediaan, harga, dan negosiasi penawaran spesial.</p>
                      <a href={projectWaLink} target="_blank" rel="noopener noreferrer"
                         className="group mt-8 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#25D366] text-white text-lg font-bold hover:shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:-translate-y-1 transition-all duration-300">
                          <svg className="w-6 h-6 group-hover:animate-bounce" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Chat Sales Sekarang
                      </a>
                  </div>
              </div>
          </div>
      </section>

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
