export const obsidianThemes = [
  {
    id: "morandi",
    name: "Morandi",
    description: "Muted palettes, paper-like light surfaces, and inky dark tones. A quiet theme with serif headings and room to read.",
    github: "https://github.com/xwtaidev/obsidian-morandi-theme",
    screenshot: { src: "/assets/themes/morandi.webp", width: 512, height: 288, alt: "Morandi light theme with warm ivory pages, serif headings, and muted brown text", caption: "Light mode · Browser preview" },
  },
  {
    id: "inkblade",
    name: "Inkblade",
    description: "Ink-black surfaces, aged brass, cool steel, and a touch of vermilion. A martial-arts-inspired theme with dark and light modes.",
    github: "https://github.com/xwtaidev/obsidian-inkblade-theme",
    screenshot: { src: "/assets/themes/inkblade.webp", width: 1200, height: 867, alt: "Inkblade dark theme with ink-black pages, brass headings, and vermilion accents", caption: "Dark mode · Browser preview" },
  },
  {
    id: "duskstone",
    name: "Duskstone",
    description: "Warm taupe pages inside a charcoal frame, with quiet contrast for reading and writing after hours. Includes a matching dark mode.",
    github: "https://github.com/xwtaidev/obsidian-duskstone-theme",
    screenshot: { src: "/assets/themes/duskstone.webp", width: 1200, height: 811, alt: "Duskstone light theme in Obsidian on macOS, with warm taupe pages and a charcoal frame", caption: "Light mode · Obsidian on macOS" },
  },
] as const;

export type ObsidianThemeId = typeof obsidianThemes[number]["id"];
