import React from 'react';
import { prisma } from '@/lib/prisma';
import ProjectList from '@/components/admin/ProjectList';

export const metadata = {
  title: 'Manajemen Properti - Admin PIK 2 OFFICIAL',
};

export default async function ProjectsPage() {
  const projects = await prisma.projects.findMany({
    orderBy: { created_at: 'desc' }
  });

  let categories = await prisma.categories.findMany({
    orderBy: { sort_order: 'asc' }
  });

  if (categories.length === 0) {
    const { syncCategories } = await import('@/app/admin/actions');
    categories = await syncCategories();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Properti</h2>
        <p className="text-gray-600 mt-1">Kelola data properti, gambar *cover*, dan status promo.</p>
      </div>

      <ProjectList projects={projects} initialCategories={categories} />
    </div>
  );
}
