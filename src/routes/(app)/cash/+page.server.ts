// src/routes/(app)/cash/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return {
      transactions: [],
      stats: null
    };
  }

  try {
    const [transactions, statsData] = await Promise.all([
      // Get recent cash transactions
      prisma.cashTransaction.findMany({
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),

      // Get transaction statistics
      prisma.cashTransaction.groupBy({
        by: ['type'],
        _sum: {
          amount: true
        },
        _count: {
          _all: true
        }
      })
    ]);

    // Calculate stats
    const totalReceipts = statsData
      .filter(stat => stat.type === 'RECEIPT')
      .reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);

    const totalPayments = statsData
      .filter(stat => ['PAYMENT', 'SALARY', 'EXPENSE'].includes(stat.type))
      .reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todaysTransactions = await prisma.cashTransaction.count({
      where: {
        createdAt: {
          gte: startOfToday
        }
      }
    });

    return {
      transactions,
      stats: {
        totalReceipts,
        totalPayments,
        netCashFlow: totalReceipts - totalPayments,
        todaysTransactions
      }
    };
  } catch (error) {
    console.error('Error loading cash data:', error);
    return {
      transactions: [],
      stats: null
    };
  }
};