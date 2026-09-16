import ProjectForm from '@/components/admin/ProjectForm';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Tambah Properti - Admin PIK 2 OFFICIAL',
};

export default async function CreateProjectPage() {
  let dbCategories = await prisma.categories.findMany({ orderBy: { sort_order: 'asc' } });
  
  if (dbCategories.length === 0) {
    const { syncCategories } = await import('@/app/admin/actions');
    dbCategories = await syncCategories();
  }

  return <ProjectForm existingCategories={dbCategories} />;
}
