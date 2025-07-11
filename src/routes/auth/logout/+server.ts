import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  throw redirect(302, '/auth/login');
};