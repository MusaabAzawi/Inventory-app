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

export const load: PageServerLoad = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { categories };
  } catch (error) {
    console.error('Error loading categories:', error);
    return { categories: [] };
  }
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const categoryId = formData.get('id')?.toString();

    if (!categoryId) {
      return fail(400, { error: 'Category ID is required' });
    }

    try {
      // Check if category has products
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { _count: { select: { products: true } } }
      });

      if (!category) {
        return fail(404, { error: 'Category not found' });
      }

      if (category._count.products > 0) {
        return fail(400, { error: 'Cannot delete category with products' });
      }

      await prisma.category.delete({
        where: { id: categoryId }
      });

      return { success: true };
    } catch (error) {
      console.error('Delete category error:', error);
      return fail(500, { error: 'Failed to delete category' });
    }
  }
};