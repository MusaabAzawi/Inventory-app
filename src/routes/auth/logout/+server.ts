import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { validateSessionToken } from '$lib/server/auth';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ cookies }) => {
  const session = cookies.get('session');
  
  if (session) {
    try {
      const tokenData = validateSessionToken(session);
      if (tokenData) {
        // In production, you'd want to maintain a session blacklist or database sessions
        // For now, we'll just delete the cookie
        console.log(`User ${tokenData.userId} logged out at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  // Delete the session cookie with secure options
  cookies.delete('session', { 
    path: '/', 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  // Also try to delete with different path configurations for cleanup
  cookies.delete('session', { path: '' });
  
  throw redirect(302, '/auth/login');
};

// Also support GET requests for logout links
export const GET: RequestHandler = async ({ cookies }) => {
  const session = cookies.get('session');
  
  if (session) {
    try {
      const tokenData = validateSessionToken(session);
      if (tokenData) {
        console.log(`User ${tokenData.userId} logged out at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  // Delete the session cookie with secure options
  cookies.delete('session', { 
    path: '/', 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  cookies.delete('session', { path: '' });
  
  throw redirect(302, '/auth/login');
};