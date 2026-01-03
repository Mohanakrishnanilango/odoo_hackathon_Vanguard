// Currency conversion utilities
const USD_TO_INR = 83.12 // Updated exchange rate (as of current date)

export function usdToInr(usd: number): number {
  return usd * USD_TO_INR
}

export function formatCurrency(amount: number, currency: 'USD' | 'INR' = 'INR'): string {
  if (currency === 'INR') {
    const inr = usdToInr(amount)
    return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function formatCurrencyWithBoth(amount: number): string {
  const inr = usdToInr(amount)
  return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ($${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })})`
}

export const EXCHANGE_RATE = USD_TO_INR

