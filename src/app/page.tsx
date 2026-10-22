import prisma from '@/lib/prisma';
import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';
import PromoProjectCard from '@/components/PromoProjectCard';
import FacilitiesSlider from '@/components/FacilitiesSlider';
import { Building2, BookOpen, MessageCircle, MapPin, CheckCircle } from 'lucide-react';

export const revalidate = 0; // Or omit this for dynamic if you prefer

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function Home({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const searchQuery = (resolvedParams?.q as string) || '';
    const selectedCategory = (resolvedParams?.cat as string) || '';
    const currentPage = parseInt((resolvedParams?.page as string) || '1');
    const pageSize = 6;
    const skip = (currentPage - 1) * pageSize;

    const homeSetting = await prisma.homeSettings.findFirst();
    const siteSetting = await prisma.siteSettings.findFirst();
    const categories = await prisma.categories.findMany({
        orderBy: { sort_order: 'asc' }
    });

    // Query untuk pencarian & kategori
    const andFilters: any[] = [];
    if (searchQuery) {
        andFilters.push({
            OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { location: { contains: searchQuery, mode: 'insensitive' } },
                { short_description: { contains: searchQuery, mode: 'insensitive' } },
                { category: { contains: searchQuery, mode: 'insensitive' } }
            ]
        });
    }
    if (selectedCategory && selectedCategory !== 'all') {
        andFilters.push({ category: { equals: selectedCategory, mode: 'insensitive' } });
    }
    const searchFilter: any = andFilters.length > 0 ? { AND: andFilters } : {};

    // 1. Ambil Promo Projects (Tanpa Pagination)
    const promoProjects = await prisma.projects.findMany({
        where: {
            is_promo: true,
            ...searchFilter
        },
        include: {
            project_images: {
                orderBy: { sort_order: 'asc' }
            }
        },
        orderBy: { id: 'desc' }
    });

    // 2. Ambil Regular Projects (Dengan Pagination)
    const regularProjects = await prisma.projects.findMany({
        where: {
            is_promo: false,
            ...searchFilter
        },
        include: {
            project_images: {
                orderBy: { sort_order: 'asc' }
            }
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

    // 4. Ambil Daftar Fasilitas Kawasan
    const facilities = (prisma as any)?.facilities?.findMany
        ? await (prisma as any).facilities.findMany({
            orderBy: { sort_order: 'asc' }
        })
        : [];

    // 5. Ambil Video Progres PIK 2 (Untuk Cuplikan di Beranda)
    const latestProgress = await prisma.progress.findFirst({
        orderBy: { sort_order: 'asc' }
    });

    const getYoutubeEmbedUrl = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const id = (match && match[2].length === 11) ? match[2] : null;
        return id ? `https://www.youtube.com/embed/${id}` : null;
    };

    const progressYoutubeUrl = latestProgress?.youtube_url || 'https://youtu.be/1Q7xk2R0G6I?si=iCwzXpmpjnOIDMy_';
    const progressEmbedUrl = getYoutubeEmbedUrl(progressYoutubeUrl) || 'https://www.youtube.com/embed/1Q7xk2R0G6I';
    const progressTitle = latestProgress?.title || 'Progress Pembangunan Kawasan PIK 2';

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
            {/* EDITORIAL HERO SECTION (FOTO ATAS + KATA-KATA PIK2 + CUPLIKAN YOUTUBE PROGRES) */}
            <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-14 lg:pb-20 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* KOTAK PENCARIAN DI PALING ATAS BERANDA */}
                    <div className="max-w-2xl mx-auto mb-8 sm:mb-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#1E356A] bg-[#1E356A]/5 border border-[#1E356A]/10 mb-4">
                            <span className="w-2 h-2 rounded-full bg-[#81A649] animate-pulse"></span>
                            <span>Official Marketing Gallery • PIK 2</span>
                        </div>

                        <form method="GET" action="/#projects" className="group flex items-center bg-white border-2 border-gray-100 hover:border-[#1E356A]/30 focus-within:border-[#1E356A] rounded-full p-1.5 sm:p-2 shadow-xl shadow-gray-200/70 focus-within:ring-4 focus-within:ring-[#1E356A]/10 transition-all duration-300">
                            <div className="pl-4 pr-2 sm:pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1E356A] transition-colors">
                                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="q"
                                defaultValue={searchQuery}
                                placeholder="Cari rumah, ruko, apartemen, kavling di PIK 2..."
                                className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 py-2 sm:py-2.5 px-2 text-sm sm:text-base font-medium"
                            />
                            {searchQuery && (
                                <a
                                    href="/"
                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 mr-1 transition-colors"
                                    title="Hapus kata kunci pencarian"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </a>
                            )}
                            <button type="submit" className="bg-[#1E356A] hover:bg-[#2B4A93] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg hover:shadow-[#1E356A]/20 cursor-pointer flex-shrink-0">
                                Cari
                            </button>
                        </form>

                        {/* Tag Pencarian Populer */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3.5 text-xs text-gray-500">
                            <span className="font-semibold text-gray-400 text-[11px] uppercase tracking-wider">Populer:</span>
                            {['Rumah', 'Ruko', 'Apartemen', 'Kavling', 'Pasir Putih'].map((tag) => (
                                <a
                                    key={tag}
                                    href={`/?q=${encodeURIComponent(tag)}#projects`}
                                    className="px-2.5 py-0.5 rounded-full bg-gray-50 hover:bg-[#1E356A]/10 hover:text-[#1E356A] border border-gray-200/80 transition-colors text-[11px] font-medium"
                                >
                                    {tag}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* 1. GAMBAR ATAS (LANDMARK BUNDARAN PIK 2) */}
                    <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/60 border border-gray-100 bg-gray-50 group">
                        <img
                            src={topHeroImage}
                            alt="PIK 2 Landmark Bundaran"
                            className="w-full h-[240px] sm:h-[360px] md:h-[460px] lg:h-[520px] object-cover object-center transform group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-white mb-1.5 shadow-sm">
                                Landmark Ikonik PIK 2
                            </span>
                            <p className="text-sm sm:text-base md:text-lg font-bold drop-shadow-md text-white/95">
                                The New Jakarta City • Mahakarya Agung Sedayu Group & Salim Group
                            </p>
                        </div>
                    </div>

                    {/* 2. BAGIAN TENGAH: JUDUL BESAR & NARASI / KATA-KATA */}
                    <div className="max-w-4xl mx-auto text-center py-12 sm:py-16 md:py-20 px-2 sm:px-6">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#81A649]/10 text-[#81A649] font-bold text-xs tracking-widest uppercase mb-4 border border-[#81A649]/20 shadow-xs">
                            Mahakarya Kota Masa Depan
                        </span>

                        {/* Judul Besar PIK2 dengan letter-spacing elegan */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1E356A] tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4">
                            {heroTitle}
                        </h1>
                        <div className="w-20 h-1.5 bg-[#81A649] mx-auto mb-8 rounded-full opacity-80"></div>

                        {/* Paragraf Narasi Mahakarya PIK2 */}
                        <div className="text-gray-600 text-sm sm:text-base md:text-[17px] leading-relaxed sm:leading-loose font-normal text-center space-y-4 max-w-3xl mx-auto">
                            {heroDesc.split('\n\n').map((paragraph: string, idx: number) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>

                        {/* Highlight Chips: Ringkasan Nilai Unggulan PIK 2 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto my-8 sm:my-10">
                            <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 text-left transition-all">
                                <div className="w-10 h-10 rounded-xl bg-[#1E356A]/10 text-[#1E356A] flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5 text-[#1E356A]" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-gray-900">± 2.650 Hektar</p>
                                    <p className="text-[11px] text-gray-500">Kota Mandiri Terintegrasi</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 text-left transition-all">
                                <div className="w-10 h-10 rounded-xl bg-[#81A649]/10 text-[#81A649] flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-[#81A649]" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-gray-900">± 7 Menit Bandara</p>
                                    <p className="text-[11px] text-gray-500">Akses Tol & Soekarno-Hatta</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 text-left transition-all">
                                <div className="w-10 h-10 rounded-xl bg-[#1E356A]/10 text-[#1E356A] flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-5 h-5 text-[#1E356A]" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-gray-900">Agung Sedayu & Salim</p>
                                    <p className="text-[11px] text-gray-500">Kolaborasi Dua Developer Raksasa</p>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Pintas ke Unit Properti & WhatsApp */}
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                            <a href="#promo" className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#1E356A] text-white font-bold text-xs sm:text-sm hover:bg-[#2B4A93] hover:shadow-xl hover:shadow-[#1E356A]/20 transition-all duration-300 hover:-translate-y-0.5">
                                <span>Lihat Promo & Properti</span>
                                <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            </a>
                            <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                                <MessageCircle className="w-4 h-4" />
                                <span>Konsultasi WhatsApp</span>
                            </a>
                        </div>
                    </div>

                    {/* 3. CUPLIKAN YOUTUBE PROGRES PIK 2 (PENGGANTI GAMBAR 2) */}
                    <div className="w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/60 border border-gray-100 bg-white p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                                    Cuplikan Video Progres PIK 2
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-[#1E356A] mt-2 tracking-tight">
                                    {progressTitle}
                                </h3>
                            </div>
                            <Link
                                href="/progres"
                                className="inline-flex items-center gap-2 self-start sm:self-auto text-xs sm:text-sm font-bold text-[#1E356A] hover:text-[#81A649] px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/70 transition-all shrink-0"
                            >
                                <span>Lihat Semua Video Progres</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </Link>
                        </div>

                        {/* YouTube Video Embed Frame */}
                        <div className="relative aspect-video w-full rounded-xl md:rounded-2xl overflow-hidden bg-black shadow-lg shadow-black/10">
                            <iframe
                                src={progressEmbedUrl}
                                title={progressTitle}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>

                </div>
            </section>

            {/* KEUNGGULAN & FASILITAS KAWASAN PIK 2 (HORIZONTAL SLIDER / CAROUSEL) */}
            <FacilitiesSlider facilities={facilities} />

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
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
                        <div className="max-w-xl">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E356A] tracking-tight">Katalog Properti</h2>
                            <div className="w-16 h-1 bg-[#81A649] mt-4 rounded-full"></div>
                            <p className="text-gray-500 mt-4 text-base sm:text-lg font-light">Pilihan hunian, komersial & investasi terbaik di kawasan elit PIK 2.</p>
                        </div>

                        {/* Filter Kategori Properti Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
                            <a
                                href={`/#projects${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                                    !selectedCategory || selectedCategory === 'all'
                                        ? 'bg-[#1E356A] text-white shadow-md shadow-[#1E356A]/20'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                Semua
                            </a>
                            {categories.map((cat: any) => {
                                const isCatActive = selectedCategory === cat.id;
                                return (
                                    <a
                                        key={cat.id}
                                        href={`/?cat=${cat.id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}#projects`}
                                        className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                                            isCatActive
                                                ? 'bg-[#1E356A] text-white shadow-md shadow-[#1E356A]/20'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {cat.label}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {(searchQuery || (selectedCategory && selectedCategory !== 'all')) && (
                        <div className="mb-8 flex items-center justify-between bg-[#1E356A]/5 rounded-2xl p-4 border border-[#1E356A]/10">
                            <p className="text-[#1E356A] font-medium text-sm sm:text-base">
                                Menampilkan hasil filter: {searchQuery && <span>kata kunci <b>"{searchQuery}"</b></span>}{searchQuery && selectedCategory && selectedCategory !== 'all' ? ' dan ' : ''}{selectedCategory && selectedCategory !== 'all' && <span>kategori <b>"{categories.find((c: any) => c.id === selectedCategory)?.label || selectedCategory}"</b></span>}
                            </p>
                            <a href="/#projects" className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors bg-white px-3.5 py-1.5 rounded-lg border border-gray-200 shadow-sm shrink-0 ml-4">
                                Reset Filter
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
                                                href={`/?page=${pageNumber}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}${selectedCategory ? `&cat=${selectedCategory}` : ''}#projects`}
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
