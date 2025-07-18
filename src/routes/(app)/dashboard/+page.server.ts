import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return {
      stats: null,
      recentSales: [],
      lowStockProducts: [],
      chartData: null
    };
  }

  try {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);

    // Get dashboard statistics
    const [
      totalProducts,
      totalSalesToday,
      totalSalesThisMonth,
      recentSales,
      lowStockProducts,
      inventoryHistory,
      topProducts,
      categoryStats
    ] = await Promise.all([
      // Total products count
      prisma.product.count(),
      
      // Total sales count for today
      prisma.sale.count({
        where: {
          createdAt: {
            gte: startOfDay(now),
            lte: endOfDay(now)
          }
        }
      }),
      
      // Total sales this month
      prisma.sale.aggregate({
        where: {
          createdAt: {
            gte: startOfDay(subDays(now, 30))
          }
        },
        _sum: {
          netAmount: true
        },
        _count: true
      }),
      
      // Recent sales (last 5)
      prisma.sale.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          user: {
            select: { name: true }
          }
        }
      }),
      
      // Low stock products
      prisma.product.findMany({
        where: {
          OR: [
            { quantity: 0 },
            {
              quantity: {
                lte: prisma.product.fields.minQuantity
              }
            }
          ]
        },
        take: 10,
        orderBy: { quantity: 'asc' },
        include: {
          category: true
        }
      }),

      // Inventory movements for charts (last 7 days)
      prisma.inventoryHistory.findMany({
        where: {
          timestamp: {
            gte: sevenDaysAgo
          }
        },
        include: {
          product: {
            select: { nameEn: true, nameAr: true }
          }
        },
        orderBy: { timestamp: 'desc' }
      }),

      // Top selling products (this month)
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        },
        _sum: {
          quantity: true,
          total: true
        },
        orderBy: {
          _sum: {
            total: 'desc'
          }
        },
        take: 5
      }),

      // Category distribution
      prisma.product.groupBy({
        by: ['categoryId'],
        _count: {
          _all: true
        },
        _sum: {
          quantity: true
        }
      })
    ]);

    // Process inventory movements by day for chart
    const inventoryByDay = new Map();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      inventoryByDay.set(dateKey, {
        date: format(date, 'MMM dd'),
        stockIn: 0,
        stockOut: 0,
        adjustments: 0
      });
    }

    // Aggregate movements
    inventoryHistory.forEach(movement => {
      const dateKey = format(new Date(movement.timestamp), 'yyyy-MM-dd');
      const day = inventoryByDay.get(dateKey);
      
      if (day) {
        if (movement.action === 'INITIAL_STOCK' || movement.quantityChange > 0) {
          day.stockIn += Math.abs(movement.quantityChange);
        } else if (movement.quantityChange < 0) {
          day.stockOut += Math.abs(movement.quantityChange);
        } else {
          day.adjustments += 1;
        }
      }
    });

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true }
        });
        return {
          ...item,
          product
        };
      })
    );

    // Get category details for distribution
    const categoryDistribution = await Promise.all(
      categoryStats.map(async (item) => {
        if (!item.categoryId) return null;
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId }
        });
        return {
          ...item,
          category
        };
      })
    ).then(results => results.filter(Boolean));

    // Calculate inventory value
    const products = await prisma.product.findMany({
      select: {
        quantity: true,
        costPrice: true,
        sellingPrice: true
      }
    });

    const inventoryValue = products.reduce((total, product) => {
      return total + (product.quantity * product.costPrice);
    }, 0);

    const totalRevenue = products.reduce((total, product) => {
      return total + (product.quantity * product.sellingPrice);
    }, 0);

    return {
      stats: {
        totalProducts,
        totalSalesToday,
        totalSalesThisMonth: totalSalesThisMonth._sum.netAmount || 0,
        salesCountThisMonth: totalSalesThisMonth._count,
        lowStockItems: lowStockProducts.length,
        outOfStockItems: lowStockProducts.filter(p => p.quantity === 0).length,
        inventoryValue,
        totalRevenue
      },
      recentSales,
      lowStockProducts,
      chartData: {
        inventoryMovements: Array.from(inventoryByDay.values()),
        topProducts: topProductsWithDetails,
        categoryDistribution
      }
    };
  } catch (error) {
    console.error('Dashboard load error:', error);
    return {
      stats: {
        totalProducts: 0,
        totalSalesToday: 0,
        totalSalesThisMonth: 0,
        salesCountThisMonth: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        inventoryValue: 0,
        totalRevenue: 0
      },
      recentSales: [],
      lowStockProducts: [],
      chartData: {
        inventoryMovements: [],
        topProducts: [],
        categoryDistribution: []
      }
    };
  }
};