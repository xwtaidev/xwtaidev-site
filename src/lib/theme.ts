export type Theme = "light" | "dark";

export const themeAvatars: Record<Theme, string> = {
  light: "/assets/avatar-light.jpg",
  dark: "/assets/avatar.jpg",
};

export const themeFavicons: Record<Theme, string> = {
  light: "/assets/favicon-light.ico",
  dark: "/assets/favicon-dark.ico",
};

export const themePngFavicons: Record<Theme, string> = {
  light: "/favicon-32x32.png", dark: "/favicon-32x32-dark.png",
};

export const themeSvgFavicons: Record<Theme, string> = {
  light: "/favicon.svg", dark: "/favicon-dark.svg",
};

export const themeColors: Record<Theme, string> = { light: "#ffffff", dark: "#171918" };

const storageKey = "xwtaidev-site-theme";
const legacyStorageKey = "xu-portfolio-theme";
const changeEvent = "xwtaidev-site-theme-change";

const bootstrapAssets = Object.fromEntries((["light", "dark"] as const).map((theme) => [theme, {
  ico: themeFavicons[theme], png: themePngFavicons[theme], svg: themeSvgFavicons[theme], color: themeColors[theme],
}]));

export const themeBootstrap = `try{const saved=localStorage.getItem('${storageKey}')??localStorage.getItem('${legacyStorageKey}');const theme=saved==='dark'?'dark':'light';const assets=${JSON.stringify(bootstrapAssets)}[theme];document.documentElement.dataset.theme=theme;const sync=()=>{document.getElementById('site-icon')?.setAttribute('href',assets.ico);document.getElementById('site-icon-png')?.setAttribute('href',assets.png);document.getElementById('site-icon-svg')?.setAttribute('href',assets.svg);document.querySelector('meta[name="theme-color"]')?.setAttribute('content',assets.color)};sync();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});if(saved==='light'||saved==='dark')localStorage.setItem('${storageKey}',theme)}catch{}`;

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById("site-icon")?.setAttribute("href", themeFavicons[theme]);
  document.getElementById("site-icon-png")?.setAttribute("href", themePngFavicons[theme]);
  document.getElementById("site-icon-svg")?.setAttribute("href", themeSvgFavicons[theme]);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColors[theme]);
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
