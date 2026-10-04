"use client";

import { Icon } from "./icon";
import { Tooltip } from "./tooltip";
import { useSite } from "./site-provider";

export function ThemeButton() {
  const { theme, toggleTheme } = useSite();
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return (
    <Tooltip id="theme-hint" content={label} align="end">
      <button
        className="icon-button theme-toggle t-tt-trigger"
        type="button"
        aria-label={label}
        aria-pressed={theme === "dark"}
        aria-describedby="theme-hint"
        onClick={toggleTheme}
      >
        <Icon name="sun" className="theme-sun" />
        <Icon name="moon" className="theme-moon" />
      </button>
    </Tooltip>
  );
}
