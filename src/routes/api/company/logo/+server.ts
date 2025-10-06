import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '$lib/server/db';

const UPLOAD_DIR = 'static/uploads/company';
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file || file.size === 0) {
      throw error(400, 'No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw error(400, 'File size exceeds 2MB limit');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw error(400, 'Invalid file type. Only PNG, JPG, and JPEG are allowed');
    }

    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `logo-${timestamp}.${extension}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const logoUrl = `/uploads/company/${filename}`;

    const oldLogo = await prisma.settings.findUnique({
      where: { key: 'companyLogo' }
    });

    if (oldLogo && oldLogo.value && oldLogo.value !== logoUrl) {
      const oldFilePath = path.join('static', oldLogo.value);
      if (existsSync(oldFilePath)) {
        try {
          await unlink(oldFilePath);
        } catch (err) {
          console.error('Error deleting old logo:', err);
        }
      }
    }

    await prisma.settings.upsert({
      where: { key: 'companyLogo' },
      update: { value: logoUrl, type: 'STRING' },
      create: { key: 'companyLogo', value: logoUrl, type: 'STRING' }
    });

    return json({ success: true, logoUrl });
  } catch (err) {
    console.error('Logo upload error:', err);
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    throw error(500, 'Failed to upload logo');
  }
};

export const DELETE: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const logoSetting = await prisma.settings.findUnique({
      where: { key: 'companyLogo' }
    });

    if (logoSetting && logoSetting.value) {
      const filepath = path.join('static', logoSetting.value);
      if (existsSync(filepath)) {
        try {
          await unlink(filepath);
        } catch (err) {
          console.error('Error deleting logo file:', err);
        }
      }

      await prisma.settings.delete({
        where: { key: 'companyLogo' }
      });
    }

    return json({ success: true });
  } catch (err) {
    console.error('Logo deletion error:', err);
    throw error(500, 'Failed to delete logo');
  }
};
