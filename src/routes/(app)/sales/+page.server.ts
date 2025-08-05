// src/routes/(app)/sales/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return {
      sales: [],
      customers: [],
      stats: null
    };
  }

  try {
    const [sales, customers, salesStats] = await Promise.all([
      // Get recent sales with customer and user info
      prisma.sale.findMany({
        include: {
          customer: true,
          user: {
            select: { name: true }
          },
          items: {
            include: {
              product: {
                select: { nameEn: true, nameAr: true, sku: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),

      // Get customers for dropdown
      prisma.customer.findMany({
        where: { isActive: true },
        orderBy: { nameEn: 'asc' }
      }),

      // Get sales statistics
      prisma.sale.aggregate({
        _sum: {
          netAmount: true
        },
        _count: true
      })
    ]);

    // Calculate additional stats
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todaysSales = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: startOfToday
        }
      },
      _sum: {
        netAmount: true
      },
      _count: true
    });

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyStats = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: thisMonth
        }
      },
      _sum: {
        netAmount: true
      },
      _count: true
    });

    return {
      sales,
      customers,
      stats: {
        total: {
          amount: salesStats._sum.netAmount || 0,
          count: salesStats._count
        },
        today: {
          amount: todaysSales._sum.netAmount || 0,
          count: todaysSales._count
        },
        thisMonth: {
          amount: monthlyStats._sum.netAmount || 0,
          count: monthlyStats._count
        }
      }
    };
  } catch (error) {
    console.error('Error loading sales data:', error);
    return {
      sales: [],
      customers: [],
      stats: null
    };
  }
};