import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';
import { currentCurrency } from '$lib/stores/currency';
import { formatCurrency, formatCurrencyWithConversion } from './currency';

/**
 * Format currency amount using the current selected currency from the store
 * Assumes the input amount is in IQD (the database default) unless specified otherwise
 */
export function formatAmount(amount: number, storedCurrency: string = 'IQD'): string {
  const current = get(currentCurrency);
  const currentLocale = get(locale) || 'en';

  if (storedCurrency === current.code) {
    // No conversion needed - just format
    return formatCurrency(amount, current.code, currentLocale);
  } else {
    // Convert from stored currency to display currency
    return formatCurrencyWithConversion(amount, storedCurrency, current.code, currentLocale);
  }
}

/**
 * Format currency amount for display with automatic currency detection
 * This is the main function that should be used throughout the app
 */
export function displayAmount(amount: number): string {
  return formatAmount(amount, 'USD'); // Default: amounts are stored in USD
}

/**
 * Format currency amount when you know the stored currency explicitly
 */
export function displayAmountFrom(amount: number, fromCurrency: string): string {
  return formatAmount(amount, fromCurrency);
}