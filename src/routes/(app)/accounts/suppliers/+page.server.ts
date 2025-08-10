// src/routes/(app)/accounts/suppliers/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }

  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            purchases: true
          }
        }
      }
    });

    return {
      suppliers: suppliers.map(supplier => ({
        ...supplier,
        purchasesCount: supplier._count.purchases
      }))
    };
  } catch (error) {
    console.error('Error loading suppliers:', error);
    return {
      suppliers: []
    };
  }
};