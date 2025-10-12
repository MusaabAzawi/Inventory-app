import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createDarkModeStore() {
  const { subscribe, set, update } = writable<boolean>(false);

  return {
    subscribe,

    toggle: () => {
      update(isDark => {
        const newValue = !isDark;
        if (browser) {
          applyDarkMode(newValue);
        }
        return newValue;
      });
    },

    set: (value: boolean) => {
      set(value);
      if (browser) {
        applyDarkMode(value);
      }
    },

    init: () => {
      if (!browser) return;

      const stored = localStorage.getItem('darkMode');

      if (stored !== null) {
        const isDark = stored === 'true';
        set(isDark);
        applyDarkMode(isDark);
      } else {
        const isDark = false;
        set(isDark);
        applyDarkMode(isDark);
      }
    }
  };
}

function applyDarkMode(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', 'false');
  }
}

export const darkMode = createDarkModeStore();
