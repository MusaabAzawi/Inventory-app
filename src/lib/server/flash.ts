import type { Cookies } from '@sveltejs/kit';

export interface FlashMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

const FLASH_COOKIE_NAME = 'flash_message';

export function setFlash(cookies: Cookies, message: FlashMessage) {
  cookies.set(FLASH_COOKIE_NAME, JSON.stringify(message), {
    path: '/',
    httpOnly: false, // Allow client-side access
    maxAge: 60, // Expire after 1 minute
    sameSite: 'lax'
  });
}

export function getFlash(cookies: Cookies): FlashMessage | null {
  const flash = cookies.get(FLASH_COOKIE_NAME);
  if (flash) {
    try {
      // Delete the flash message after reading
      cookies.delete(FLASH_COOKIE_NAME, { path: '/' });
      return JSON.parse(flash);
    } catch {
      return null;
    }
  }
  return null;
}