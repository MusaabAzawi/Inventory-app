import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { subDays, startOfMonth, endOfMonth, format } from 'date-fns';

export const load: PageServerLoad = async ({ url, locals }) => {
  if (!locals.user) {
    return { reports: [] };
  }

  const reportType = url.searchParams.get('type') || 'overview';
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  try {
    const now = new Date();
    const defaultStart = startOfMonth(now);
    const defaultEnd = endOfMonth(now);

    const dateFilter = {
      gte: startDate ? new Date(startDate) : defaultStart,
      lte: endDate ? new Date(endDate) : defaultEnd
    };

    switch (reportType) {
      case 'sales':
        return await generateSalesReport(dateFilter);
      case 'inventory':
        return await generateInventoryReport();
      case 'products':
        return await generateProductsReport(dateFilter);
      case 'employees':
        return await generateEmployeesReport(dateFilter);
      default:
        return await generateOverviewReport(dateFilter);
    }
  } catch (error) {
    console.error('Reports error:', error);
    return { error: 'Failed to generate report' };
  }
};

async function generateOverviewReport(dateFilter: any) {
  const [salesData, inventoryData, topProducts] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: dateFilter },
      _sum: { netAmount: true },
      _count: true
    }),
    prisma.product.aggregate({
      _sum: { quantity: true },
      _count: true
    }),
    prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { createdAt: dateFilter } },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    })
  ]);

  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true }
      });
      return { ...item, product };
    })
  );

  return {
    type: 'overview',
    data: {
      sales: salesData,
      inventory: inventoryData,
      topProducts: topProductsWithDetails
    }
  };
}

async function generateSalesReport(dateFilter: any) {
  const salesData = await prisma.sale.findMany({
    where: { createdAt: dateFilter },
    include: {
      customer: true,
      user: { select: { name: true } },
      items: {
        include: {
          product: { select: { nameEn: true, nameAr: true, sku: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    type: 'sales',
    data: { sales: salesData }
  };
}

async function generateInventoryReport() {
  const inventoryData = await prisma.product.findMany({
    include: {
      category: true,
      _count: {
        select: { inventoryHistory: true }
      }
    },
    orderBy: { quantity: 'asc' }
  });

  return {
    type: 'inventory',
    data: { inventory: inventoryData }
  };
}

async function generateProductsReport(dateFilter: any) {
  const productsData = await prisma.product.findMany({
    include: {
      category: true,
      saleItems: {
        where: { sale: { createdAt: dateFilter } },
        select: { quantity: true, total: true }
      }
    }
  });

  return {
    type: 'products',
    data: { products: productsData }
  };
}

async function generateEmployeesReport(dateFilter: any) {
  const employeesData = await prisma.employee.findMany({
    orderBy: [
      { isActive: 'desc' },
      { nameEn: 'asc' }
    ]
  });

  return {
    type: 'employees',
    data: { employees: employeesData }
  };
}