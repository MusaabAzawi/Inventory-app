// src/routes/(app)/accounts/customers/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }

  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            sales: true
          }
        }
      }
    });

    return {
      customers: customers.map(customer => ({
        ...customer,
        salesCount: customer._count.sales
      }))
    };
  } catch (error) {
    console.error('Error loading customers:', error);
    return {
      customers: []
    };
  }
};