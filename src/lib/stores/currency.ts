import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { SUPPORTED_CURRENCIES, type Currency } from '$lib/utils/currency';

interface CurrencyState {
  selectedCurrency: string;
  exchangeRates: Record<string, number>;
  lastUpdated: Date | null;
}

const DEFAULT_CURRENCY = 'IQD';

function createCurrencyStore() {
  // Initialize state from localStorage or defaults
  const initialState: CurrencyState = {
    selectedCurrency: DEFAULT_CURRENCY,
    exchangeRates: SUPPORTED_CURRENCIES.reduce((acc, curr) => {
      acc[curr.code] = curr.exchangeRate;
      return acc;
    }, {} as Record<string, number>),
    lastUpdated: null
  };

  // Load from localStorage if available
  if (browser) {
    // First check for defaultCurrency setting
    const defaultCurrency = localStorage.getItem('defaultCurrency');
    if (defaultCurrency) {
      initialState.selectedCurrency = defaultCurrency;
    }

    // Then load full currency store if available
    const stored = localStorage.getItem('currency-store');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        Object.assign(initialState, parsed);
        // Ensure defaultCurrency takes precedence
        if (defaultCurrency) {
          initialState.selectedCurrency = defaultCurrency;
        }
      } catch (e) {
        console.warn('Failed to parse stored currency data');
      }
    }
  }

  const { subscribe, set, update } = writable<CurrencyState>(initialState);

  return {
    subscribe,

    // Set selected currency
    setCurrency: (currencyCode: string) => {
      update(state => {
        const newState = { ...state, selectedCurrency: currencyCode };
        if (browser) {
          localStorage.setItem('currency-store', JSON.stringify(newState));
        }
        return newState;
      });
    },

    // Update exchange rates
    updateExchangeRates: (rates: Record<string, number>) => {
      update(state => {
        const newState = {
          ...state,
          exchangeRates: { ...state.exchangeRates, ...rates },
          lastUpdated: new Date()
        };
        if (browser) {
          localStorage.setItem('currency-store', JSON.stringify(newState));
        }
        return newState;
      });
    },

    // Get exchange rate for currency pair
    getExchangeRate: (fromCurrency: string, toCurrency: string = 'USD'): number => {
      let rate = 1;
      update(state => {
        if (fromCurrency === toCurrency) {
          rate = 1;
        } else if (toCurrency === 'USD') {
          rate = 1 / (state.exchangeRates[fromCurrency] || 1);
        } else if (fromCurrency === 'USD') {
          rate = state.exchangeRates[toCurrency] || 1;
        } else {
          // Convert via USD
          const toUsd = 1 / (state.exchangeRates[fromCurrency] || 1);
          rate = toUsd * (state.exchangeRates[toCurrency] || 1);
        }
        return state;
      });
      return rate;
    },

    // Reset to defaults
    reset: () => {
      set(initialState);
      if (browser) {
        localStorage.removeItem('currency-store');
      }
    }
  };
}

export const currencyStore = createCurrencyStore();

// Derived store for current currency info
export const currentCurrency = {
  subscribe: (run: (value: Currency) => void) => {
    return currencyStore.subscribe(state => {
      const currency = SUPPORTED_CURRENCIES.find(c => c.code === state.selectedCurrency);
      run(currency || SUPPORTED_CURRENCIES[0]); // Fallback to USD
    });
  }
};