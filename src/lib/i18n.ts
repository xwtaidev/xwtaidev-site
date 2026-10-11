export const supportedLocales = ["en", "zh-CN"] as const;
export type Locale = (typeof supportedLocales)[number];

const storageKey = "xwtaidev-site-locale";
const changeEvent = "xwtaidev-site-locale-change";

export function resolveLocale(value: unknown): Locale {
  return value === "zh-CN" ? "zh-CN" : "en";
}

export const localeBootstrap = `try{document.documentElement.lang=localStorage.getItem('${storageKey}')==='zh-CN'?'zh-CN':'en'}catch{}`;

export function getServerLocale(): Locale {
  return "en";
}

export function getLocale(): Locale {
  return resolveLocale(document.documentElement.lang);
}

export function setLocale(locale: Locale) {
  const next = resolveLocale(locale);
  document.documentElement.lang = next;
  try {
    window.localStorage.setItem(storageKey, next);
  } catch {}
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeLocale(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    document.documentElement.lang = resolveLocale(event.newValue);
    listener();
  };
  window.addEventListener(changeEvent, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener("storage", onStorage);
  };
}
