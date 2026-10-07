export const profile = {
  name: "xwtaidev",
  signature: "xwt",
  role: "Developer & Independent Maker",
  description:
    "xwtaidev is an independent developer building AI tools, Obsidian plugins and personal productivity apps.",
  email: "xwtaidev@gmail.com",
  github: "https://github.com/xwtaidev",
  x: "https://x.com/xwtaidev",
} as const;

type DetailContent = {
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
  email?: string;
  links?: readonly { href: string; label: string; icon: "obsidian" | "github" }[];
};

export const details: Record<DetailKey, DetailContent> = {
  about: {
    eyebrow: "A little about me",
    title: "Small things, made carefully.",
    paragraphs: [
      "My work spans AI tools, Obsidian plugins and desktop apps. I tend to start with something I need, then build a small tool around it.",
      "I work on agent workflows, tool integration and memory systems, alongside backend development with Python and Java. My web toolkit includes TypeScript, React and Next.js; for desktop apps, I use Tauri and Rust.",
      "Other projects include FileSniffer, an early Mac disk-space analyzer, and TokenPulse, a dashboard for local AI token usage and costs.",
    ],
    links: [{ href: profile.github, label: "Explore my work on GitHub", icon: "github" }],
    email: profile.email,
  },
  lattice: {
    eyebrow: "Obsidian plugin",
    title: "Lattice Board",
    paragraphs: [
      "A Kanban-style view of your notes inside Obsidian. Columns follow a note property, and moving a card updates that property.",
      "Built on Obsidian Bases, with the board stored in a .base file and the notes kept in your vault.",
    ],
    links: [
      { href: "https://community.obsidian.md/plugins/lattice-board", label: "Get it for Obsidian", icon: "obsidian" },
      { href: "https://github.com/xwtaidev/obsidian-lattice-plugin", label: "Source on GitHub", icon: "github" },
    ],
  },
  weekly: {
    eyebrow: "Obsidian plugin",
    title: "Weekly Schedule",
    paragraphs: [
      "Plan and review the week without leaving Obsidian. Daily priority quadrants help organize tasks, while a year overview makes it easier to look back.",
      "Tasks are saved as ordinary Markdown files in your vault. The plugin works offline and follows your Obsidian theme.",
    ],
    links: [
      { href: "https://community.obsidian.md/plugins/weekly-schedule", label: "Get it for Obsidian", icon: "obsidian" },
      { href: "https://github.com/xwtaidev/obsidian-weekly-schedule-plugin", label: "Source on GitHub", icon: "github" },
    ],
  },
  vibespace: {
    eyebrow: "In development",
    title: "VibeSpace",
    paragraphs: [
      "A local-first AI workspace for macOS, exploring how agents and task boards can work together to move an idea forward.",
      "It is still in development and is not publicly available yet.",
    ],
  },
};

export type DetailKey = "about" | "lattice" | "weekly" | "vibespace";
