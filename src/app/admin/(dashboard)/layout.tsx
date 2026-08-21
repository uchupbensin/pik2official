import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  MenuSquare, 
  LogOut,
  Globe
} from 'lucide-react';
import { logout } from '@/app/admin/actions';

export const metadata = {
  title: 'Admin Dashboard - PIK 2 Property',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E356A] text-white flex-shrink-0 hidden md:flex md:flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 bg-[#14244B] border-b border-white/10">
          <img src="/logo.svg" alt="PIK 2" className="h-8 w-auto brightness-0 invert" />
          <span className="ml-3 font-bold text-lg tracking-tight">Admin Panel</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/admin/projects" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium">
            <Building2 className="w-5 h-5" />
            Properti
          </Link>
          <Link href="/admin/menus" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium">
            <MenuSquare className="w-5 h-5" />
            Menu Navigasi
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium">
            <Settings className="w-5 h-5" />
            Pengaturan Web
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-[#81A649] transition-all font-medium">
            <Globe className="w-5 h-5" />
            Lihat Website
          </a>
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-xl transition-all font-medium">
              <LogOut className="w-5 h-5" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sm:px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-800">Manajemen Konten</h1>
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 rounded-full bg-[#81A649] text-white flex items-center justify-center font-bold text-sm">A</div>
             <span className="text-sm font-semibold text-gray-700 hidden sm:block">Administrator</span>
          </div>
        </header>
        <main className="flex-1 p-6 sm:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
