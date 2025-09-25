// src/routes/(app)/sales/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { getFlash } from '$lib/server/flash';

export const load: PageServerLoad = async ({ params, locals, cookies }) => {
  // Get any flash messages
  const flash = getFlash(cookies);
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const saleId = params.id;

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
                sku: true,
                barcode: true,
                category: {
                  select: {
                    nameEn: true,
                    nameAr: true
                  }
                }
              }
            }
          },
          orderBy: { id: 'asc' }
        },
        returns: {
          select: {
            id: true,
            reason: true,
            amount: true,
            quantity: true,
            createdAt: true
          }
        }
      }
    });

    if (!sale) {
      throw error(404, 'Sale not found');
    }

    return { sale, flash };
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    console.error('Error loading sale:', err);
    throw error(500, 'Failed to load sale details');
  }
};