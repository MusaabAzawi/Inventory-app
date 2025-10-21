import type { Handle, HandleServerError } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { validateSessionToken } from '$lib/server/auth';
import { redirect, error } from '@sveltejs/kit';
import { dev } from '$app/environment';

const protectedRoutes = ['/dashboard', '/inventory', '/sales', '/purchases', '/cash', '/accounts', '/reports', '/settings'];

export const handle: Handle = async ({ event, resolve }) => {
  const startTime = Date.now();
  const session = event.cookies.get('session');

  // Session validation
  if (session) {
    try {
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
    } catch (err) {
      // Invalid session token, clear it
      console.warn('Invalid session token detected, clearing cookie');
      event.cookies.delete('session', { path: '/' });
    }
  }

  // Route protection - check BEFORE resolving to avoid race conditions
  // This prevents conflicts with redirects thrown by actions during resolve()
  if (protectedRoutes.some(route => event.url.pathname.startsWith(route))) {
    if (!event.locals.user) {
      throw redirect(302, '/auth/login');
    }
  }

  // Redirect logged in users away from auth pages - check BEFORE resolving
  // This ensures authenticated users don't access login/register pages
  if (event.url.pathname.startsWith('/auth/') && event.locals.user) {
    throw redirect(302, '/dashboard');
  }

  // Security headers
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Add security headers for production
      if (!dev) {
        return html;
      }
      return html;
    }
  });
  
  // Add security headers
  if (!dev) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }
  
  // Log performance in development
  if (dev) {
    const duration = Date.now() - startTime;
    console.log(`${event.request.method} ${event.url.pathname} - ${duration}ms`);
  }
  
  return response;
};

// Error handling
export const handleError: HandleServerError = async ({ error, event }) => {
  const errorId = crypto.randomUUID();
  
  console.error(`[${errorId}] Error in ${event.url.pathname}:`, error);
  
  // Don't expose sensitive information in production
  if (!dev) {
    return {
      message: 'An unexpected error occurred',
      errorId
    };
  }
  
  return {
    message: (error as Error)?.message ?? 'An unexpected error occurred',
    errorId
  };
};