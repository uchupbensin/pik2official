// @ts-nocheck
'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { signToken, verifyToken } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const payload = await verifyToken(token);
  if (!payload) throw new Error('Unauthorized');
}

// File-based rate limiting for login attempts (persists across server workers)
const RATE_LIMIT_FILE = path.join(process.cwd(), '.rate-limit.json');
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

type RateLimitData = Record<string, { count: number; lockedUntil: number }>;

async function readRateLimitData(): Promise<RateLimitData> {
  try {
    const data = await fs.readFile(RATE_LIMIT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeRateLimitData(data: RateLimitData): Promise<void> {
  try {
    await fs.writeFile(RATE_LIMIT_FILE, JSON.stringify(data), 'utf-8');
  } catch {
    // Ignore write errors
  }
}

async function getClientIP(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = headerList.get('x-real-ip');
  if (realIP) return realIP.trim();
  return 'unknown';
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number; lockedUntil?: number }> {
  const now = Date.now();
  const data = await readRateLimitData();
  const record = data[ip];

  // Active lockout — deny
  if (record && record.lockedUntil > now) {
    return { allowed: false, remaining: 0, lockedUntil: record.lockedUntil };
  }

  // Expired lockout — clear and start fresh
  if (record && record.lockedUntil > 0 && record.lockedUntil <= now) {
    delete data[ip];
    await writeRateLimitData(data);
  }

  const currentCount = data[ip]?.count ?? 0;
  return { allowed: true, remaining: MAX_ATTEMPTS - currentCount };
}

async function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const data = await readRateLimitData();
  const record = data[ip] ?? { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION;
    record.count = 0;
  }

  data[ip] = record;
  await writeRateLimitData(data);
}

async function clearRateLimit(ip: string) {
  const data = await readRateLimitData();
  delete data[ip];
  await writeRateLimitData(data);
}

export async function login(formData: FormData) {
  console.log('[LOGIN] Server action called');
  try {
    const ip = await getClientIP();
    console.log('[LOGIN] IP:', ip);
    const rateCheck = await checkRateLimit(ip);
    console.log('[LOGIN] Rate check:', rateCheck);

    if (!rateCheck.allowed) {
      const remainingMinutes = rateCheck.lockedUntil
        ? Math.ceil((rateCheck.lockedUntil - Date.now()) / 60000)
        : 5;
      return {
        success: false,
        error: `Terlalu banyak percobaan. Coba lagi dalam ${remainingMinutes} menit.`,
      };
    }

    const password = formData.get('password') as string;
    const adminPassword = process.env.ADMIN_PASSWORD;
    console.log('[LOGIN] Password check:', password === adminPassword ? 'MATCH' : 'NO MATCH');

    if (password === adminPassword) {
      // Clear rate limit on successful login
      await clearRateLimit(ip);

      // Set an HTTP-only cookie
      const cookieStore = await cookies();
      const token = await signToken({ role: 'admin' });
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/admin',
      });

      return { success: true };
    }

    // Record failed attempt for rate limiting
    await recordFailedAttempt(ip);
    console.log('[LOGIN] Failed attempt recorded');

    return { success: false, error: 'Password salah.' };
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    return { success: false, error: 'Terjadi kesalahan server.' };
  }
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
    await requireAuth();
    // 1. Update SiteSettings (id = 1)
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        site_name: formData.get('site_name') as string,
        site_tagline: formData.get('site_tagline') as string,
        sales_whatsapp_number: formData.get('sales_whatsapp_number') as string,
      },
      create: {
        id: 1,
        site_name: formData.get('site_name') as string,
        site_tagline: formData.get('site_tagline') as string,
        sales_whatsapp_number: formData.get('sales_whatsapp_number') as string,
      }
    });

    // 2. Update HomeSettings (id = 1)
    await prisma.homeSettings.upsert({
      where: { id: 1 },
      update: {
        hero_title: formData.get('hero_title') as string,
        hero_description: formData.get('hero_description') as string,
        promo_title: formData.get('promo_title') as string,
        promo_description: formData.get('promo_description') as string,
      },
      create: {
        id: 1,
        hero_title: formData.get('hero_title') as string,
        hero_description: formData.get('hero_description') as string,
        promo_title: formData.get('promo_title') as string,
        promo_description: formData.get('promo_description') as string,
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

// Progress Actions
export async function createProgress(formData: FormData) {
  try {
    await requireAuth();
    await prisma.progress.create({
      data: {
        title: formData.get('title') as string,
        youtube_url: formData.get('youtube_url') as string,
      }
    });
    revalidatePath('/');
    revalidatePath('/admin/progress');
    revalidatePath('/progres');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProgress(id: number) {
  try {
    await requireAuth();
    await prisma.progress.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/progress');
    revalidatePath('/progres');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Project Actions
// Removed vercel blob as VPS doesn't have token
// import { put, del } from '@vercel/blob';

export async function createProject(formData: FormData) {
  try {
    await requireAuth();
    const file = formData.get('cover_image') as File | null;
    let coverPath = null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads');

      // Ensure dir exists
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      await fs.writeFile(path.join(uploadDir, filename), buffer);
      coverPath = `uploads/${filename}`;
    }

    // (Brosur PDF tidak lagi disimpan ke server, hanya digunakan di client untuk render WebP)
    let brochurePath = null;

    // Ensure slug is URL friendly
    let slug = formData.get('slug') as string;
    if (slug) {
      slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    } else {
      slug = (formData.get('name') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Pastikan slug unik (jika sudah ada, kembalikan error ke pengguna)
    const existingSlug = await prisma.projects.findUnique({
      where: { slug: slug }
    });
    if (existingSlug) {
      return { success: false, error: 'Properti dengan nama tersebut sudah ada. Silakan gunakan nama properti atau tahap yang berbeda.' };
    }

    const createdProject = await prisma.projects.create({
      data: {
        name: formData.get('name') as string,
        category: (formData.get('category') as string) || 'rumah',
        group_name: (formData.get('group_name') as string) || null,
        slug: slug,
        short_description: formData.get('short_description') as string,
        features: formData.get('features') as string,
        location: formData.get('location') as string,
        is_promo: formData.get('is_promo') === 'on',
        whatsapp_number: formData.get('whatsapp_number') as string,
        meta_title: formData.get('meta_title') as string,
        meta_description: formData.get('meta_description') as string,
        youtube_url: formData.get('youtube_url') as string,
        gmaps_url: formData.get('gmaps_url') as string,
        cover_image: coverPath,
        brochure_file: brochurePath,
      }
    });

    // Handle multiple WebP images generated from PDF
    const images = formData.getAll('images') as File[];
    const captions = formData.getAll('image_captions') as string[];
    if (images && images.length > 0) {
      const imgUploadDir = path.join(process.cwd(), 'public/uploads/projects', createdProject.id.toString());
      try { await fs.access(imgUploadDir); } catch { await fs.mkdir(imgUploadDir, { recursive: true }); }

      let nextSortOrder = 1;
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
          await fs.writeFile(path.join(imgUploadDir, filename), buffer);

          await prisma.projectImages.create({
            data: {
              project_id: createdProject.id,
              image_path: `projects/${createdProject.id}/${filename}`,
              caption: captions[i] || null,
              sort_order: nextSortOrder++
            }
          });
        }
      }
    }

    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true, projectId: createdProject.id };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: number) {
  try {
    await requireAuth();
    const project = await prisma.projects.findUnique({ where: { id } });
    if (project?.cover_image) {
      // Optional: Delete file
      const filepath = path.join(process.cwd(), 'public', project.cover_image);
      try { await fs.unlink(filepath); } catch (e) { }
    }
    if (project?.brochure_file) {
      // Just delete local file
      const filepath = path.join(process.cwd(), 'public', project.brochure_file);
      try { await fs.unlink(filepath); } catch (e) { }
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
  try {
    await requireAuth();
    const file = formData.get('cover_image') as File | null;
    const brochureFile = formData.get('brochure_file') as File | null;
    const updateData: any = {
      name: formData.get('name') as string,
      category: (formData.get('category') as string) || 'rumah',
      group_name: (formData.get('group_name') as string) || null,
      short_description: formData.get('short_description') as string,
      features: formData.get('features') as string,
      location: formData.get('location') as string,
      is_promo: formData.get('is_promo') === 'on',
      whatsapp_number: formData.get('whatsapp_number') as string,
      meta_title: formData.get('meta_title') as string,
      meta_description: formData.get('meta_description') as string,
      youtube_url: formData.get('youtube_url') as string,
      gmaps_url: formData.get('gmaps_url') as string,
    };

    let slug = formData.get('slug') as string;
    if (slug) {
      updateData.slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    } else {
      updateData.slug = (formData.get('name') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      updateData.cover_image = `uploads/${filename}`;
    }

    await prisma.projects.update({
      where: { id },
      data: updateData
    });

    // Handle multiple WebP images generated from PDF
    const images = formData.getAll('images') as File[];
    const captions = formData.getAll('image_captions') as string[];
    if (images && images.length > 0) {
      const imgUploadDir = path.join(process.cwd(), 'public/uploads/projects', id.toString());
      try { await fs.access(imgUploadDir); } catch { await fs.mkdir(imgUploadDir, { recursive: true }); }

      const currentMax = await prisma.projectImages.aggregate({
        where: { project_id: id },
        _max: { sort_order: true }
      });
      let nextSortOrder = (currentMax._max.sort_order || 0) + 1;

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
          await fs.writeFile(path.join(imgUploadDir, filename), buffer);

          await prisma.projectImages.create({
            data: {
              project_id: id,
              image_path: `projects/${id}/${filename}`,
              caption: captions[i] || null,
              sort_order: nextSortOrder++
            }
          });
        }
      }
    }

    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}



export async function deleteProjectImage(imageId: number) {
  try {
    await requireAuth();
    const image = await prisma.projectImages.findUnique({ where: { id: imageId } });
    if (!image) return { success: false, error: 'Image not found' };

    const filepath = path.join(process.cwd(), 'public/uploads', image.image_path);
    try { await fs.unlink(filepath); } catch (e) { }

    await prisma.projectImages.delete({ where: { id: imageId } });

    revalidatePath('/');
    revalidatePath(`/admin/projects/${image.project_id}/edit`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProjectImageCaption(imageId: number, caption: string) {
  try {
    await requireAuth();
    const image = await prisma.projectImages.update({
      where: { id: imageId },
      data: { caption: caption || null }
    });

    revalidatePath('/');
    revalidatePath(`/admin/projects/${image.project_id}/edit`);
    revalidatePath(`/project/[slug]`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProjectSortOrders(updates: { id: number, sort_order: number }[]) {
  try {
    await requireAuth();
    // Prisma doesn't support bulk update with different values natively in a single query yet,
    // so we use a transaction
    await prisma.$transaction(
      updates.map(update =>
        prisma.projects.update({
          where: { id: update.id },
          data: { sort_order: update.sort_order }
        })
      )
    );

    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating sort orders:', error);
    return { success: false, error: error.message };
  }
}

export async function editProgress(id: number, formData: FormData) {
  try {
    await requireAuth();
    const title = formData.get('title') as string;
    const youtube_url = formData.get('youtube_url') as string;

    if (!title || !youtube_url) {
      throw new Error("Judul dan link YouTube wajib diisi.");
    }

    await prisma.progress.update({
      where: { id },
      data: {
        title,
        youtube_url,
      }
    });

    revalidatePath('/admin/progress');
    revalidatePath('/progres');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Terjadi kesalahan saat menyimpan video' };
  }
}

export async function renameCategory(categoryId: string, newLabel: string) {
  try {
    await requireAuth();
    await prisma.categories.update({
      where: { id: categoryId },
      data: { label: newLabel }
    });
    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Terjadi kesalahan saat mengubah nama kategori' };
  }
}

export async function createCategory(label: string) {
  try {
    await requireAuth();
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    const max = await prisma.categories.findFirst({
      orderBy: { sort_order: 'desc' }
    });
    const nextOrder = max ? max.sort_order + 1 : 1;

    await prisma.categories.create({
      data: { id, label, sort_order: nextOrder }
    });
    
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true, id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCategorySortOrders(updates: { id: string, sort_order: number }[]) {
  try {
    await requireAuth();
    await prisma.$transaction(
      updates.map(update =>
        prisma.categories.update({
          where: { id: update.id },
          data: { sort_order: update.sort_order }
        })
      )
    );

    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProgressSortOrders(updates: { id: number, sort_order: number }[]) {
  try {
    await requireAuth();
    await prisma.$transaction(
      updates.map(update =>
        prisma.progress.update({
          where: { id: update.id },
          data: { sort_order: update.sort_order }
        })
      )
    );

    revalidatePath('/admin/progress');
    revalidatePath('/progres');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating progress sort orders:', error);
    return { success: false, error: error.message };
  }
}

export async function bulkDeleteProjects(ids: number[]) {
  try {
    await requireAuth();
    
    // Find projects to delete their files
    const projects = await prisma.projects.findMany({ where: { id: { in: ids } } });
    for (const project of projects) {
      if (project.cover_image) {
        const filepath = path.join(process.cwd(), 'public', project.cover_image);
        try { await fs.unlink(filepath); } catch (e) { }
      }
      if (project.brochure_file) {
        const filepath = path.join(process.cwd(), 'public', project.brochure_file);
        try { await fs.unlink(filepath); } catch (e) { }
      }
    }

    await prisma.projects.deleteMany({ where: { id: { in: ids } } });
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProjectName(id: number, newName: string) {
  try {
    await requireAuth();
    if (!newName || newName.trim() === '') {
      throw new Error('Nama properti tidak boleh kosong');
    }
    
    await prisma.projects.update({
      where: { id },
      data: { name: newName.trim() }
    });
    
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProjectGroup(id: number, groupName: string) {
  try {
    await requireAuth();
    await prisma.projects.update({
      where: { id },
      data: { group_name: groupName.trim() || null }
    });
    
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateProjectGroup(ids: number[], groupName: string) {
  try {
    await requireAuth();
    await prisma.projects.updateMany({
      where: { id: { in: ids } },
      data: { group_name: groupName.trim() || null }
    });
    
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await requireAuth();
    
    // Hapus dari database
    await prisma.categories.delete({ where: { id: categoryId } });
    
    // Kembalikan semua properti di kategori ini ke default 'rumah' (kalau bukan rumah yang dihapus)
    if (categoryId !== 'rumah') {
      await prisma.projects.updateMany({
        where: { category: categoryId },
        data: { category: 'rumah' }
      });
    }
    
    revalidatePath('/');
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function syncCategories() {
  const baseCategories = [
    { id: 'rumah', label: 'Rumah' },
    { id: 'ruko_gudang', label: 'Ruko & Gudang' },
    { id: 'apartemen', label: 'Apartemen' },
    { id: 'kavling', label: 'Kavling' },
  ];

  const dbCategories = await prisma.categories.findMany();
  
  if (dbCategories.length === 0) {
    let order = 1;
    for (const cat of baseCategories) {
      await prisma.categories.create({
        data: { id: cat.id, label: cat.label, sort_order: order++ }
      });
    }

    const projects = await prisma.projects.findMany({ select: { category: true } });
    const uniqueCats = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
    const customCats = uniqueCats.filter(cat => !baseCategories.find(bc => bc.id === cat));

    for (const cat of customCats) {
      await prisma.categories.create({
        data: { id: cat, label: cat.replace(/_/g, ' ').toUpperCase(), sort_order: order++ }
      });
    }
    
    return await prisma.categories.findMany({ orderBy: { sort_order: 'asc' } });
  }
  
  return dbCategories.sort((a, b) => a.sort_order - b.sort_order);
}
