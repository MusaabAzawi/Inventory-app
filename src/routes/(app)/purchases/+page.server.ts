// src/routes/(app)/purchases/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return {
      purchases: [],
      suppliers: [],
      stats: null
    };
  }

  try {
    const [purchases, suppliers, purchaseStats] = await Promise.all([
      // Get recent purchases with supplier and user info
      prisma.purchase.findMany({
        include: {
          supplier: true,
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

      // Get suppliers for dropdown
      prisma.supplier.findMany({
        where: { isActive: true },
        orderBy: { nameEn: 'asc' }
      }),

      // Get purchase statistics
      prisma.purchase.aggregate({
        _sum: {
          netAmount: true
        },
        _count: true
      })
    ]);

    // Calculate additional stats
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todaysPurchases = await prisma.purchase.aggregate({
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
    const monthlyStats = await prisma.purchase.aggregate({
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
      purchases,
      suppliers,
      stats: {
        total: {
          amount: purchaseStats._sum.netAmount || 0,
          count: purchaseStats._count
        },
        today: {
          amount: todaysPurchases._sum.netAmount || 0,
          count: todaysPurchases._count
        },
        thisMonth: {
          amount: monthlyStats._sum.netAmount || 0,
          count: monthlyStats._count
        }
      }
    };
  } catch (error) {
    console.error('Error loading purchases data:', error);
    return {
      purchases: [],
      suppliers: [],
      stats: null
    };
  }
};