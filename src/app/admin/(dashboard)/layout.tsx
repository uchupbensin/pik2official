'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  MenuSquare, 
  LogOut,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { logout } from '@/app/admin/actions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#1E356A] text-white flex flex-col shadow-xl z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 bg-[#14244B] border-b border-white/10">
          <div className="flex items-center">
            <img src="/logo.svg" alt="PIK 2" className="h-8 w-auto brightness-0 invert" />
            <span className="ml-3 font-bold text-lg tracking-tight">Admin Panel</span>
          </div>
          <button 
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/admin" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/admin/projects" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium">
            <Building2 className="w-5 h-5" />
            Properti
          </Link>
          <Link href="/admin/menus" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium">
            <MenuSquare className="w-5 h-5" />
            Menu Navigasi
          </Link>
          <Link href="/admin/settings" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium">
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
      <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Manajemen Konten</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 rounded-full bg-[#81A649] text-white flex items-center justify-center font-bold text-sm">A</div>
             <span className="text-sm font-semibold text-gray-700 hidden sm:block">Administrator</span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
