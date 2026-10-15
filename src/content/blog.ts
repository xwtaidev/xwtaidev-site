import type { Locale } from "@/lib/i18n";

export const blogCoverKinds = ["board", "workspace", "markdown", "agent", "week", "keyboard", "sketch"] as const;
export type BlogCoverKind = (typeof blogCoverKinds)[number];
export type BlogCategory = string;
export type BlogHeading = { id: string; title: string; depth: 2 | 3 };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  category: BlogCategory;
  tags: readonly string[];
  cover?: BlogCoverKind;
  coverImage?: string;
  coverAlt?: string;
  format?: "quote" | "paper";
  pullQuote?: string;
  draft: boolean;
  sample: boolean;
  html: string;
  headings: readonly BlogHeading[];
  hasIntroduction: boolean;
  readingMinutes: number;
};

export type BlogPostPreview = Omit<BlogPost, "html" | "headings" | "hasIntroduction">;

export function getBlogCategories(posts: readonly Pick<BlogPost, "category">[]) {
  const categories = new Set(posts.map(({ category }) => category));
  const preferred = ["Building", "Engineering", "Notes"].filter((category) => categories.delete(category));
  return ["All", ...preferred, ...[...categories].sort((a, b) => a.localeCompare(b))];
}

export function getCategoryLabel(category: string, labels: Readonly<Record<string, string>>) {
  return labels[category] ?? category;
}

export function filterPosts<Post extends Pick<BlogPost, "title" | "description" | "category" | "tags">>(posts: readonly Post[], category: BlogCategory, query: string): readonly Post[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return posts.filter((post) => {
    if (category !== "All" && post.category !== category) return false;
    const searchable = `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase();
    return words.every((word) => searchable.includes(word));
  });
}

export function getReadingMinutes(post: Pick<BlogPost, "readingMinutes">) {
  return post.readingMinutes;
}

export function formatPostDate(date: string, compact = false, locale: Locale = "en") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale, { month: "short", day: "numeric", ...(compact ? {} : { year: "numeric" }), timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}
