"use client";

import { useId } from "react";
import { Icon } from "./icon";
import { Tooltip } from "./tooltip";
import { useSite } from "./site-provider";
import { useLocale } from "./locale-provider";

export function ThemeButton() {
  const hintId = useId();
  const { theme, toggleTheme } = useSite();
  const { messages } = useLocale();
  const label = theme === "dark" ? messages.theme.light : messages.theme.dark;
  return (
    <Tooltip id={hintId} content={label} align="end">
      <button
        className="icon-button theme-toggle t-tt-trigger"
        type="button"
        aria-label={label}
        aria-pressed={theme === "dark"}
        aria-describedby={hintId}
        onClick={toggleTheme}
      >
        <Icon name="sun" className="theme-sun" />
        <Icon name="moon" className="theme-moon" />
      </button>
    </Tooltip>
  );
}
