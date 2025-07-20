// src/routes/auth/register/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { hashPassword, createSessionToken } from '$lib/server/auth';
import { prisma } from '$lib/server/db';
import { registerSchema } from '$lib/utils/validators';
import { z } from 'zod';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, '/dashboard');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const data = {
      email: formData.get('email')?.toString() || '',
      password: formData.get('password')?.toString() || '',
      confirmPassword: formData.get('confirmPassword')?.toString() || '',
      name: formData.get('name')?.toString() || '',
      preferredLanguage: formData.get('preferredLanguage')?.toString() || 'ar'
    };

    try {
      const validatedData = registerSchema.parse(data);

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (existingUser) {
        return fail(400, {
          ...data,
          error: 'Email already registered'
        });
      }

      // Create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          preferredLanguage: validatedData.preferredLanguage,
          role: 'USER' // First user could be made ADMIN
        }
      });

      // Auto-login after registration
      const sessionToken = createSessionToken(user.id);
      
      cookies.set('session', sessionToken, {
        path: '/',
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      throw redirect(302, '/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return fail(400, {
          ...data,
          error: firstError.message
        });
      }
      
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      console.error('Registration error:', error);
      return fail(500, {
        ...data,
        error: 'Registration failed. Please try again.'
      });
    }
  }
};