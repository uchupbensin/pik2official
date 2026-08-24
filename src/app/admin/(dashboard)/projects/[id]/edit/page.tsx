import React from 'react';
import ProjectForm from '@/components/admin/ProjectForm';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Properti - Admin PIK 2 OFFICIAL',
};

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const id = parseInt((await params).id);
  if (isNaN(id)) return notFound();

  const project = await prisma.projects.findUnique({
    where: { id },
    include: {
      project_images: {
        orderBy: { sort_order: 'asc' }
      }
    }
  });

  if (!project) return notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <ProjectForm project={project} />
    </div>
  );
}
