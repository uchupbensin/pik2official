import { prisma } from './src/lib/prisma';

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      site_name: "PIK 2 OFFICIAL",
      site_tagline: "Katalog Properti & Hunian Pilihan di PIK 2",
    },
    create: {
      id: 1,
      site_name: "PIK 2 OFFICIAL",
      site_tagline: "Katalog Properti & Hunian Pilihan di PIK 2",
      sales_whatsapp_number: "6281234567890",
      topbar_label: "Sales Property"
    }
  });

  await prisma.homeSettings.upsert({
    where: { id: 1 },
    update: {
      hero_title: "Hunian Pilihan di PIK 2",
      hero_description: "Temukan rumah, ruko, gudang, apartemen, dan kavling terbaik di kawasan strategis PIK 2.",
      hero_primary_cta: "Lihat Katalog",
      hero_secondary_cta: "Hubungi Kami",
      promo_subtitle: "",
      promo_title: "",
      promo_description: "",
      promo_benefits: "[]"
    },
    create: {
      id: 1,
      hero_title: "Hunian Pilihan di PIK 2",
      hero_description: "Temukan rumah, ruko, gudang, apartemen, dan kavling terbaik di kawasan strategis PIK 2.",
      hero_primary_cta: "Lihat Katalog",
      hero_secondary_cta: "Hubungi Kami",
      promo_subtitle: "",
      promo_title: "",
      promo_description: "",
      promo_benefits: "[]"
    }
  });
}

main().catch(console.error);
