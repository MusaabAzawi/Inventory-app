// src/routes/(app)/purchases/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const purchaseId = params.id;

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        supplier: true,
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { 
                nameEn: true, 
                nameAr: true, 
                sku: true,
                quantity: true
              }
            }
          }
        }
      }
    });

    if (!purchase) {
      throw error(404, 'Purchase order not found');
    }

    return {
      purchase
    };
  } catch (err) {
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    console.error('Error loading purchase:', err);
    throw error(500, 'Failed to load purchase order');
  }
};