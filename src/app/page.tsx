import prisma from '@/lib/prisma';
import ProjectCard from '@/components/ProjectCard';
import { Building2, BookOpen, MessageCircle, MapPin, CheckCircle } from 'lucide-react';

export const revalidate = 0; // Or omit this for dynamic if you prefer

export default async function Home() {
    const homeSetting = await prisma.homeSettings.findFirst();
    const siteSetting = await prisma.siteSettings.findFirst();
    const projects = await prisma.projects.findMany({
        orderBy: [
            { is_promo: 'desc' },
            { id: 'desc' }
        ]
    });

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

    let embedUrl = homeSetting?.hero_youtube_url;
    if (embedUrl) {
        const match = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (match) {
            embedUrl = 'https://www.youtube.com/embed/' + match[1];
        }
    }

    // Parse JSON benefits safely
    let promoBenefits: string[] = [];
    try {
        if (homeSetting?.promo_benefits) {
            promoBenefits = JSON.parse(homeSetting.promo_benefits);
        }
    } catch (e) {
        console.error('Failed to parse promo_benefits', e);
    }

    return (
        <>
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-white">
                {/* Decorative Background Mesh */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#1E356A] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-12 -right-24 w-96 h-96 bg-[#81A649] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-32 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="text-center max-w-4xl mx-auto mb-12">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E356A] leading-tight tracking-tight">
                            {heroTitle}
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            {heroDesc}
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                            {homeSetting?.hero_primary_cta && (
                                <a href={homeSetting.hero_primary_url || '#projects'}
                                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#1E356A] to-[#2B4A93] text-white text-base font-bold hover:shadow-[0_10px_30px_rgba(63,64,149,0.4)] hover:-translate-y-1 transition-all duration-300">
                                    {homeSetting.hero_primary_cta}
                                </a>
                            )}
                            {homeSetting?.hero_secondary_cta && (
                                <a href={waLink} target="_blank" rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border-[2.5px] border-[#1E356A] text-[#1E356A] text-base font-bold hover:bg-gray-50 hover:shadow-lg transition-all duration-300">
                                    {homeSetting.hero_secondary_cta}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* YouTube Video */}
                    {embedUrl && (
                        <div className="max-w-5xl mx-auto relative group mt-16">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#1E356A] to-[#81A649] rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-800/50">
                                <iframe src={embedUrl}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* PROMO SECTION */}
            {(homeSetting?.promo_title || homeSetting?.promo_description || promoBenefits.length > 0) && (
                <section className="relative bg-white py-16 lg:py-24 border-t border-gray-100 overflow-hidden">
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            {homeSetting?.promo_subtitle && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#81A649]/10 text-[#81A649] font-bold text-sm tracking-[0.15em] uppercase mb-6">
                                    <span className="w-2 h-2 rounded-full bg-[#81A649] animate-pulse"></span>
                                    {homeSetting.promo_subtitle}
                                </div>
                            )}
                            {homeSetting?.promo_title && (
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-2 leading-tight text-[#1E356A]">
                                    {homeSetting.promo_title}
                                </h2>
                            )}
                            {homeSetting?.promo_description && (
                                <p className="mt-6 text-gray-500 text-lg sm:text-xl leading-relaxed">
                                    {homeSetting.promo_description}
                                </p>
                            )}
                        </div>
                        
                        {promoBenefits.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                                {promoBenefits.map((benefit, idx) => {
                                    // Map dynamic icons based on index
                                    const IconTag = [Building2, BookOpen, MessageCircle, MapPin][idx] || CheckCircle;
                                    
                                    return (
                                        <div key={idx} className="group relative bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(30,53,106,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col items-center">
                                            {/* Subtle gradient blob on hover */}
                                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#1E356A]/5 to-[#81A649]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                            
                                            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                <div className="absolute inset-0 rounded-2xl bg-[#1E356A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                <IconTag className="w-9 h-9 text-[#1E356A] drop-shadow-sm" strokeWidth={1.5} />
                                            </div>
                                            <p className="relative text-base sm:text-lg font-medium text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                                                {benefit}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* PROJECTS SECTION */}
            <section id="projects" className="bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E356A] tracking-tight">Katalog Properti</h2>
                            <p className="text-gray-500 mt-3 text-lg">Pilihan hunian, komersial & investasi terbaik di kawasan elit PIK 2.</p>
                        </div>
                    </div>

                    {projects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.map((project: any) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="text-gray-500 text-lg font-medium">Belum ada properti yang dipublikasikan.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
