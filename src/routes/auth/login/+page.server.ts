import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
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
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    try {
      const { email: validEmail, password: validPassword } = loginSchema.parse({ email, password });

      const user = await prisma.user.findUnique({
        where: { email: validEmail }
      });

      if (!user || !await bcrypt.compare(validPassword, user.password)) {
        return fail(400, {
          email: validEmail,
          error: 'auth.invalidCredentials'
        });
      }

      const session = await lucia.createSession(user.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
      });

      throw redirect(302, '/dashboard');
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      return fail(400, {
        email,
        error: 'auth.invalidCredentials'
      });
    }
  }
};