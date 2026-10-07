export type Theme = "light" | "dark";

export const themeAvatars: Record<Theme, string> = {
  light: "/assets/avatar-light.jpg",
  dark: "/assets/avatar.jpg",
};

export const themeFavicons: Record<Theme, string> = {
  light: "/assets/favicon-light.ico",
  dark: "/assets/favicon-dark.ico",
};

const storageKey = "xwtaidev-site-theme";
const legacyStorageKey = "xu-portfolio-theme";
const changeEvent = "xwtaidev-site-theme-change";

export const themeBootstrap = `try{const theme=localStorage.getItem('${storageKey}')??localStorage.getItem('${legacyStorageKey}');if(theme==='light'||theme==='dark'){document.documentElement.dataset.theme=theme;document.getElementById('site-icon')?.setAttribute('href',theme==='dark'?'${themeFavicons.dark}':'${themeFavicons.light}');localStorage.setItem('${storageKey}',theme)}}catch{}`;

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById("site-icon")?.setAttribute("href", themeFavicons[theme]);
}

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function getServerTheme(): Theme {
  return "light";
}

export function subscribeTheme(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== legacyStorageKey) return;
    applyTheme(event.newValue === "dark" ? "dark" : "light");
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
  applyTheme(theme);
  try {
    localStorage.setItem(storageKey, theme);
  } catch {}
  window.dispatchEvent(new Event(changeEvent));
}
