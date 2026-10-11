"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { Icon } from "./icon";
import { LanguageButton } from "./language-button";
import { useLocale } from "./locale-provider";
import { ThemeButton } from "./theme-button";
import { Tooltip } from "./tooltip";
import "./site-dock.css";

const links = [
  { id: "home", href: "/" },
  { id: "products", href: "/products" },
  { id: "blog", href: "/blog" },
] as const;

export function SiteDock({ activePage, onScrollToTop, action, hint }: {
  activePage: (typeof links)[number]["id"];
  onScrollToTop?: () => void;
  action?: ReactNode;
  hint?: ReactNode;
}) {
  const topHintId = useId();
  const { messages } = useLocale();
  const copy = messages.navigation;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <div className="site-dock">
      {hint && <p className="site-dock-hint">{hint}</p>}
      <nav aria-label={copy.site}>
        {links.map(({ id, href }) => (
          <Link href={href} aria-current={activePage === id ? "page" : undefined} key={id}>
            {copy[id]}{activePage === id && <span aria-hidden="true" />}
          </Link>
        ))}
      </nav>
      <span className="site-dock-divider" aria-hidden="true" />
      <div className="site-dock-tools" role="group" aria-label={copy.controls}>
        {action ?? <Tooltip id={topHintId} content={copy.backToTop}>
          <button className="icon-button site-dock-to-top t-tt-trigger" type="button" aria-label={copy.backToTop} aria-describedby={topHintId} onClick={onScrollToTop ?? scrollToTop}><Icon name="back" /></button>
        </Tooltip>}
        <LanguageButton />
        <ThemeButton />
      </div>
    </div>
  );
}
