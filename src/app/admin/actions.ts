'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signToken, verifyToken } from '@/lib/auth';

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const payload = await verifyToken(token);
  if (!payload) throw new Error('Unauthorized');
}

import { headers } from 'next/headers';

// Simple in-memory rate limiter (per instance)
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export async function login(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown-ip';
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt && attempt.count >= MAX_ATTEMPTS) {
    if (now - attempt.lastAttempt < LOCKOUT_TIME) {
      return { success: false, error: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.' };
    } else {
      loginAttempts.delete(ip);
    }
  }

  const password = formData.get('password') as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    loginAttempts.delete(ip);
    
    // Set an HTTP-only cookie
    const cookieStore = await cookies();
    const token = await signToken({ role: 'admin' });
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/admin',
    });

    return { success: true };
  }

  loginAttempts.set(ip, { count: (attempt?.count || 0) + 1, lastAttempt: now });
  return { success: false, error: 'Password salah.' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/admin/login');
}

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
  await requireAuth();
  try {
    // 1. Update SiteSettings (id = 1)
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        site_name: formData.get('site_name') as string,
        site_tagline: formData.get('site_tagline') as string,
        sales_whatsapp_number: formData.get('sales_whatsapp_number') as string,
        topbar_label: formData.get('topbar_label') as string,
      },
      create: {
        id: 1,
        site_name: formData.get('site_name') as string,
        site_tagline: formData.get('site_tagline') as string,
        sales_whatsapp_number: formData.get('sales_whatsapp_number') as string,
        topbar_label: formData.get('topbar_label') as string,
      }
    });

    // 2. Update HomeSettings (id = 1)
    await prisma.homeSettings.upsert({
      where: { id: 1 },
      update: {
        hero_youtube_url: formData.get('hero_youtube_url') as string,
        hero_title: formData.get('hero_title') as string,
        hero_description: formData.get('hero_description') as string,
        promo_title: formData.get('promo_title') as string,
        promo_subtitle: formData.get('promo_subtitle') as string,
        promo_description: formData.get('promo_description') as string,
        promo_benefits: formData.get('promo_benefits') as string,
      },
      create: {
        id: 1,
        hero_youtube_url: formData.get('hero_youtube_url') as string,
        hero_title: formData.get('hero_title') as string,
        hero_description: formData.get('hero_description') as string,
        promo_title: formData.get('promo_title') as string,
        promo_subtitle: formData.get('promo_subtitle') as string,
        promo_description: formData.get('promo_description') as string,
        promo_benefits: formData.get('promo_benefits') as string,
      }
    });

    revalidatePath('/');
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return { success: false, error: error.message };
  }
}

// Menus Actions
export async function createMenu(formData: FormData) {
  await requireAuth();
  try {
    const parent_id = formData.get('parent_id') ? parseInt(formData.get('parent_id') as string) : null;
    await prisma.menus.create({
      data: {
        label: formData.get('label') as string,
        url: formData.get('url') as string,
        sort_order: parseInt(formData.get('sort_order') as string) || 0,
        is_active: formData.get('is_active') === 'on',
        open_in_new_tab: formData.get('open_in_new_tab') === 'on',
        parent_id: parent_id,
      }
    });
    revalidatePath('/');
    revalidatePath('/admin/menus');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMenu(id: number) {
  await requireAuth();
  try {
    await prisma.menus.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/menus');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Project Actions
import { put, del } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

export async function createProject(formData: FormData) {
  await requireAuth();
  try {
    const file = formData.get('cover_image') as File | null;
    let coverPath = null;

    if (file && file.size > 0) {
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const blob = await put(`storage/${filename}`, file, {
        access: 'public',
      });
      coverPath = blob.url;
    }

    // Auto-generate slug from name if not provided
    let slug = formData.get('slug') as string;
    if (!slug) {
      slug = (formData.get('name') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const newProject = await prisma.projects.create({
      data: {
        name: formData.get('name') as string,
        slug: slug,
        short_description: formData.get('short_description') as string,
        location: formData.get('location') as string,
        is_promo: formData.get('is_promo') === 'on',
        whatsapp_number: formData.get('whatsapp_number') as string,
        meta_title: formData.get('meta_title') as string,
        meta_description: formData.get('meta_description') as string,
        category: formData.get('category') as string || 'rumah',
        cover_image: coverPath,
      }
    });

    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true, projectId: newProject.id };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: number) {
  await requireAuth();
  try {
    const project = await prisma.projects.findUnique({ 
      where: { id },
      include: { project_images: true } 
    });
    
    if (project?.cover_image && project.cover_image.startsWith('http')) {
      try { await del(project.cover_image); } catch (e) { }
    }

    if (project?.project_images) {
      for (const img of project.project_images) {
        if (img.image_path && img.image_path.startsWith('http')) {
          try { await del(img.image_path); } catch (e) { }
        }
      }
    }

    await prisma.projects.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProject(id: number, formData: FormData) {
  await requireAuth();
  try {
    const file = formData.get('cover_image') as File | null;
    let updateData: any = {
      name: formData.get('name') as string,
      short_description: formData.get('short_description') as string,
      location: formData.get('location') as string,
      is_promo: formData.get('is_promo') === 'on',
      whatsapp_number: formData.get('whatsapp_number') as string,
      meta_title: formData.get('meta_title') as string,
      meta_description: formData.get('meta_description') as string,
      category: formData.get('category') as string || 'rumah',
    };

    let slug = formData.get('slug') as string;
    if (slug) {
      updateData.slug = slug;
    } else {
      updateData.slug = (formData.get('name') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (file && file.size > 0) {
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const blob = await put(`storage/${filename}`, file, {
        access: 'public',
      });
      updateData.cover_image = blob.url;
      
      // Delete old image if it's a blob url
      const oldProject = await prisma.projects.findUnique({ where: { id } });
      if (oldProject?.cover_image && oldProject.cover_image.startsWith('http')) {
        try { await del(oldProject.cover_image); } catch (e) { }
      }
    }

    await prisma.projects.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function uploadProjectImages(projectId: number, formData: FormData) {
  await requireAuth();
  try {
    const files = formData.getAll('images') as File[];
    if (!files || files.length === 0) return { success: false, error: 'No files provided' };

    // Get current max sort_order
    const currentMax = await prisma.projectImages.aggregate({
      where: { project_id: projectId },
      _max: { sort_order: true }
    });
    let nextSortOrder = (currentMax._max.sort_order || 0) + 1;

    for (const file of files) {
      if (file.size > 0) {
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const blob = await put(`projects/${projectId}/${filename}`, file, {
          access: 'public',
        });

        await prisma.projectImages.create({
          data: {
            project_id: projectId,
            image_path: blob.url,
            sort_order: nextSortOrder++
          }
        });
      }
    }

    revalidatePath('/');
    revalidatePath(`/admin/projects/${projectId}/edit`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function deleteProjectImage(imageId: number) {
  await requireAuth();
  try {
    const image = await prisma.projectImages.findUnique({ where: { id: imageId } });
    if (!image) return { success: false, error: 'Image not found' };

    if (image.image_path && image.image_path.startsWith('http')) {
      try { await del(image.image_path); } catch (e) { }
    }

    await prisma.projectImages.delete({ where: { id: imageId } });

    revalidatePath('/');
    revalidatePath(`/admin/projects/${image.project_id}/edit`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
