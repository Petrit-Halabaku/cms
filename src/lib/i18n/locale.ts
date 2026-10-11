import type { Locale } from "@/lib/database.types";

export const LOCALES = ["en", "sq"] as const satisfies readonly Locale[];

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "sq";
}
