import Image from "next/image";
import { obsidianThemes, type ObsidianThemeId } from "@/content/obsidian-themes";
import { Icon } from "./icon";
import "./obsidian-theme-gallery.css";

export function ObsidianThemeGallery({ themeId }: { themeId?: ObsidianThemeId }) {
  const themes = themeId ? obsidianThemes.filter((theme) => theme.id === themeId) : obsidianThemes;
  return (
    <div className="theme-previews" data-single={themeId ? "true" : undefined}>
      {themes.map((theme) => (
        <article className="theme-preview" key={theme.id} aria-labelledby={themeId ? "detail-title" : `theme-${theme.id}`}>
          {!themeId && <div className="theme-preview-heading">
            <h3 id={`theme-${theme.id}`}>{theme.name}</h3>
            <a href={theme.github} target="_blank" rel="noopener noreferrer" aria-label={`${theme.name} on GitHub, opens in a new tab`}>
              <Icon name="github" className="theme-preview-link-icon" />
              GitHub
              <Icon name="external" className="external-icon" />
            </a>
          </div>}
          <p>{theme.description}</p>
          <figure>
            <a href={theme.screenshot.src} target="_blank" rel="noopener noreferrer" aria-label={`View full-size ${theme.name} screenshot, opens in a new tab`}>
              <Image src={theme.screenshot.src} alt={theme.screenshot.alt} width={theme.screenshot.width} height={theme.screenshot.height} sizes="(max-width: 600px) calc(100vw - 92px), 586px" />
            </a>
            <figcaption>{theme.screenshot.caption}</figcaption>
          </figure>
          {themeId && <p className="theme-preview-source">
            <a className="theme-preview-repository" href={theme.github} target="_blank" rel="noopener noreferrer" aria-label={`${theme.name} on GitHub, opens in a new tab`}>
              <Icon name="github" className="theme-preview-link-icon" />
              View on GitHub
              <Icon name="external" className="external-icon" />
            </a>
          </p>}
        </article>
      ))}
    </div>
  );
}
