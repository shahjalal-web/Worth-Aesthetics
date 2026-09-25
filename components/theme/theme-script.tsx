export const THEME_STORAGE_KEY = "wa-theme";

/**
 * Runs before first paint: applies the saved theme (default: light) so there
 * is no flash. Kept tiny and dependency-free on purpose.
 */
const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.add("theme-ready")})})})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
