/**
 * Theme plumbing shared by the pre-paint script in `layout.tsx` and the toggle
 * button. The theme lives as a `dark` class on <html> rather than in React state,
 * so the document can be themed before React hydrates.
 */

export const THEME_STORAGE_KEY = "foodiego_theme";

/**
 * Applies the stored theme, falling back to the OS preference. Inlined as a
 * blocking script in `<head>`-position so the first paint is already correct —
 * otherwise a stored dark theme flashes light on every navigation that
 * server-renders the page.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY
)};var s=localStorage.getItem(k);var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

/** Reads the theme currently applied to the document. */
export function isDarkActive(): boolean {
  return document.documentElement.classList.contains("dark");
}

/** Applies `dark` to the document and persists the explicit choice. */
export function applyTheme(dark: boolean): void {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // Private mode / storage disabled: the class still applies for this session.
  }
}
