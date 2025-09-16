// src/lib/utils/currency.ts

export interface Currency {
  code: string;
  nameEn: string;
  nameAr: string;
  symbol: string;
  exchangeRate: number; // Rate to USD
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: 'USD',
    nameEn: 'US Dollar',
    nameAr: 'دولار أمريكي',
    symbol: '$',
    exchangeRate: 1.0
  },
  {
    code: 'IQD',
    nameEn: 'Iraqi Dinar',
    nameAr: 'دينار عراقي',
    symbol: 'د.ع',
    exchangeRate: 1310.0 // Example rate - should be fetched from API in production
  }
];

export function getCurrencyByCode(code: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find(currency => currency.code === code);
}

export function formatCurrency(amount: number, currencyCode: string = 'IQD', locale: string = 'en'): string {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) {
    throw new Error(`Unsupported currency code: ${currencyCode}`);
  }

  // For Iraqi Dinar, use Arabic-Indic numerals when locale is Arabic
  if (currencyCode === 'IQD' && locale === 'ar') {
    const formatted = new Intl.NumberFormat('ar-IQ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return `${formatted} ${currency.symbol}`;
  }

  // For other currencies or English locale
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'decimal',
    minimumFractionDigits: currencyCode === 'IQD' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'IQD' ? 0 : 2
  }).format(amount);

  return locale === 'ar'
    ? `${formatted} ${currency.symbol}`
    : `${currency.symbol}${formatted}`;
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const fromCurr = getCurrencyByCode(fromCurrency);
  const toCurr = getCurrencyByCode(toCurrency);
  
  if (!fromCurr || !toCurr) {
    throw new Error('Invalid currency codes');
  }

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromCurr.exchangeRate;
  return usdAmount * toCurr.exchangeRate;
}

export function getDefaultCurrency(): string {
  return 'IQD'; // Changed default to Iraqi Dinar as requested
}

export function convertAmountToCurrentCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  return convertCurrency(amount, fromCurrency, toCurrency);
}

export function formatCurrencyWithConversion(
  amount: number,
  storeCurrency: string = 'USD',
  displayCurrency: string = 'IQD',
  locale: string = 'en'
): string {
  const convertedAmount = convertAmountToCurrentCurrency(amount, storeCurrency, displayCurrency);
  return formatCurrency(convertedAmount, displayCurrency, locale);
}