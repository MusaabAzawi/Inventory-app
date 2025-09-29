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
  employeeId: z.string().min(1),
  salaryPeriod: z.string().min(1),
  salaryType: z.enum(['MONTHLY', 'WEEKLY', 'DAILY', 'BONUS', 'OVERTIME']),
});

export const load: PageServerLoad = async ({ locals, request }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }

  try {
    const currencies = ['USD', 'IQD', 'SAR', 'AED', 'EUR'];
    
    // Get user's preferred language for salary type labels
    const acceptLanguage = request.headers.get('accept-language') || '';
    const isArabic = locals.user.preferredLanguage === 'ar' || acceptLanguage.includes('ar');
    
    const salaryTypes = [
      { id: 'MONTHLY', label: isArabic ? 'راتب شهري' : 'Monthly Salary' },
      { id: 'WEEKLY', label: isArabic ? 'راتب أسبوعي' : 'Weekly Salary' },
      { id: 'DAILY', label: isArabic ? 'أجر يومي' : 'Daily Wage' },
      { id: 'BONUS', label: isArabic ? 'مكافأة' : 'Bonus Payment' },
      { id: 'OVERTIME', label: isArabic ? 'أجر إضافي' : 'Overtime Payment' }
    ];
    
    // Get employees from the Employee model
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        email: true,
        position: true,
        salary: true,
        remainingSalary: true,
        lastPaymentDate: true
      },
      where: { isActive: true },
      orderBy: { nameEn: 'asc' }
    });
    
    return {
      currencies,
      defaultCurrency: 'IQD',
      salaryTypes,
      employees
    };
  } catch (error) {
    console.error('Error loading salary page:', error);
    return {
      currencies: ['USD', 'IQD'],
      defaultCurrency: 'IQD',
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
      const currency = formData.get('currency')?.toString() || 'IQD';
      const exchangeRate = parseFloat(formData.get('exchangeRate')?.toString() || '1');
      const description = formData.get('description')?.toString() || '';
      const referenceId = formData.get('referenceId')?.toString() || undefined;
      const employeeId = formData.get('employeeId')?.toString() || '';
      const salaryPeriod = formData.get('salaryPeriod')?.toString() || '';
      const salaryType = formData.get('salaryType')?.toString() as 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'BONUS' | 'OVERTIME' || 'MONTHLY';

      const validatedData = salarySchema.parse({
        amount,
        currency,
        exchangeRate,
        description,
        referenceId: referenceId || undefined,
        employeeId,
        salaryPeriod,
        salaryType,
      });

      // Get employee details for description
      const employee = await prisma.employee.findUnique({
        where: { id: validatedData.employeeId }
      });

      if (!employee) {
        return fail(400, { error: 'Employee not found' });
      }

      // Initialize remaining salary if not set (first payment or new month)
      let currentRemainingSalary = employee.remainingSalary;

      // If it's a new month or no remaining salary is set, reset to full salary
      const now = new Date();
      const isNewMonth = !employee.lastPaymentDate ||
        (employee.lastPaymentDate.getMonth() !== now.getMonth() ||
         employee.lastPaymentDate.getFullYear() !== now.getFullYear());

      if (isNewMonth && validatedData.salaryType === 'MONTHLY') {
        // Reset to full salary for new month
        currentRemainingSalary = employee.salary;
      } else if (currentRemainingSalary === null || currentRemainingSalary === undefined) {
        // If no remaining salary is set, use the full salary
        currentRemainingSalary = employee.salary;
      }

      // Validate that the payment doesn't exceed remaining salary
      if (currentRemainingSalary !== null && validatedData.amount > currentRemainingSalary) {
        return fail(400, {
          error: `Payment amount (${validatedData.amount} ${validatedData.currency}) exceeds remaining salary (${currentRemainingSalary} ${validatedData.currency})`
        });
      }

      // Calculate new remaining salary
      const newRemainingSalary = currentRemainingSalary !== null ? currentRemainingSalary - validatedData.amount : null;

      // Create transaction and update employee in a database transaction
      await prisma.$transaction(async (tx) => {
        // Create the cash transaction
        await tx.cashTransaction.create({
          data: {
            type: 'SALARY',
            amount: validatedData.amount,
            currency: validatedData.currency,
            exchangeRate: validatedData.exchangeRate,
            description: `${validatedData.salaryType} salary for ${employee.nameEn} - ${validatedData.salaryPeriod}: ${validatedData.description}`,
            referenceId: validatedData.referenceId,
            userId: locals.user.id,
            employeeId: validatedData.employeeId,
            status: 'COMPLETED'
          }
        });

        // Update employee's remaining salary and last payment date
        await tx.employee.update({
          where: { id: validatedData.employeeId },
          data: {
            remainingSalary: newRemainingSalary,
            lastPaymentDate: now
          }
        });
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