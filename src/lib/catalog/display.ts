/**
 * Repairs common mojibake sequences that can appear when older seed data was
 * imported with the wrong text encoding. This is presentation-only and does
 * not mutate the database value.
 */
export function normalizeCatalogText(value: string) {
  return value
    .replaceAll("ΓÇô", "–")
    .replaceAll("ΓÇö", "—")
    .replaceAll("ΓÇÖ", "’")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—")
    .replaceAll("â€™", "’")
    .replaceAll("Â", "");
}
