import type { Locale } from "@/lib/i18n";
import { obsidianThemes, type ObsidianThemeId } from "./obsidian-themes.ts";

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
  themeId?: ObsidianThemeId;
  links?: readonly { href: string; label: string; icon: "obsidian" | "github" | "workspace" }[];
};

const themeDetails = Object.fromEntries<DetailContent>(obsidianThemes.map((theme) => [theme.id, {
  eyebrow: "Open-source Obsidian theme",
  title: theme.name,
  paragraphs: [],
  themeId: theme.id,
}])) as Record<ObsidianThemeId, DetailContent>;

export const details: Record<DetailKey, DetailContent> = {
  ...themeDetails,
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
    eyebrow: "Local-first AI agent for macOS",
    title: "VibeSpace",
    paragraphs: [
      "A local-first AI agent for macOS that works with your files and code, runs commands, and keeps each step visible and reviewable.",
      "Bring your own model, organize work on Kanban boards, and use reusable skills and scheduled tasks to keep things moving.",
    ],
    links: [{ href: "https://vibespace.site", label: "Explore VibeSpace", icon: "workspace" }],
  },
  themes: {
    eyebrow: "Open-source Obsidian themes",
    title: "Different moods, the same notes.",
    paragraphs: [
      "Three themes exploring color, typography, and the feeling of a writing space. Each supports light and dark modes, with no required plugins or remote fonts.",
    ],
  },
};

export type DetailKey = "about" | "lattice" | "weekly" | "vibespace" | "themes" | ObsidianThemeId;

const detailsZh: Record<DetailKey, DetailContent> = {
  ...themeDetails,
  themes: details.themes,
  about: {
    ...details.about,
    eyebrow: "关于我",
    title: "认真做好每一件小事。",
    paragraphs: [
      "我的工作涵盖 AI 工具、Obsidian 插件和桌面应用。我通常从自己的需求出发，围绕它构建一个小工具。",
      "我关注智能体工作流、工具集成和记忆系统，也使用 Python 和 Java 进行后端开发。Web 开发主要使用 TypeScript、React 和 Next.js；桌面应用则使用 Tauri 和 Rust。",
      "其他项目包括早期的 Mac 磁盘空间分析工具 FileSniffer，以及统计本地 AI Token 用量和费用的仪表盘 TokenPulse。",
    ],
    links: details.about.links?.map((link) => ({ ...link, label: "在 GitHub 上查看我的项目" })),
  },
  lattice: {
    ...details.lattice,
    eyebrow: "Obsidian 插件",
    paragraphs: [
      "以看板形式查看笔记。每一列对应一个笔记属性，移动卡片即可更新该属性。",
      "基于 Obsidian Bases 构建，看板保存在 .base 文件中，笔记始终留在你的笔记库里。",
    ],
    links: details.lattice.links?.map((link, index) => ({ ...link, label: index === 0 ? "安装 Obsidian 插件" : "查看 GitHub 源码" })),
  },
  weekly: {
    ...details.weekly,
    eyebrow: "Obsidian 插件",
    paragraphs: [
      "在 Obsidian 中规划和回顾每一周。通过每日优先级四象限整理任务，用年度概览回顾过去。",
      "任务以普通 Markdown 文件保存在笔记库中。插件支持离线使用，并跟随你的 Obsidian 主题。",
    ],
    links: details.weekly.links?.map((link, index) => ({ ...link, label: index === 0 ? "安装 Obsidian 插件" : "查看 GitHub 源码" })),
  },
  vibespace: {
    ...details.vibespace,
    eyebrow: "本地优先的 macOS AI 智能体",
    paragraphs: [
      "一款本地优先的 macOS AI 智能体，可处理文件和代码、运行命令，并让每一步都清晰可审阅。",
      "连接自己的模型，通过看板组织工作，并使用可复用技能和定时任务推进事务。",
    ],
    links: details.vibespace.links?.map((link) => ({ ...link, label: "探索 VibeSpace" })),
  },
};

export function getDetails(locale: Locale) {
  return locale === "zh-CN" ? detailsZh : details;
}
