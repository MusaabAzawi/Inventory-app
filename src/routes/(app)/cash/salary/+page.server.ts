import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const salarySchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  exchangeRate: z.number().positive(),
  description: z.string().min(1),
  referenceId: z.string().optional(),
  employeeName: z.string().min(1),
  salaryPeriod: z.string().min(1),
  salaryType: z.enum(['MONTHLY', 'WEEKLY', 'DAILY', 'BONUS', 'OVERTIME']),
});

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }

  try {
    const currencies = ['USD', 'SAR', 'AED', 'EUR'];
    const salaryTypes = [
      { id: 'MONTHLY', label: 'Monthly Salary' },
      { id: 'WEEKLY', label: 'Weekly Salary' },
      { id: 'DAILY', label: 'Daily Wage' },
      { id: 'BONUS', label: 'Bonus Payment' },
      { id: 'OVERTIME', label: 'Overtime Payment' }
    ];
    
    // Get all users as potential employees
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { name: 'asc' }
    });
    
    return {
      currencies,
      defaultCurrency: 'USD',
      salaryTypes,
      employees
    };
  } catch (error) {
    console.error('Error loading salary page:', error);
    return {
      currencies: ['USD'],
      defaultCurrency: 'USD',
      salaryTypes: [
        { id: 'MONTHLY', label: 'Monthly Salary' },
        { id: 'WEEKLY', label: 'Weekly Salary' },
        { id: 'DAILY', label: 'Daily Wage' },
        { id: 'BONUS', label: 'Bonus Payment' },
        { id: 'OVERTIME', label: 'Overtime Payment' }
      ],
      employees: []
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
      const employeeName = formData.get('employeeName')?.toString() || '';
      const salaryPeriod = formData.get('salaryPeriod')?.toString() || '';
      const salaryType = formData.get('salaryType')?.toString() as 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'BONUS' | 'OVERTIME' || 'MONTHLY';

      const validatedData = salarySchema.parse({
        amount,
        currency,
        exchangeRate,
        description,
        referenceId: referenceId || undefined,
        employeeName,
        salaryPeriod,
        salaryType,
      });

      await prisma.cashTransaction.create({
        data: {
          type: 'SALARY',
          amount: validatedData.amount,
          currency: validatedData.currency,
          exchangeRate: validatedData.exchangeRate,
          description: `${validatedData.salaryType} salary for ${validatedData.employeeName} - ${validatedData.salaryPeriod}: ${validatedData.description}`,
          referenceId: validatedData.referenceId,
          userId: locals.user.id,
          status: 'COMPLETED'
        }
      });

      throw redirect(302, '/cash?success=salary_created');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return fail(400, { 
          error: 'Invalid form data',
          fields: error.flatten().fieldErrors
        });
      }
      
      console.error('Error creating salary payment:', error);
      return fail(500, { error: 'Failed to create salary payment' });
    }
  }
};