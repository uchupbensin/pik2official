import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const tokyo = await prisma.projects.findUnique({
    where: { slug: 'tokyo' },
    include: { project_images: true }
  });
  return NextResponse.json(tokyo);
}
