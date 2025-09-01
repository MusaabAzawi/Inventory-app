import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  exchangeRate: z.number().positive(),
  description: z.string().min(1),
  referenceId: z.string().optional(),
  paymentType: z.enum(['PAYMENT', 'EXPENSE']),
});

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }

  try {
    const currencies = ['USD', 'SAR', 'AED', 'EUR'];
    const paymentTypes = [
      { id: 'PAYMENT', label: 'Supplier Payment' },
      { id: 'EXPENSE', label: 'General Expense' }
    ];
    
    // Get suppliers for payment references
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nameEn: true,
        nameAr: true
      },
      orderBy: { nameEn: 'asc' }
    });
    
    return {
      currencies,
      defaultCurrency: 'USD',
      paymentTypes,
      suppliers
    };
  } catch (error) {
    console.error('Error loading payment page:', error);
    return {
      currencies: ['USD'],
      defaultCurrency: 'USD',
      paymentTypes: [
        { id: 'PAYMENT', label: 'Supplier Payment' },
        { id: 'EXPENSE', label: 'General Expense' }
      ],
      suppliers: []
    };
  }
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    try {
      const formData = await request.formData();
      const amount = parseFloat(formData.get('amount')?.toString() || '0');
      const currency = formData.get('currency')?.toString() || 'USD';
      const exchangeRate = parseFloat(formData.get('exchangeRate')?.toString() || '1');
      const description = formData.get('description')?.toString() || '';
      const referenceId = formData.get('referenceId')?.toString() || undefined;
      const paymentType = formData.get('paymentType')?.toString() as 'PAYMENT' | 'EXPENSE' || 'PAYMENT';

      const validatedData = paymentSchema.parse({
        amount,
        currency,
        exchangeRate,
        description,
        referenceId: referenceId || undefined,
        paymentType,
      });

      await prisma.cashTransaction.create({
        data: {
          type: validatedData.paymentType,
          amount: validatedData.amount,
          currency: validatedData.currency,
          exchangeRate: validatedData.exchangeRate,
          description: validatedData.description,
          referenceId: validatedData.referenceId,
          userId: locals.user.id,
          status: 'COMPLETED'
        }
      });

      throw redirect(302, '/cash?success=payment_created');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return fail(400, { 
          error: 'Invalid form data',
          fields: error.flatten().fieldErrors
        });
      }
      
      console.error('Error creating payment:', error);
      return fail(500, { error: 'Failed to create payment voucher' });
    }
  }
};