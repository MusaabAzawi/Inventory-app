// src/routes/auth/login/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createSessionToken } from '$lib/server/auth';
import { prisma } from '$lib/server/db';
import { dev } from '$app/environment';
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
    const emailRaw = formData.get('email');
    const passwordRaw = formData.get('password');

    // Explicit validation that fields exist
    if (!emailRaw || !passwordRaw) {
      return fail(400, {
        email: emailRaw?.toString() || '',
        error: 'auth.invalidCredentials'
      });
    }

    const email = emailRaw.toString().trim();
    const password = passwordRaw.toString();

    try {
      // Validate input format
      const validation = loginSchema.safeParse({ email, password });

      if (!validation.success) {
        return fail(400, {
          email,
          error: 'auth.invalidCredentials'
        });
      }

      const { email: validEmail, password: validPassword } = validation.data;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: validEmail }
      });

      if (!user) {
        return fail(400, {
          email: validEmail,
          error: 'auth.invalidCredentials'
        });
      }

      // Verify password
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
      // Re-throw redirect errors (they're not actual errors)
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      // Log unexpected errors in development
      if (dev) {
        console.error('Login error:', error);
      }

      return fail(400, {
        email,
        error: 'auth.invalidCredentials'
      });
    }
  }
};