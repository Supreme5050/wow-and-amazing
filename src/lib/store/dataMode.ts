export type StoreDataMode = "test" | "live";

export function getStoreDataMode(): StoreDataMode {
  const explicit = String(
    process.env.WOW_DATA_MODE || process.env.NEXT_PUBLIC_DATA_MODE || "",
  ).trim().toLowerCase();
  const paystackSecret = String(process.env.PAYSTACK_SECRET_KEY || "").trim();

  if (explicit === "test") return "test";
  if (paystackSecret.startsWith("sk_test_")) return "test";
  if (explicit === "live") return "live";
  if (paystackSecret.startsWith("sk_live_")) return "live";

  return "test";
}

export function isTestDataEnvironment() {
  return getStoreDataMode() !== "live";
}
