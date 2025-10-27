/**
 * Centralized formatters for Bulgarian locale
 */

/**
 * Format date in Bulgarian format (dd.mm.yyyy)
 */
export const fmtDate = (d: Date): string => {
  return new Intl.DateTimeFormat('bg-BG', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(d);
};

/**
 * Format currency in Bulgarian format
 */
export const fmtMoney = (amount: number, currency = 'BGN'): string => {
  return new Intl.NumberFormat('bg-BG', { 
    style: 'currency', 
    currency 
  }).format(amount);
};

/**
 * Format number in Bulgarian format
 */
export const fmtNumber = (n: number): string => {
  return new Intl.NumberFormat('bg-BG').format(n);
};

/**
 * Format plural strings in Bulgarian
 * Bulgarian plural rules: one when n === 1, other otherwise
 */
export const fmtPlural = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};
