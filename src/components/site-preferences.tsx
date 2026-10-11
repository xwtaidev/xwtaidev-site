import { LanguageButton } from "./language-button";
import { ThemeButton } from "./theme-button";

export function SitePreferences() {
  return (
    <div className="site-preferences">
      <span className="footer-divider" aria-hidden="true" />
      <LanguageButton />
      <ThemeButton />
    </div>
  );
}
