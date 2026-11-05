import type { Metadata } from "next";
import type { BlogPostPreview } from "../content/blog.ts";
import { profile } from "../content/site.ts";

export const siteUrl = "https://xwtai.cn";

export type SocialCard = {
  title: string;
  description: string;
  path: string;
  image: string;
  label: string;
  headline: string;
  subtitle: string;
  kind: "home" | "products" | "blog" | "rabbit-holes" | "article";
};

export const socialPages = {
  home: {
    title: `${profile.name} — ${profile.role}`,
    description: profile.description,
    path: "/", image: "/assets/social/home.png", label: "DEVELOPER & INDEPENDENT MAKER",
    headline: "Small things,\nmade carefully.",
    subtitle: "Useful software. A little curiosity. A lot of care.",
    kind: "home",
  },
  products: {
    title: "Products — xwtaidev",
    description: "AI tools, Obsidian plugins, and local-first apps made by xwtaidev, an independent developer.",
    path: "/products", image: "/assets/social/products.png", label: "PRODUCTS / SMALL TOOLS, REAL USE",
    headline: "Tools for a\nthoughtful workflow.",
    subtitle: "VibeSpace · Lattice Board · Weekly Schedule",
    kind: "products",
  },
  blog: {
    title: "Blog — xwtaidev",
    description: "Notes on software, small products, and the process of making things. A blog by xwtaidev, developer and independent maker.",
    path: "/blog", image: "/assets/social/blog.png", label: "BLOG / BUILDING IN THE OPEN",
    headline: "Notes from\nthe workbench.",
    subtitle: "Software, small products, and the process of making things.",
    kind: "blog",
  },
  rabbitHoles: {
    title: "Internet Rabbit Holes — xwtaidev",
    description: "Curious corners of the internet, found through Hacker News. Explore interactive experiments, games, visualizations, archives, and useful tools.",
    path: "/rabbit-holes", image: "/assets/social/rabbit-holes.png", label: "INTERNET RABBIT HOLES",
    headline: "Follow your\ncuriosity.",
    subtitle: "Curious corners of the internet, found through Hacker News.",
    kind: "rabbit-holes",
  },
} satisfies Record<string, SocialCard>;

export function getPostSocialCard(post: Pick<BlogPostPreview, "slug" | "title" | "description" | "date" | "category" | "readingMinutes">): SocialCard {
  return {
    title: post.title,
    description: post.description || post.title,
    path: `/blog/${post.slug}`,
    image: `/assets/social/blog/${post.slug}.png`,
    label: `${post.category.toUpperCase()} / ${post.date} / ${post.readingMinutes} MIN READ`,
    headline: post.title,
    subtitle: "Notes on making things.",
    kind: "article",
  };
}

export function createSocialMetadata(card: SocialCard) {
  const url = new URL(card.path, siteUrl).href;
  const image = new URL(card.image, siteUrl).href;
  const alt = card.kind === "article" ? `${card.title} — ${profile.name}` : card.title;
  return {
    title: card.kind === "article" ? `${card.title} — ${profile.name}` : card.title,
    description: card.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website", siteName: profile.name, title: card.title, description: card.description,
      url, images: [{ url: image, width: 1200, height: 630, type: "image/png", alt }],
    },
    twitter: {
      card: "summary_large_image", creator: "@xwtaidev", site: "@xwtaidev",
      title: card.title, description: card.description, images: [{ url: image, alt }],
    },
  } satisfies Metadata;
}
