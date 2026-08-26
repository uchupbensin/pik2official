const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      site_name: "PIK 2 - Mega Proyek Properti Paling Bergengsi di Utara Jakarta",
      site_tagline: "Wujudkan impian Anda memiliki hunian premium, komersial strategis, dan investasi properti bernilai tinggi di kota mandiri masa depan, Pantai Indah Kapuk 2.",
    },
    create: {
      id: 1,
      site_name: "PIK 2 - Mega Proyek Properti Paling Bergengsi di Utara Jakarta",
      site_tagline: "Wujudkan impian Anda memiliki hunian premium, komersial strategis, dan investasi properti bernilai tinggi di kota mandiri masa depan, Pantai Indah Kapuk 2.",
      sales_whatsapp_number: "6281234567890",
      topbar_label: "Marketing Resmi PIK 2"
    }
  });

  await prisma.homeSettings.upsert({
    where: { id: 1 },
    update: {
      hero_title: "Kota Mandiri Masa Depan untuk Gaya Hidup Premium Anda",
      hero_description: "Jelajahi mahakarya properti terbaik di PIK 2. Dari rumah mewah pinggir pantai, apartemen eksklusif, hingga ruko komersial yang menjanjikan keuntungan bisnis tanpa batas.",
      hero_primary_cta: "Lihat Katalog Properti",
      hero_secondary_cta: "Konsultasi Gratis",
      promo_subtitle: "PENAWARAN TERBATAS",
      promo_title: "Mengapa Harus Berinvestasi di PIK 2?",
      promo_description: "Kawasan PIK 2 dirancang sebagai 'The New Jakarta City' yang dilengkapi dengan fasilitas berskala internasional, akses jalan tol langsung, serta area komersial terlengkap.",
      promo_benefits: JSON.stringify([
        "Akses Tol Langsung Interchange PIK 2",
        "Fasilitas Kota Berskala Internasional",
        "Nilai Investasi Selalu Naik Signifikan",
        "Keamanan Terpadu & Kawasan Bebas Banjir"
      ])
    },
    create: {
      id: 1,
      hero_title: "Kota Mandiri Masa Depan untuk Gaya Hidup Premium Anda",
      hero_description: "Jelajahi mahakarya properti terbaik di PIK 2. Dari rumah mewah pinggir pantai, apartemen eksklusif, hingga ruko komersial yang menjanjikan keuntungan bisnis tanpa batas.",
      hero_primary_cta: "Lihat Katalog Properti",
      hero_secondary_cta: "Konsultasi Gratis",
      promo_subtitle: "PENAWARAN TERBATAS",
      promo_title: "Mengapa Harus Berinvestasi di PIK 2?",
      promo_description: "Kawasan PIK 2 dirancang sebagai 'The New Jakarta City' yang dilengkapi dengan fasilitas berskala internasional, akses jalan tol langsung, serta area komersial terlengkap.",
      promo_benefits: JSON.stringify([
        "Akses Tol Langsung Interchange PIK 2",
        "Fasilitas Kota Berskala Internasional",
        "Nilai Investasi Selalu Naik Signifikan",
        "Keamanan Terpadu & Kawasan Bebas Banjir"
      ])
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
