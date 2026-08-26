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
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || (path !== '/admin' && pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#1E356A] to-[#2B4A93] p-2 rounded-xl shadow-md shadow-blue-900/20">
              <img src="/logo.png" alt="PIK 2" className="h-6 w-auto brightness-0 invert" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#1E356A]">Workspace</span>
          </div>
          <button 
            className="md:hidden text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Main Menu</p>
          <nav className="space-y-1.5">
            <Link href="/admin" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive('/admin') ? 'bg-gradient-to-r from-[#1E356A] to-[#2B4A93] text-white shadow-md shadow-blue-900/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link href="/admin/projects" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive('/admin/projects') ? 'bg-gradient-to-r from-[#1E356A] to-[#2B4A93] text-white shadow-md shadow-blue-900/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Building2 className="w-5 h-5" />
              Properti
            </Link>
            <Link href="/admin/menus" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive('/admin/menus') ? 'bg-gradient-to-r from-[#1E356A] to-[#2B4A93] text-white shadow-md shadow-blue-900/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <MenuSquare className="w-5 h-5" />
              Menu Navigasi
            </Link>
          </nav>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-8 mb-4">Sistem</p>
          <nav className="space-y-1.5">
            <Link href="/admin/settings" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${isActive('/admin/settings') ? 'bg-gradient-to-r from-[#1E356A] to-[#2B4A93] text-white shadow-md shadow-blue-900/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Settings className="w-5 h-5" />
              Pengaturan
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-2">
          <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all font-semibold text-sm border border-gray-100 shadow-sm">
            <Globe className="w-5 h-5 text-gray-400" />
            Buka Website
          </a>
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all font-semibold text-sm">
              <LogOut className="w-5 h-5" />
              Keluar Sesi
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-0 h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sm:px-10 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end hidden sm:flex">
               <span className="text-sm font-bold text-gray-900">Administrator</span>
               <span className="text-xs font-medium text-gray-500">Super Admin</span>
             </div>
             <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#1E356A] to-blue-400 text-white flex items-center justify-center font-bold shadow-md">
               A
             </div>
          </div>
        </header>
        <main className="flex-1 p-6 sm:p-10 overflow-auto bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
