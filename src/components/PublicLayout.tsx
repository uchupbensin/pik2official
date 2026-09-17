'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsappButton from '@/components/WhatsappButton';
import { SiteSettings } from '@prisma/client';

type MenuItem = {
  label: string;
  url: string;
  children?: MenuItem[];
};

export default function PublicLayout({
  siteSetting,
  menus,
  waLink,
  children,
}: {
  siteSetting: SiteSettings | null;
  menus: MenuItem[];
  waLink: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar siteSetting={siteSetting} menus={menus} />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer siteSetting={siteSetting} menus={menus} />}
      {!isAdmin && <WhatsappButton link={waLink} />}
    </>
  );
}
