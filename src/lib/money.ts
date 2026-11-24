import type { Money } from '../types'

/**
 * Formats integer minor units for display. The decimal point is placed by
 * string manipulation using the currency's own fraction digits (from
 * `Intl.NumberFormat#resolvedOptions`), so no float arithmetic touches the
 * amount; the only conversion to a number is the final hand-off to `format`,
 * which is exact for the <= 15-digit amounts the parser admits.
 */

const formatters = new Map<string, Intl.NumberFormat | null>()

const currencyFormatter = (currency: string): Intl.NumberFormat | null => {
  const cached = formatters.get(currency)
  if (cached !== undefined) return cached
  let formatter: Intl.NumberFormat | null
  try {
    formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency })
  } catch {
    // Unknown ISO code in this runtime: RangeError. Cache the miss too.
    formatter = null
  }
  formatters.set(currency, formatter)
  return formatter
}

/** '250000', 2 -> '2500.00'; '5', 2 -> '0.05'; '1500', 0 -> '1500'. Input must be /^\d+$/. */
export const minorToDecimalString = (amountMinor: string, fractionDigits: number): string => {
  const digits = amountMinor.replace(/^0+(?=\d)/, '')
  if (fractionDigits <= 0) return digits
  const padded = digits.padStart(fractionDigits + 1, '0')
  const cut = padded.length - fractionDigits
  return `${padded.slice(0, cut)}.${padded.slice(cut)}`
}

export const formatMoney = (money: Money): string => {
  const formatter = currencyFormatter(money.currency)
  if (!formatter) {
    // No Intl data for the code: assume 2 fraction digits (the ISO 4217 default).
    return `${money.currency} ${minorToDecimalString(money.amountMinor, 2)}`
  }
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2
  return formatter.format(Number(minorToDecimalString(money.amountMinor, fractionDigits)))
}
