// src/routes/(app)/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return {
      stats: null,
      recentSales: [],
      lowStockProducts: []
    };
  }

  try {
    // Get dashboard statistics
    const [
      totalProducts,
      totalSales,
      recentSales,
      lowStockProducts
    ] = await Promise.all([
      // Total products count
      prisma.product.count(),
      
      // Total sales count for today
      prisma.sale.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Recent sales (last 5)
      prisma.sale.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true
        }
      }),
      
      // Low stock products
      prisma.product.findMany({
        where: {
          quantity: {
            lte: prisma.product.fields.minQuantity
          }
        },
        take: 5,
        orderBy: { quantity: 'asc' }
      })
    ]);

    // Calculate total cash (simplified - you might want to implement proper cash management)
    const totalCash = 0; // Implement based on your cash transactions

    return {
      stats: {
        totalProducts,
        totalSales,
        totalCash,
        lowStockItems: lowStockProducts.length
      },
      recentSales,
      lowStockProducts
    };
  } catch (error) {
    console.error('Dashboard load error:', error);
    return {
      stats: {
        totalProducts: 0,
        totalSales: 0,
        totalCash: 0,
        lowStockItems: 0
      },
      recentSales: [],
      lowStockProducts: []
    };
  }
};