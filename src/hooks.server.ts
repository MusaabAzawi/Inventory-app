import type { Handle } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { validateSessionToken } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

const protectedRoutes = ['/dashboard', '/inventory', '/sales', '/purchases', '/cash', '/accounts', '/reports', '/settings'];

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');
  
  if (session) {
    const tokenData = validateSessionToken(session);
    if (tokenData) {
      const user = await prisma.user.findUnique({
        where: { id: tokenData.userId }
      });
      
      if (user) {
        event.locals.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          preferredLanguage: user.preferredLanguage
        };
      }
    }
  }
  
  // Protect routes
  if (protectedRoutes.some(route => event.url.pathname.startsWith(route))) {
    if (!event.locals.user) {
      throw redirect(302, '/auth/login');
    }
  }
  
  // Redirect logged in users away from auth pages
  if (event.url.pathname.startsWith('/auth/') && event.locals.user) {
    throw redirect(302, '/dashboard');
  }
  
  return resolve(event);
};