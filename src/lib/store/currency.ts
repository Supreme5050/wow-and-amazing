const configuredCurrency = (process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || "NGN")
  .trim()
  .toUpperCase();

const supportedCurrencies = new Set(["NGN", "USD", "GHS", "ZAR", "KES", "XOF"]);

export const STORE_CURRENCY = supportedCurrencies.has(configuredCurrency)
  ? configuredCurrency
  : "NGN";

export const STORE_LOCALE = STORE_CURRENCY === "NGN" ? "en-NG" : "en-US";

export const storeMoney = new Intl.NumberFormat(STORE_LOCALE, {
  style: "currency",
  currency: STORE_CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatStoreMoney(value: number | string) {
  return storeMoney.format(Number(value) || 0);
}
