import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pik2official.id';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/progres`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  try {
    const projects = await prisma.projects.findMany({
      select: {
        slug: true,
        updated_at: true,
      },
    });

    const projectRoutes: MetadataRoute.Sitemap = projects
      .filter((p) => p.slug && !p.slug.startsWith('http'))
      .map((project) => ({
        url: `${siteUrl}/project/${encodeURIComponent(project.slug)}`,
        lastModified: project.updated_at || new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      }));

    return [...staticRoutes, ...projectRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return staticRoutes;
  }
}
