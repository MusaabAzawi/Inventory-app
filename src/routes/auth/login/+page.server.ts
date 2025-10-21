// src/routes/auth/login/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createSessionToken } from '$lib/server/auth';
import { prisma } from '$lib/server/db';
import bcrypt from 'bcrypt';
import { loginSchema } from '$lib/utils/validators';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, '/dashboard');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    // Validate that form fields are present
    if (!email || !password) {
      return fail(400, {
        email: email?.toString() || '',
        error: 'auth.invalidCredentials'
      });
    }

    const emailStr = email.toString().trim();
    const passwordStr = password.toString();

    // Validate input format
    try {
      const validation = loginSchema.safeParse({ email: emailStr, password: passwordStr });

      if (!validation.success) {
        return fail(400, {
          email: emailStr,
          error: 'auth.invalidCredentials'
        });
      }

      const { email: validEmail, password: validPassword } = validation.data;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: validEmail }
      });

      // Verify credentials
      if (!user) {
        return fail(400, {
          email: validEmail,
          error: 'auth.invalidCredentials'
        });
      }

      const isPasswordValid = await bcrypt.compare(validPassword, user.password);

      if (!isPasswordValid) {
        return fail(400, {
          email: validEmail,
          error: 'auth.invalidCredentials'
        });
      }

      // Create session token
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
      // Re-throw redirect errors
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      // Log unexpected errors in development
      console.error('Login error:', error);

      return fail(400, {
        email: emailStr,
        error: 'auth.invalidCredentials'
      });
    }
  }
};