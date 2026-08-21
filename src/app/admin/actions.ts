'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const password = formData.get('password') as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    // Set an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/admin',
    });
    
    return { success: true };
  }

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
import fs from 'fs/promises';
import path from 'path';

export async function createProject(formData: FormData) {
  try {
    const file = formData.get('cover_image') as File | null;
    let coverPath = null;
    
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public/storage');
      
      // Ensure dir exists
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      coverPath = `storage/${filename}`;
    }

    // Auto-generate slug from name if not provided
    let slug = formData.get('slug') as string;
    if (!slug) {
      slug = (formData.get('name') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    await prisma.projects.create({
      data: {
        name: formData.get('name') as string,
        slug: slug,
        short_description: formData.get('short_description') as string,
        location: formData.get('location') as string,
        is_promo: formData.get('is_promo') === 'on',
        whatsapp_number: formData.get('whatsapp_number') as string,
        meta_title: formData.get('meta_title') as string,
        meta_description: formData.get('meta_description') as string,
        cover_image: coverPath,
      }
    });
    
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: number) {
  try {
    const project = await prisma.projects.findUnique({ where: { id } });
    if (project?.cover_image) {
      // Optional: Delete file
      const filepath = path.join(process.cwd(), 'public', project.cover_image);
      try { await fs.unlink(filepath); } catch (e) {}
    }

    await prisma.projects.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
