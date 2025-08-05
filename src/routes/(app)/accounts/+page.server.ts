// src/routes/(app)/accounts/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return {
      customers: [],
      suppliers: [],
      stats: null
    };
  }

  try {
    const [customers, suppliers] = await Promise.all([
      // Get customers
      prisma.customer.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),

      // Get suppliers
      prisma.supplier.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    // Calculate stats
    const [customerStats, supplierStats] = await Promise.all([
      prisma.customer.aggregate({
        _count: {
          _all: true
        }
      }),
      prisma.supplier.aggregate({
        _count: {
          _all: true
        }
      })
    ]);

    const activeCustomers = await prisma.customer.count({
      where: { isActive: true }
    });

    const activeSuppliers = await prisma.supplier.count({
      where: { isActive: true }
    });

    return {
      customers,
      suppliers,
      stats: {
        customers: {
          total: customerStats._count._all,
          active: activeCustomers
        },
        suppliers: {
          total: supplierStats._count._all,
          active: activeSuppliers
        }
      }
    };
  } catch (error) {
    console.error('Error loading accounts data:', error);
    return {
      customers: [],
      suppliers: [],
      stats: null
    };
  }
};