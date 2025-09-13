import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { z } from 'zod';

const categorySchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional()
});

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    redirect(302, '/auth/login');
  }

  const categoryId = params.id;
  
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      redirect(302, '/categories');
    }

    return { category };
  } catch (error) {
    console.error('Error loading category:', error);
    redirect(302, '/categories');
  }
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const categoryId = params.id;
    
    const formData = await request.formData();
    const data = {
      nameEn: formData.get('nameEn')?.toString() || '',
      nameAr: formData.get('nameAr')?.toString() || '',
      descriptionEn: formData.get('descriptionEn')?.toString() || '',
      descriptionAr: formData.get('descriptionAr')?.toString() || ''
    };

    try {
      const validatedData = categorySchema.parse(data);

      // Check if English name already exists (excluding current category)
      const existingEn = await prisma.category.findFirst({
        where: { 
          nameEn: validatedData.nameEn,
          NOT: { id: categoryId }
        }
      });

      if (existingEn) {
        return fail(400, {
          ...data,
          error: 'English name already exists'
        });
      }

      // Check if Arabic name already exists (excluding current category)
      const existingAr = await prisma.category.findFirst({
        where: { 
          nameAr: validatedData.nameAr,
          NOT: { id: categoryId }
        }
      });

      if (existingAr) {
        return fail(400, {
          ...data,
          error: 'Arabic name already exists'
        });
      }

      await prisma.category.update({
        where: { id: categoryId },
        data: {
          nameEn: validatedData.nameEn,
          nameAr: validatedData.nameAr,
          descriptionEn: validatedData.descriptionEn || null,
          descriptionAr: validatedData.descriptionAr || null
        }
      });

      throw redirect(302, '/categories');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return fail(400, {
          ...data,
          error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
        });
      }
      
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      console.error('Category update error:', error);
      return fail(500, {
        ...data,
        error: 'Failed to update category'
      });
    }
  }
};