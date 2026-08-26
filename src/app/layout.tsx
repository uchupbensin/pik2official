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
  return {
    title: siteSetting?.site_name ?? "PIK 2 OFFICIAL | Katalog Properti & Hunian Pilihan di PIK 2",
    description: siteSetting?.site_tagline ?? "Temukan pilihan properti di PIK 2, mulai dari rumah, ruko, gudang, apartemen hingga kavling.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSetting = await prisma.siteSettings.findFirst();
  const projects = await prisma.projects.findMany({
    select: { name: true, slug: true, category: true, sort_order: true },
    orderBy: { sort_order: "asc" }
  });

  const menus = [
    { label: "HOME", url: "/" },
    { label: "PROGRES PIK 2", url: "/progres" },
    { 
      label: "RUMAH", 
      url: "#", 
      children: projects.filter(p => p.category === 'rumah').map(p => ({ label: p.name, url: `/project/${p.slug}` })) 
    },
    { 
      label: "RUKO & GUDANG", 
      url: "#", 
      children: projects.filter(p => p.category === 'ruko_gudang').map(p => ({ label: p.name, url: `/project/${p.slug}` })) 
    },
    { 
      label: "APARTEMEN", 
      url: "#", 
      children: projects.filter(p => p.category === 'apartemen').map(p => ({ label: p.name, url: `/project/${p.slug}` })) 
    },
    { 
      label: "KAVLING", 
      url: "#", 
      children: projects.filter(p => p.category === 'kavling').map(p => ({ label: p.name, url: `/project/${p.slug}` })) 
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
