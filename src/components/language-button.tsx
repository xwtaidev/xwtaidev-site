"use client";

import { useId } from "react";
import { useLocale } from "./locale-provider";
import { Tooltip } from "./tooltip";

export function LanguageButton() {
  const hintId = useId();
  const { locale, messages, setLocale } = useLocale();
  const target = locale === "en" ? "zh-CN" : "en";
  const label = messages.language.switch;
  return (
    <Tooltip id={hintId} content={label} align="end">
      <button className="icon-button language-toggle t-tt-trigger" type="button" aria-label={label} aria-describedby={hintId} onClick={() => setLocale(target)}>
        <span lang={target} aria-hidden="true">{target === "en" ? "EN" : "中"}</span>
      </button>
    </Tooltip>
  );
}
