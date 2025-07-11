import { browser } from '$app/environment';
import { init, register, locale, dictionary } from 'svelte-i18n';

const defaultLocale = 'ar';

register('en', () => import('./en.json'));
register('ar', () => import('./ar.json'));

init({
  fallbackLocale: defaultLocale,
  initialLocale: browser ? window.localStorage.getItem('locale') || defaultLocale : defaultLocale,
});

// Helper function to set locale and save to localStorage
export function setLocale(newLocale: string) {
  locale.set(newLocale);
  if (browser) {
    localStorage.setItem('locale', newLocale);
    document.documentElement.setAttribute('dir', newLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLocale);
  }
}

// Initialize direction on load
if (browser) {
  const currentLocale = localStorage.getItem('locale') || defaultLocale;
  document.documentElement.setAttribute('dir', currentLocale === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', currentLocale);
}

export { locale, dictionary };
// Remove the incorrect isLoading export or implement a proper loading store if needed