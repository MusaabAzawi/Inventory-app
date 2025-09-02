import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return { accountBalances: [] };
  }

  try {
    // Get customer balances from sales
    const customerBalances = await prisma.customer.findMany({
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        phone: true,
        email: true,
        sales: {
          select: {
            netAmount: true,
            paymentStatus: true
          }
        }
      }
    });

    // Get supplier balances from purchases
    const supplierBalances = await prisma.supplier.findMany({
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        phone: true,
        email: true,
        purchases: {
          select: {
            netAmount: true,
            paymentStatus: true
          }
        }
      }
    });

    // Calculate customer balances
    const customers = customerBalances.map(customer => {
      const totalSales = customer.sales.reduce((sum, sale) => sum + sale.netAmount, 0);
      const paidAmount = customer.sales
        .filter(sale => sale.paymentStatus === 'PAID')
        .reduce((sum, sale) => sum + sale.netAmount, 0);
      const outstandingAmount = totalSales - paidAmount;

      return {
        id: customer.id,
        nameEn: customer.nameEn,
        nameAr: customer.nameAr,
        phone: customer.phone,
        email: customer.email,
        type: 'customer' as const,
        totalAmount: totalSales,
        paidAmount,
        outstandingAmount
      };
    });

    // Calculate supplier balances
    const suppliers = supplierBalances.map(supplier => {
      const totalPurchases = supplier.purchases.reduce((sum, purchase) => sum + purchase.netAmount, 0);
      const paidAmount = supplier.purchases
        .filter(purchase => purchase.paymentStatus === 'PAID')
        .reduce((sum, purchase) => sum + purchase.netAmount, 0);
      const outstandingAmount = totalPurchases - paidAmount;

      return {
        id: supplier.id,
        nameEn: supplier.nameEn,
        nameAr: supplier.nameAr,
        phone: supplier.phone,
        email: supplier.email,
        type: 'supplier' as const,
        totalAmount: totalPurchases,
        paidAmount,
        outstandingAmount
      };
    });

    // Calculate summary
    const customerTotalOutstanding = customers.reduce((sum, c) => sum + c.outstandingAmount, 0);
    const supplierTotalOutstanding = suppliers.reduce((sum, s) => sum + s.outstandingAmount, 0);

    return {
      accountBalances: [...customers, ...suppliers],
      summary: {
        customerOutstanding: customerTotalOutstanding,
        supplierOutstanding: supplierTotalOutstanding,
        netBalance: customerTotalOutstanding - supplierTotalOutstanding
      }
    };
  } catch (error) {
    console.error('Account balances error:', error);
    return { 
      accountBalances: [],
      summary: {
        customerOutstanding: 0,
        supplierOutstanding: 0,
        netBalance: 0
      }
    };
  }
};