/**
 * Financial Currency & Precision Utilities
 * Strict integer minor unit (cents) arithmetic to avoid floating-point issues.
 */

export function dollarsToCents(amount: number | string): number {
  if (typeof amount === 'string') {
    // Strip dollar signs, commas, extra whitespace
    const cleanStr = amount.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleanStr);
    if (isNaN(parsed) || parsed < 0) return 0;
    return Math.round(parsed * 100);
  }
  if (isNaN(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

export function centsToDollars(cents: number): number {
  if (isNaN(cents)) return 0;
  return cents / 100;
}

export function formatCurrency(
  cents: number,
  currency: 'USD' | 'EUR' | 'GBP' = 'USD',
  showSymbol: boolean = true
): string {
  const dollars = centsToDollars(cents);
  const formatted = new Intl.NumberFormat('en-US', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);

  return formatted;
}

export function formatNumberMasked(accountNumber: string): string {
  if (!accountNumber) return '••••';
  const last4 = accountNumber.slice(-4);
  return `•••• ${last4}`;
}
