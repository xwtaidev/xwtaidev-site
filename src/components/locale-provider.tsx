"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { messages, type Messages } from "@/content/messages";
import { getLocale, getServerLocale, setLocale, subscribeLocale, type Locale } from "@/lib/i18n";

type LocaleContextValue = { locale: Locale; messages: Messages; setLocale: typeof setLocale };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, getLocale, getServerLocale);
  return <LocaleContext.Provider value={{ locale, messages: messages[locale], setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("Language controls must be inside LocaleProvider.");
  return context;
}
