"use client";

import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { formatPostDate, getCategoryLabel, type BlogPostPreview } from "@/content/blog";
import { BlogCoverArt } from "./blog-cover-art";
import { feedPageSize } from "./blog-feed-provider";
import { Icon } from "./icon";
import { useLocale } from "./locale-provider";

export function BlogPostCard({ post, index = 0, onOpen, heading = "h2" }: { post: BlogPostPreview; index?: number; onOpen?: () => void; heading?: "h2" | "h3" }) {
  const Heading = heading;
  const { locale, messages } = useLocale();
  const copy = messages.blog;
  return (
    <li style={{ "--feed-index": index % feedPageSize } as CSSProperties}>
      <Link className={`feed-card feed-card-${post.format ?? "cover"}`} data-cover={post.cover} href={`/blog/${post.slug}`} onClick={onOpen}>
        {post.coverImage ? <div className="feed-card-image"><Image src={post.coverImage} alt={post.coverAlt ?? ""} width={1200} height={800} sizes="(max-width: 600px) 100vw, 420px" /></div> : post.cover && <div className="feed-card-art"><BlogCoverArt type={post.cover} /></div>}
        <div className="feed-card-copy">
          <div className="feed-card-eyebrow"><span><i />{getCategoryLabel(post.category, copy.categories)}</span>{post.draft ? <span className="feed-draft-badge">{copy.draftArticle}</span> : post.format === "paper" && <Icon name="note" />}</div>
          {post.format === "quote" && <><span className="feed-quote-mark" aria-hidden="true">“</span><p className="feed-pull-quote" lang="en">{post.pullQuote}</p></>}
          <Heading lang="en">{post.title}</Heading>
          {post.description && <p className="feed-card-description" lang="en">{post.description}</p>}
          <div className="feed-card-meta"><span><time dateTime={post.date}>{formatPostDate(post.date, true, locale)}</time><span aria-hidden="true">·</span><span>{post.readingMinutes} {copy.minRead}</span></span><Icon name="external" /></div>
        </div>
      </Link>
    </li>
  );
}
