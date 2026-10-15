"use client";

import Link from "next/link";
import { formatPostDate, type BlogPostPreview } from "@/content/blog";
import { Icon } from "./icon";
import { useLocale } from "./locale-provider";

export function BlogRelatedCard({ post, direction }: { post: BlogPostPreview; direction: "previous" | "next" }) {
  const { locale, messages } = useLocale();
  const copy = messages.blog;
  const label = direction === "previous" ? copy.previousPost : copy.nextPost;

  return (
    <li data-direction={direction}>
      <Link className="article-related-card" href={`/blog/${post.slug}`} rel={direction === "previous" ? "prev" : "next"} aria-label={`${label}: ${post.title}`}>
        <h3 lang="en">{post.title}</h3>
        <div className="article-related-card-meta">
          <span className="article-related-card-direction"><Icon name="back" />{label}</span>
          <time dateTime={post.date}>{formatPostDate(post.date, true, locale)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} {copy.minRead}</span>
          {post.draft && <span>{copy.draftArticle}</span>}
        </div>
      </Link>
    </li>
  );
}
