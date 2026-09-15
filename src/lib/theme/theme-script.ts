/**
 * Inlined as a blocking <script> before the rest of <body> so the correct
 * theme applies before first paint (no flash of the wrong theme). Reads the
 * same key the ThemeProvider writes to — keep both in sync.
 */
export const THEME_STORAGE_KEY = "repere-theme";

export const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
    }
  } catch (e) {}
})();
`;
