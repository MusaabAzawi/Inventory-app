// src/routes/(app)/inventory/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.category.findMany({
        orderBy: { nameEn: 'asc' }
      })
    ]);

    return {
      products,
      categories
    };
  } catch (error) {
    console.error('Error loading inventory:', error);
    return {
      products: [],
      categories: []
    };
  }
};