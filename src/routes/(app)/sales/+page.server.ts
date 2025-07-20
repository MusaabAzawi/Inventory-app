// src/routes/(app)/sales/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export const load: PageServerLoad = async ({ url }) => {
  const searchQuery = url.searchParams.get('search') || '';
  const dateFilter = url.searchParams.get('dateFilter') || 'today';
  const customerId = url.searchParams.get('customer') || '';

  // Build date filter
  let dateRange = {};
  const now = new Date();
  
  switch (dateFilter) {
    case 'today':
      dateRange = {
        gte: startOfDay(now),
        lte: endOfDay(now)
      };
      break;
    case 'week':
      dateRange = {
        gte: subDays(now, 7)
      };
      break;
    case 'month':
      dateRange = {
        gte: subDays(now, 30)
      };
      break;
  }

  // Build where clause
  const where: any = {
    createdAt: dateRange
  };

  if (searchQuery) {
    where.OR = [
      { invoiceNumber: { contains: searchQuery } },
      { customer: { nameEn: { contains: searchQuery } } },
      { customer: { nameAr: { contains: searchQuery } } }
    ];
  }

  if (customerId) {
    where.customerId = customerId;
  }

  try {
    const [sales, customers, stats] = await Promise.all([
      // Get sales with details
      prisma.sale.findMany({
        where,
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
        orderBy: { createdAt: 'desc' }
      }),
      
      // Get customers for filter
      prisma.customer.findMany({
        orderBy: { nameEn: 'asc' }
      }),

      // Get stats
      prisma.sale.aggregate({
        where,
        _sum: {
          netAmount: true,
          discount: true
        },
        _count: true
      })
    ]);

    return {
      sales,
      customers,
      stats: {
        totalSales: stats._count,
        totalRevenue: stats._sum.netAmount || 0,
        totalDiscount: stats._sum.discount || 0
      },
      filters: {
        search: searchQuery,
        dateFilter,
        customerId
      }
    };
  } catch (error) {
    console.error('Sales load error:', error);
    return {
      sales: [],
      customers: [],
      stats: {
        totalSales: 0,
        totalRevenue: 0,
        totalDiscount: 0
      },
      filters: {
        search: '',
        dateFilter: 'today',
        customerId: ''
      }
    };
  }
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const saleId = formData.get('id')?.toString();

    if (!saleId) {
      return fail(400, { error: 'Sale ID is required' });
    }

    try {
      // Get sale details first
      const sale = await prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          items: true
        }
      });

      if (!sale) {
        return fail(404, { error: 'Sale not found' });
      }

      // Start transaction
      await prisma.$transaction(async (tx) => {
        // Restore product quantities
        for (const item of sale.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          });

          // Log inventory history
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (product) {
            await tx.inventoryHistory.create({
              data: {
                productId: item.productId,
                userId: locals.user!.id,
                action: 'SALE_CANCELLED',
                previousQuantity: product.quantity - item.quantity,
                newQuantity: product.quantity,
                quantityChange: item.quantity,
                reason: `Sale ${sale.invoiceNumber} cancelled`
              }
            });
          }
        }

        // Delete sale (items will cascade)
        await tx.sale.delete({
          where: { id: saleId }
        });
      });

      return { success: true };
    } catch (error) {
      console.error('Delete sale error:', error);
      return fail(500, { error: 'Failed to delete sale' });
    }
  }
};