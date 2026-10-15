"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatPostDate, getReadingMinutes, getCategoryLabel, type BlogPost, type BlogPostPreview } from "@/content/blog";
import { SiteDock } from "./site-dock";
import { BlogRelatedCard } from "./blog-related-card";
import { BlogReadingTools } from "./blog-reading-tools";
import { Icon } from "./icon";
import { useLocale } from "./locale-provider";

export function BlogPostContent({ post, previous, next }: { post: BlogPost; previous?: BlogPostPreview; next?: BlogPostPreview }) {
  const { locale, messages } = useLocale();
  const copy = messages.blog;
  const contents = useMemo(() => [
    ...(post.hasIntroduction ? [{ id: "article-content", title: copy.overview }] : []),
    ...post.headings,
  ], [post.headings, post.hasIntroduction, copy.overview]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <>
      <a className="skip-link" href="#article-content">{copy.skipArticle}</a>
      <main className="blog-article-page">
        <div className="article-topline">
          <Link className="article-back" href="/blog"><Icon name="back" className="blog-small-icon" />{copy.allPosts}</Link>
        </div>
        <article>
          <header className="article-heading">
            <div className="article-eyebrow"><span className="article-category"><i />{getCategoryLabel(post.category, copy.categories)}</span>{(post.draft || post.sample) && <span>{post.draft ? copy.draftArticle : copy.sampleArticle}</span>}</div>
            <h1 lang="en">{post.title}</h1>
            {post.description && <p className="article-description" lang="en">{post.description}</p>}
            <div className="article-byline">
              <span className="article-author">{post.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.date}>{formatPostDate(post.date, false, locale)}</time>
              <span aria-hidden="true">·</span>
              <span>{getReadingMinutes(post)} {copy.minRead}</span>
            </div>
          </header>
          <div className="article-layout">
            <BlogReadingTools sections={contents} />
            <div className="article-body" id="article-content" lang="en" tabIndex={-1} dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>
        </article>
        {(previous || next) && <section className="article-continue" aria-labelledby="related-title">
          <h2 className="article-continue-title" id="related-title">{copy.keepReading}</h2>
          <ul className="article-related-list">
            {previous && <BlogRelatedCard post={previous} direction="previous" />}
            {next && <BlogRelatedCard post={next} direction="next" />}
          </ul>
        </section>}
        <SiteDock activePage="blog" onScrollToTop={scrollToTop} />
      </main>
    </>
  );
}
