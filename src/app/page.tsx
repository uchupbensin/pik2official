import prisma from '@/lib/prisma';
import ProjectCard from '@/components/ProjectCard';
import PromoProjectCard from '@/components/PromoProjectCard';
import { Building2, BookOpen, MessageCircle, MapPin, CheckCircle } from 'lucide-react';

export const revalidate = 0; // Or omit this for dynamic if you prefer

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function Home({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const searchQuery = (resolvedParams?.q as string) || '';

    const homeSetting = await prisma.homeSettings.findFirst();
    const siteSetting = await prisma.siteSettings.findFirst();
    
    const projects = await prisma.projects.findMany({
        where: searchQuery ? {
            OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { location: { contains: searchQuery, mode: 'insensitive' } },
                { short_description: { contains: searchQuery, mode: 'insensitive' } },
                { category: { contains: searchQuery, mode: 'insensitive' } }
            ]
        } : undefined,
        orderBy: [
            { is_promo: 'desc' },
            { id: 'desc' }
        ]
    });

    const promoProjects = projects.filter((p: any) => p.is_promo);
    const regularProjects = projects.filter((p: any) => !p.is_promo);

    const heroTitle = homeSetting?.hero_title || 'Hunian Pilihan di PIK 2';
    const heroDesc = homeSetting?.hero_description || 'Temukan rumah, ruko, gudang, apartemen, dan kavling terbaik di kawasan strategis PIK 2.';

    let waLink = '';
    if (homeSetting?.hero_secondary_cta) {
        const waNumber = siteSetting?.sales_whatsapp_number ?? '6281234567890';
        let cleanWa = waNumber.replace(/\D+/g, '');
        if (cleanWa.startsWith('0')) {
            cleanWa = '62' + cleanWa.substring(1);
        }
        const secUrl = homeSetting.hero_secondary_url;
        if (!secUrl || secUrl === '#contact') {
            waLink = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent('Halo, saya ingin konsultasi mengenai properti di PIK 2.');
        } else {
            waLink = secUrl;
        }
    }

    let embedUrl = null;
    if (homeSetting?.hero_youtube_url) {
        const match = homeSetting.hero_youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (match) {
            embedUrl = 'https://www.youtube.com/embed/' + match[1];
        }
    }

    const heroImageUrl = homeSetting?.hero_image
        ? (homeSetting.hero_image.startsWith('http') ? homeSetting.hero_image : `/storage/${homeSetting.hero_image}`)
        : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80";

    return (
        <>
            {/* ELEGANT HERO SECTION */}
            <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-white">
                {/* Subtle Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-gray-50/30">
                    <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-b from-[#1E356A]/5 to-transparent blur-[120px]"></div>
                    <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-t from-[#81A649]/5 to-transparent blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-center">
                        
                        {/* Text Content */}
                        <div className="w-full md:w-[50%] lg:w-[45%] text-left order-2 md:order-1">
                            {/* Checkmark Badge */}
                            <div className="inline-flex items-center gap-2 bg-[#81A649]/10 text-[#81A649] text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest ring-1 ring-[#81A649]/30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                PIK 2 Official
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1E356A] mb-6 tracking-tight leading-[1.1]">
                                {heroTitle}
                            </h1>

                            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-lg font-light">
                                {heroDesc}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href={homeSetting?.hero_primary_url || '#projects'} className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#1E356A] text-white font-semibold text-[15px] hover:bg-[#2B4A93] hover:shadow-xl hover:shadow-[#1E356A]/20 transition-all duration-300 transform hover:-translate-y-0.5">
                                    <svg className="w-5 h-5 text-[#81A649] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                    {homeSetting?.hero_primary_cta || 'Jelajahi Properti'}
                                </a>
                                <a href={waLink} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white border border-gray-200 shadow-sm text-[#1E356A] hover:border-[#81A649] hover:text-[#81A649] transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                    Tanya Sales
                                </a>
                            </div>
                        </div>

                        {/* Image Content */}
                        <div className="w-full md:w-[50%] lg:w-[55%] order-1 md:order-2">
                            <div className="relative w-full aspect-[4/3] md:aspect-[4/3] lg:aspect-[16/11] rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200/50 group">
                                <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                <img 
                                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80" 
                                    alt="PIK 2 Properti" 
                                    className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROMO SECTION (NEW DESIGN) */}
            {promoProjects.length > 0 && (
                <section className="bg-gray-50/50 py-20 lg:py-32 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-24">
                            <p className="text-sm font-bold text-[#81A649] tracking-widest mb-3 uppercase">
                                {homeSetting?.promo_subtitle || 'Penawaran Spesial'}
                            </p>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E356A] tracking-tight leading-tight">
                                {homeSetting?.promo_title || 'Promo Terbatas'}
                            </h2>
                            <div className="w-16 h-1 bg-[#81A649] mx-auto mt-6 rounded-full"></div>
                            <p className="mt-8 text-gray-500 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                                {homeSetting?.promo_description || 'Dapatkan berbagai keuntungan dan kemudahan pembayaran untuk unit pilihan Anda selama masa promo berlangsung.'}
                            </p>
                            <div className="mt-10 flex justify-center gap-4">
                                <a href="#projects" className="px-8 py-3.5 rounded-full bg-[#1E356A] text-white font-semibold text-[15px] hover:bg-[#2B4A93] hover:shadow-lg transition-all duration-300">
                                    Lihat Proyek
                                </a>
                                <a href={waLink} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full bg-white border border-gray-300 text-gray-700 font-semibold text-[15px] hover:bg-gray-50 hover:shadow-sm transition-all duration-300">
                                    Hubungi Sales
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {promoProjects.map((project: any) => (
                                <PromoProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* PROJECTS SECTION */}
            <section id="projects" className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E356A] tracking-tight">Katalog Properti</h2>
                            <div className="w-16 h-1 bg-[#81A649] mt-6 rounded-full"></div>
                            <p className="text-gray-500 mt-6 text-lg font-light">Pilihan hunian, komersial & investasi terbaik di kawasan elit PIK 2.</p>
                        </div>
                        
                        {/* Elegant Search Bar */}
                        <div className="w-full lg:w-96">
                            <form method="GET" action="/#projects" className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#1E356A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={searchQuery}
                                    placeholder="Cari rumah, ruko, apartemen..."
                                    className="block w-full pl-11 pr-24 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E356A]/20 focus:border-[#1E356A] focus:bg-white transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                                />
                                <button type="submit" className="absolute inset-y-1.5 right-1.5 bg-[#1E356A] text-white px-5 rounded-xl text-sm font-semibold hover:bg-[#2B4A93] transition-colors shadow-sm flex items-center justify-center">
                                    Cari
                                </button>
                            </form>
                        </div>
                    </div>

                    {searchQuery && (
                        <div className="mb-8 flex items-center justify-between bg-[#1E356A]/5 rounded-2xl p-4 border border-[#1E356A]/10">
                            <p className="text-[#1E356A] font-medium">
                                Menampilkan hasil pencarian untuk: <span className="font-bold">"{searchQuery}"</span>
                            </p>
                            <a href="/#projects" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                Hapus Filter
                            </a>
                        </div>
                    )}

                    {regularProjects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                            {regularProjects.map((project: any) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="text-gray-500 text-lg font-medium">Belum ada properti yang dipublikasikan.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
