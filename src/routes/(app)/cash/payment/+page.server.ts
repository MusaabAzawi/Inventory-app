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
  paymentType: z.enum(['PAYMENT', 'EXPENSE', 'EMPLOYEE_PAYMENT']),
  employeeId: z.string().optional(),
});

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }

  try {
    const currencies = ['USD', 'SAR', 'AED', 'EUR', 'IQD'];
    const paymentTypes = [
      { id: 'PAYMENT', label: 'Supplier Payment' },
      { id: 'EXPENSE', label: 'General Expense' },
      { id: 'EMPLOYEE_PAYMENT', label: 'Employee Payment' }
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

    // Get employees with their remaining salary for employee payments
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        position: true,
        salary: true,
        remainingSalary: true,
        lastPaymentDate: true
      },
      orderBy: { nameEn: 'asc' }
    });

    return {
      currencies,
      defaultCurrency: 'USD',
      paymentTypes,
      suppliers,
      employees
    };
  } catch (error) {
    console.error('Error loading payment page:', error);
    return {
      currencies: ['USD'],
      defaultCurrency: 'USD',
      paymentTypes: [
        { id: 'PAYMENT', label: 'Supplier Payment' },
        { id: 'EXPENSE', label: 'General Expense' },
        { id: 'EMPLOYEE_PAYMENT', label: 'Employee Payment' }
      ],
      suppliers: [],
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
      const paymentType = formData.get('paymentType')?.toString() as 'PAYMENT' | 'EXPENSE' | 'EMPLOYEE_PAYMENT' || 'PAYMENT';
      const employeeId = formData.get('employeeId')?.toString() || undefined;

      const validatedData = paymentSchema.parse({
        amount,
        currency,
        exchangeRate,
        description,
        referenceId: referenceId || undefined,
        paymentType,
        employeeId: employeeId || undefined,
      });

      // Handle employee payment
      if (validatedData.paymentType === 'EMPLOYEE_PAYMENT' && validatedData.employeeId) {
        const employee = await prisma.employee.findUnique({
          where: { id: validatedData.employeeId }
        });

        if (!employee) {
          return fail(400, { error: 'Employee not found' });
        }

        // Check if payment exceeds remaining salary
        const remainingSalary = employee.remainingSalary || employee.salary || 0;
        if (validatedData.amount > remainingSalary) {
          return fail(400, {
            error: `Payment amount (${validatedData.amount} ${validatedData.currency}) exceeds remaining salary (${remainingSalary} ${validatedData.currency})`
          });
        }

        // Create transaction and update employee in a database transaction
        await prisma.$transaction(async (tx) => {
          // Create the cash transaction
          await tx.cashTransaction.create({
            data: {
              type: validatedData.paymentType,
              amount: validatedData.amount,
              currency: validatedData.currency,
              exchangeRate: validatedData.exchangeRate,
              description: validatedData.description,
              referenceId: validatedData.referenceId,
              userId: locals.user.id,
              employeeId: validatedData.employeeId,
              status: 'COMPLETED'
            }
          });

          // Update employee's remaining salary
          const newRemainingSalary = remainingSalary - validatedData.amount;
          await tx.employee.update({
            where: { id: validatedData.employeeId },
            data: {
              remainingSalary: newRemainingSalary,
              lastPaymentDate: new Date()
            }
          });
        });
      } else {
        // Regular payment without employee
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
      }

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