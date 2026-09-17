// Split out from locale.ts (which imports "server-only") so Client
// Components can use the locale type and the Intl tag mapping — plain data,
// nothing server-specific — without pulling a server-only module into the
// client bundle.
export type Locale = "fr" | "en";

/** BCP-47 tag for `toLocaleString`/`toLocaleDateString` calls. */
export const INTL_LOCALE: Record<Locale, string> = { fr: "fr-FR", en: "en-US" };
