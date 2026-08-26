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

export async function login(formData: FormData) {
  const password = formData.get('password') as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
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

// Progress Actions
export async function createProgress(formData: FormData) {
  await requireAuth();
  try {
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
  await requireAuth();
  try {
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
import fs from 'fs/promises';
import path from 'path';
import { put, del } from '@vercel/blob';

export async function createProject(formData: FormData) {
  await requireAuth();
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

    const brochureFile = formData.get('brochure_file') as File | null;
    let brochurePath = null;

    if (brochureFile && brochureFile.size > 0) {
      const filename = `${Date.now()}-brochure-${brochureFile.name.replace(/\s+/g, '-')}`;
      const buffer = Buffer.from(await brochureFile.arrayBuffer());
      const blob = await put(`brochures/${filename}`, buffer, { access: 'public' });
      brochurePath = blob.url;
    }

    // Ensure slug is URL friendly
    let slug = formData.get('slug') as string;
    if (slug) {
      slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    } else {
      slug = (formData.get('name') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const createdProject = await prisma.projects.create({
      data: {
        name: formData.get('name') as string,
        category: (formData.get('category') as string) || 'rumah',
        slug: slug,
        short_description: formData.get('short_description') as string,
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
      const imgUploadDir = path.join(process.cwd(), 'public/storage/projects', createdProject.id.toString());
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
  await requireAuth();
  try {
    const project = await prisma.projects.findUnique({ where: { id } });
    if (project?.cover_image) {
      // Optional: Delete file
      const filepath = path.join(process.cwd(), 'public', project.cover_image);
      try { await fs.unlink(filepath); } catch (e) { }
    }
    if (project?.brochure_file) {
      if (project.brochure_file.startsWith('http')) {
        try { await del(project.brochure_file); } catch (e) { }
      } else {
        const filepath = path.join(process.cwd(), 'public', project.brochure_file);
        try { await fs.unlink(filepath); } catch (e) { }
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
    const brochureFile = formData.get('brochure_file') as File | null;
    const updateData: any = {
      name: formData.get('name') as string,
      category: (formData.get('category') as string) || 'rumah',
      short_description: formData.get('short_description') as string,
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
      const uploadDir = path.join(process.cwd(), 'public/storage');
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      updateData.cover_image = `storage/${filename}`;
    }

    if (brochureFile && brochureFile.size > 0) {
      const filename = `${Date.now()}-brochure-${brochureFile.name.replace(/\s+/g, '-')}`;
      const buffer = Buffer.from(await brochureFile.arrayBuffer());
      const blob = await put(`brochures/${filename}`, buffer, { access: 'public' });
      updateData.brochure_file = blob.url;
    }

    await prisma.projects.update({
      where: { id },
      data: updateData
    });

    // Handle multiple WebP images generated from PDF
    const images = formData.getAll('images') as File[];
    const captions = formData.getAll('image_captions') as string[];
    if (images && images.length > 0) {
      const imgUploadDir = path.join(process.cwd(), 'public/storage/projects', id.toString());
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

export async function uploadProjectImages(projectId: number, formData: FormData) {
  await requireAuth();
  try {
    const files = formData.getAll('images') as File[];
    if (!files || files.length === 0) return { success: false, error: 'No files provided' };

    const uploadDir = path.join(process.cwd(), 'public/storage/projects', projectId.toString());
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Get current max sort_order
    const currentMax = await prisma.projectImages.aggregate({
      where: { project_id: projectId },
      _max: { sort_order: true }
    });
    let nextSortOrder = (currentMax._max.sort_order || 0) + 1;

    for (const file of files) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        await fs.writeFile(path.join(uploadDir, filename), buffer);

        await prisma.projectImages.create({
          data: {
            project_id: projectId,
            image_path: `projects/${projectId}/${filename}`,
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

    const filepath = path.join(process.cwd(), 'public/storage', image.image_path);
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
  await requireAuth();
  try {
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
  await requireAuth();
  try {
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
  await requireAuth();
  
  try {
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

export async function updateProgressSortOrders(updates: { id: number, sort_order: number }[]) {
  await requireAuth();
  try {
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
