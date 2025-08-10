// src/routes/(app)/accounts/suppliers/new/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { z } from 'zod';

const supplierSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  address: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }
  
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const data = {
      nameEn: formData.get('nameEn')?.toString() || '',
      nameAr: formData.get('nameAr')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      address: formData.get('address')?.toString() || ''
    };

    try {
      // Validate the data
      const validationResult = supplierSchema.safeParse(data);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message);
        return fail(400, {
          ...data,
          error: errors.join(', ')
        });
      }

      const validatedData = validationResult.data;

      // Check if email already exists (if provided)
      if (validatedData.email) {
        const existingSupplier = await prisma.supplier.findUnique({
          where: { email: validatedData.email }
        });

        if (existingSupplier) {
          return fail(400, {
            ...data,
            error: 'A supplier with this email already exists'
          });
        }
      }

      // Create the supplier
      await prisma.supplier.create({
        data: {
          nameEn: validatedData.nameEn,
          nameAr: validatedData.nameAr,
          phone: validatedData.phone || null,
          email: validatedData.email || null,
          address: validatedData.address || null,
          isActive: true
        }
      });

      throw redirect(302, '/accounts?tab=suppliers');
    } catch (error) {
      // Handle redirect
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      console.error('Supplier creation error:', error);
      return fail(500, {
        ...data,
        error: 'Failed to create supplier. Please try again.'
      });
    }
  }
};