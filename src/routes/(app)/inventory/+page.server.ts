// src/routes/(app)/inventory/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
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

    // Handle success messages from URL params
    const success = url.searchParams.get('success');
    const productName = url.searchParams.get('name');
    
    let successMessage = null;
    if (success === 'product_created' && productName) {
      successMessage = {
        title: 'Product Created',
        message: `${decodeURIComponent(productName)} has been created successfully.`
      };
    }

    return {
      products,
      categories,
      successMessage
    };
  } catch (error) {
    console.error('Error loading inventory:', error);
    return {
      products: [],
      categories: [],
      successMessage: null
    };
  }
};