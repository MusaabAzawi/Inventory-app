// src/routes/(app)/cash/[id]/edit/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { z } from 'zod';

const cashTransactionSchema = z.object({
  type: z.enum(['RECEIPT', 'PAYMENT', 'SALARY', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  exchangeRate: z.number().positive('Exchange rate must be positive'),
  description: z.string().optional(),
  referenceId: z.string().optional(),
  employeeId: z.string().optional(),
  expenseCategoryId: z.string().optional(),
  status: z.enum(['COMPLETED', 'PENDING', 'CANCELLED']).default('COMPLETED')
});

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const transactionId = params.id;

  try {
    // Load transaction
    const transaction = await prisma.cashTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: { name: true, email: true }
        },
        employee: {
          select: { id: true, nameEn: true, nameAr: true }
        },
        expenseCategory: {
          select: { id: true, nameEn: true, nameAr: true }
        }
      }
    });

    if (!transaction) {
      throw error(404, 'Transaction not found');
    }

    // Check if transaction can be edited (within 24 hours and not of type RECEIPT)
    const transactionDate = new Date(transaction.createdAt);
    const hoursDiff = (Date.now() - transactionDate.getTime()) / (1000 * 60 * 60);
    const canEdit = hoursDiff <= 24 && transaction.type !== 'RECEIPT' && transaction.status === 'COMPLETED';

    if (!canEdit) {
      throw error(403, 'Transaction cannot be edited');
    }

    // Load supporting data
    const [employees, expenseCategories] = await Promise.all([
      prisma.employee.findMany({
        where: { isActive: true },
        select: { id: true, nameEn: true, nameAr: true },
        orderBy: { nameEn: 'asc' }
      }),
      prisma.expenseCategory.findMany({
        where: { isActive: true },
        select: { id: true, nameEn: true, nameAr: true },
        orderBy: { nameEn: 'asc' }
      })
    ]);

    return {
      transaction,
      employees,
      expenseCategories
    };
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    console.error('Error loading cash transaction for edit:', err);
    throw error(500, 'Failed to load transaction details');
  }
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const transactionId = params.id;

    // Check if transaction exists and can be edited
    const existingTransaction = await prisma.cashTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!existingTransaction) {
      return fail(404, { error: 'Transaction not found' });
    }

    // Check edit permissions
    const transactionDate = new Date(existingTransaction.createdAt);
    const hoursDiff = (Date.now() - transactionDate.getTime()) / (1000 * 60 * 60);
    const canEdit = hoursDiff <= 24 && existingTransaction.type !== 'RECEIPT' && existingTransaction.status === 'COMPLETED';

    if (!canEdit) {
      return fail(403, { error: 'Transaction cannot be edited' });
    }

    const formData = await request.formData();
    const data = {
      type: formData.get('type')?.toString() || '',
      amount: parseFloat(formData.get('amount')?.toString() || '0'),
      currency: formData.get('currency')?.toString() || 'IQD',
      exchangeRate: parseFloat(formData.get('exchangeRate')?.toString() || '1'),
      description: formData.get('description')?.toString() || '',
      referenceId: formData.get('referenceId')?.toString() || '',
      employeeId: formData.get('employeeId')?.toString() || '',
      expenseCategoryId: formData.get('expenseCategoryId')?.toString() || '',
      status: formData.get('status')?.toString() || 'COMPLETED'
    };

    try {
      const validatedData = cashTransactionSchema.parse({
        ...data,
        description: data.description || undefined,
        referenceId: data.referenceId || undefined,
        employeeId: data.employeeId || undefined,
        expenseCategoryId: data.expenseCategoryId || undefined
      });

      await prisma.cashTransaction.update({
        where: { id: transactionId },
        data: {
          type: validatedData.type,
          amount: validatedData.amount,
          currency: validatedData.currency,
          exchangeRate: validatedData.exchangeRate,
          description: validatedData.description,
          referenceId: validatedData.referenceId,
          employeeId: validatedData.employeeId,
          expenseCategoryId: validatedData.expenseCategoryId,
          status: validatedData.status
        }
      });

      throw redirect(302, `/cash/${transactionId}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return fail(400, {
          ...data,
          error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
        });
      }

      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      console.error('Cash transaction update error:', error);
      return fail(500, {
        ...data,
        error: 'Failed to update transaction'
      });
    }
  }
};