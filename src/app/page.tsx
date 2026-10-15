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
    const currentPage = parseInt((resolvedParams?.page as string) || '1');
    const pageSize = 6;
    const skip = (currentPage - 1) * pageSize;

    const homeSetting = await prisma.homeSettings.findFirst();
    const siteSetting = await prisma.siteSettings.findFirst();

    // Query untuk pencarian
    const searchFilter: any = searchQuery ? {
        OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { location: { contains: searchQuery, mode: 'insensitive' } },
            { short_description: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } }
        ]
    } : {};

    // 1. Ambil Promo Projects (Tanpa Pagination)
    const promoProjects = await prisma.projects.findMany({
        where: {
            is_promo: true,
            ...searchFilter
        },
        orderBy: { id: 'desc' }
    });

    // 2. Ambil Regular Projects (Dengan Pagination)
    const regularProjects = await prisma.projects.findMany({
        where: {
            is_promo: false,
            ...searchFilter
        },
        orderBy: { id: 'desc' },
        skip: skip,
        take: pageSize
    });

    // 3. Hitung total regular projects untuk pagination
    const totalRegularProjects = await prisma.projects.count({
        where: {
            is_promo: false,
            ...searchFilter
        }
    });
    const totalPages = Math.ceil(totalRegularProjects / pageSize);

    const heroTitle = homeSetting?.hero_title || 'P I K 2';
    const heroDesc = homeSetting?.hero_description || '"PIK2 The New Jakarta City" merupakan mahakarya terbaru persembahan dari Agung Sedayu Group & Salim Group. PIK2 adalah pengembangan besar yang menghubungkan negara Indonesia dengan seluruh dunia. Berlokasi hanya kurang lebih 7 menit dari Bandara Internasional Soekarno-Hatta, bahkan lebih dekat daripada PIK1, tentunya membuat PIK2 unggul dalam hal konektivitas global, ekspansi bisnis, dan berbagai peluang investasi. Keberhasilan PIK1 memicu lahirnya jalinan kerjasama baru antara Agung Sedayu Group dan Salim Group. Kedua grup besar ini kembali menjalin kolaborasi hebatnya dalam pengembangan mahakarya PIK2. PIK2 adalah pengembangan besar-besaran yang akan mencapai sekitar 2.650 hektar. PIK2 akan menjadi pusat kekuatan ekonomi yang memiliki daya tarik yang kuat bagi peluang dan investasi yang menguntungkan dalam berbagai pengembangan properti.';

    const formatHeroImage = (path: string | null | undefined, fallback: string) => {
        if (!path) return fallback;
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
        if (path.startsWith('uploads/')) return `/api/${path}`;
        return `/api/uploads/${path}`;
    };

    const topHeroImage = formatHeroImage(homeSetting?.hero_image_top, '/pik2-landmark-hero.webp');
    const bottomHeroImage = formatHeroImage(homeSetting?.hero_image_bottom, '/pik2-menara-syariah-hero.webp');

    const waNumber = siteSetting?.sales_whatsapp_number ?? '6281234567890';
    let cleanWa = waNumber.replace(/\D+/g, '');
    if (cleanWa.startsWith('0')) {
        cleanWa = '62' + cleanWa.substring(1);
    }
    let waLink = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent('Halo, saya ingin konsultasi mengenai properti di PIK 2.');


    return (
        <>
            {/* EDITORIAL HERO SECTION (FOTO ATAS + KATA-KATA PIK2 + FOTO BAWAH) */}
            <section className="relative pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-24 overflow-hidden bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* 1. GAMBAR ATAS (LANDMARK BUNDARAN PIK 2) */}
                    <div className="w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 bg-gray-50 group">
                        <img
                            src={topHeroImage}
                            alt="PIK 2 Landmark Bundaran"
                            className="w-full h-auto max-h-[500px] md:max-h-[620px] object-cover object-center transform group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                        />
                    </div>

                    {/* 2. BAGIAN TENGAH: JUDUL BESAR & NARASI / KATA-KATA */}
                    <div className="max-w-4xl mx-auto text-center py-12 sm:py-16 md:py-20 px-2 sm:px-6">
                        {/* Judul Besar PIK2 dengan letter-spacing elegan */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1E356A] tracking-[0.25em] md:tracking-[0.35em] uppercase mb-8">
                            {heroTitle}
                        </h1>

                        {/* Paragraf Narasi Mahakarya PIK2 */}
                        <div className="text-gray-700 text-sm sm:text-base md:text-[17px] leading-relaxed sm:leading-loose font-normal text-justify sm:text-center space-y-4">
                            {heroDesc.split('\n\n').map((paragraph: string, idx: number) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>

                        {/* Tombol Pintas ke Unit Properti */}
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            <a href="#promo" className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#1E356A] text-white font-bold text-sm hover:bg-[#2B4A93] hover:shadow-xl hover:shadow-[#1E356A]/20 transition-all duration-300">
                                <span>Lihat Promo & Properti</span>
                                <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            </a>
                            <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition-all duration-300">
                                <span>Konsultasi WhatsApp</span>
                            </a>
                        </div>
                    </div>

                    {/* 3. GAMBAR BAWAH (MENARA SYARIAH / GEDUNG IKONIK) */}
                    <div className="w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 bg-gray-50 group">
                        <img
                            src={bottomHeroImage}
                            alt="PIK 2 Menara Syariah"
                            className="w-full h-auto max-h-[500px] md:max-h-[620px] object-cover object-center transform group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                        />
                    </div>

                </div>
            </section>

            {/* PROMO SECTION (NEW DESIGN) */}
            {promoProjects.length > 0 && (
                <section id="promo" aria-label="Promo Properti PIK 2" className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-32 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-24">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#81A649]/10 text-[#81A649] font-bold text-sm tracking-widest uppercase mb-6 shadow-sm border border-[#81A649]/20">
                                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Hot Promo Bulan Ini
                            </span>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E356A] tracking-tight leading-tight">
                                {homeSetting?.promo_title || 'Penawaran Eksklusif & Terbatas'}
                            </h2>
                            <div className="w-20 h-1.5 bg-[#81A649] mx-auto mt-8 rounded-full opacity-80"></div>
                            <p className="mt-8 text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                                {homeSetting?.promo_description || 'Jangan lewatkan kesempatan emas ini! Dapatkan harga perdana, kemudahan cicilan, serta diskon spesial khusus untuk unit pilihan Anda selama kuota masih tersedia.'}
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                                <a href={waLink} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#1E356A] text-white font-bold text-[15px] hover:bg-[#2B4A93] hover:shadow-xl hover:shadow-[#1E356A]/20 transition-all duration-300 hover:-translate-y-1">
                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Klaim Promo Sekarang
                                </a>
                                <a href="#projects" className="px-8 py-4 rounded-full bg-white border border-gray-200 text-gray-700 font-bold text-[15px] hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                                    Lihat Detail Unit
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
                        <div className="w-full sm:w-[400px] lg:w-[450px]">
                            <form method="GET" action="/#projects" className="group flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#1E356A]/20 focus-within:border-[#1E356A] focus-within:bg-white transition-all">
                                <div className="pl-3 pr-2 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#1E356A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={searchQuery}
                                    placeholder="Cari rumah, ruko, apartemen..."
                                    className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 py-2.5 w-full text-base"
                                />
                                <button type="submit" className="bg-[#1E356A] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2B4A93] transition-colors shadow-sm whitespace-nowrap ml-1 flex-shrink-0">
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
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                                {regularProjects.map((project: any) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-16 flex items-center justify-center gap-2">
                                    {Array.from({ length: totalPages }).map((_, i) => {
                                        const pageNumber = i + 1;
                                        const isActive = pageNumber === currentPage;
                                        return (
                                            <a
                                                key={pageNumber}
                                                href={`/?page=${pageNumber}${searchQuery ? `&q=${searchQuery}` : ''}#projects`}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                                                    isActive 
                                                        ? 'bg-[#1E356A] text-white shadow-md' 
                                                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                }`}
                                            >
                                                {pageNumber}
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </>
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
