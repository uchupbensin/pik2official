import ProjectForm from '@/components/admin/ProjectForm';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Tambah Properti - Admin PIK 2 OFFICIAL',
};

export default async function CreateProjectPage() {
  const categoriesRaw = await prisma.projects.findMany({
    select: { category: true },
    distinct: ['category'],
  });
  
  const baseCategories = ['rumah', 'ruko_gudang', 'apartemen', 'kavling'];
  const dbCategories = categoriesRaw.map(p => p.category).filter(Boolean);
  const existingCategories = Array.from(new Set([...baseCategories, ...dbCategories]));

  return <ProjectForm existingCategories={existingCategories} />;
}
