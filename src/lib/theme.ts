export type Theme = "light" | "dark";

const storageKey = "xwtaidev-site-theme";
const legacyStorageKey = "xu-portfolio-theme";
const changeEvent = "xwtaidev-site-theme-change";

export const themeBootstrap = `try{const theme=localStorage.getItem('${storageKey}')??localStorage.getItem('${legacyStorageKey}');if(theme==='dark'){document.documentElement.dataset.theme='dark'}if(theme==='light'||theme==='dark'){localStorage.setItem('${storageKey}',theme)}}catch{}`;

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function getServerTheme(): Theme {
  return "light";
}

export function subscribeTheme(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== legacyStorageKey) return;
    document.documentElement.dataset.theme = event.newValue === "dark" ? "dark" : "light";
    listener();
  };
  window.addEventListener(changeEvent, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleTheme() {
  const theme = getTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(storageKey, theme);
  } catch {}
  window.dispatchEvent(new Event(changeEvent));
}
