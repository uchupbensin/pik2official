import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappButton from "@/components/WhatsappButton";
import prisma from "@/lib/prisma";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export async function generateMetadata(): Promise<Metadata> {
  const siteSetting = await prisma.siteSettings.findFirst();
  const siteName = siteSetting?.site_name ?? "PIK 2 OFFICIAL";
  const tagline = siteSetting?.site_tagline ?? "Kawasan Residensial & Komersial Elite di Jakarta Utara";
  const desc = "Website Marketing Resmi PIK 2. Dapatkan penawaran eksklusif, harga terbaik, dan informasi lengkap mengenai rumah, apartemen, ruko, hingga kavling komersial di kawasan elit PIK 2.";

  return {
    title: {
      default: `${siteName} | ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: desc,
    keywords: ["PIK 2", "Properti PIK 2", "Pantai Indah Kapuk 2", "Rumah PIK 2", "Ruko PIK 2", "Apartemen PIK 2", "Kavling PIK 2", "Investasi Properti", "Jual Beli Properti"],
    authors: [{ name: "Sales Resmi PIK 2" }],
    creator: "PIK 2 Official",
    publisher: "PIK 2 Official",
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
      type: "website",
      locale: "id_ID",
      url: "https://pik2official.com",
      title: `${siteName} - ${tagline}`,
      description: desc,
      siteName: siteName,
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "PIK 2 Official Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} - ${tagline}`,
      description: desc,
      images: ["/logo.png"],
    },
    alternates: {
      canonical: "https://pik2official.com",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSetting = await prisma.siteSettings.findFirst();
  const projects = await prisma.projects.findMany({
    select: { name: true, slug: true, category: true, group_name: true, sort_order: true },
    orderBy: { sort_order: "asc" }
  });

  function buildMenuChildren(category: string) {
    const categoryProjects = projects.filter(p => p.category === category);
    const groups = Array.from(new Set(categoryProjects.map(p => p.group_name).filter(Boolean)));
    
    const children: any[] = [];
    
    // 1. Add grouped projects
    groups.forEach(group => {
      const groupedProjects = categoryProjects.filter(p => p.group_name === group);
      children.push({
        label: group as string,
        url: "#",
        children: groupedProjects.map(p => ({ label: p.name, url: `/project/${p.slug}` }))
      });
    });
    
    // 2. Add ungrouped projects directly
    const ungroupedProjects = categoryProjects.filter(p => !p.group_name);
    ungroupedProjects.forEach(p => {
      children.push({ label: p.name, url: `/project/${p.slug}` });
    });
    
    return children.length > 0 ? children : undefined;
  }

  const menus = [
    { label: "HOME", url: "/" },
    { label: "PROGRES PIK 2", url: "/progres" },
    { 
      label: "RUMAH", 
      url: "#", 
      children: buildMenuChildren('rumah')
    },
    { 
      label: "RUKO & GUDANG", 
      url: "#", 
      children: buildMenuChildren('ruko_gudang')
    },
    { 
      label: "APARTEMEN", 
      url: "#", 
      children: buildMenuChildren('apartemen')
    },
    { 
      label: "KAVLING", 
      url: "#", 
      children: buildMenuChildren('kavling')
    }
  ];

  const waNumber = siteSetting?.sales_whatsapp_number ?? '6281234567890';
  let cleanWa = waNumber.replace(/\D+/g, '');
  if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.substring(1);
  }
  const waLink = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent('Halo, saya ingin bertanya mengenai properti di PIK 2.');

  return (
    <html lang="id" className={`${plusJakarta.variable} font-sans`}>
      <body className="bg-white text-gray-800 antialiased min-h-screen flex flex-col">
        <Navbar siteSetting={siteSetting} menus={menus} />
        <main className="flex-1">
          {children}
        </main>
        <Footer siteSetting={siteSetting} menus={menus} />
        <WhatsappButton link={waLink} />
      </body>
    </html>
  );
}
