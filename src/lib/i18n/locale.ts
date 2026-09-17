import "server-only";
import { cookies } from "next/headers";
import { fr } from "./dictionaries/fr";
import { en } from "./dictionaries/en";
import type { Dictionary } from "./dictionaries/fr";
import { INTL_LOCALE, type Locale } from "./locale-constants";

export type { Locale };
export { INTL_LOCALE };

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "repere_locale";

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };

function isLocale(value: string | undefined): value is Locale {
  return value === "fr" || value === "en";
}

/** Reads the visitor's chosen language — defaults to French, never redirects. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** `const t = await getT()` in a Server Component, then `t.home.heroTitle`. */
export async function getT(): Promise<Dictionary> {
  const locale = await getLocale();
  return DICTIONARIES[locale];
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
