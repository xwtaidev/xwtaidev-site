"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatPostDate, getReadingMinutes, getCategoryLabel, type BlogPost } from "@/content/blog";
import { profile } from "@/content/site";
import { SiteDock } from "./site-dock";
import { BlogPostCard } from "./blog-post-card";
import { BlogReadingTools } from "./blog-reading-tools";
import { Icon } from "./icon";
import { useLocale } from "./locale-provider";

export function BlogPostContent({ post, related }: { post: BlogPost; related: readonly BlogPost[] }) {
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
          <span aria-hidden="true">{copy.workbench}</span>
        </div>
        <article>
          <header className="article-heading">
            <div className="article-eyebrow"><span className="article-category"><i />{getCategoryLabel(post.category, copy.categories)}</span>{(post.draft || post.sample) && <span>{post.draft ? copy.draftArticle : copy.sampleArticle}</span>}</div>
            <h1 lang="en">{post.title}</h1>
            <p className="article-description" lang="en">{post.description}</p>
            <div className="article-byline">
              <span className="article-author">{profile.name}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.date}>{formatPostDate(post.date, false, locale)}</time>
              <span aria-hidden="true">·</span>
              <span>{getReadingMinutes(post)} {copy.minRead}</span>
            </div>
          </header>
          <div className="article-layout">
            <BlogReadingTools sections={contents} />
            <div className="article-body" id="article-content" lang="en" tabIndex={-1} dangerouslySetInnerHTML={{ __html: post.html }} />
            <div className="article-endmark" aria-hidden="true"><span /><span /><span /></div>
          </div>
          <footer className="article-postscript">
            <p className="article-signoff">{copy.thanksReading}</p>
            <div className="article-postscript-details">
              <div className="article-tags" aria-label={copy.tags}>{post.tags.map((tag) => <span key={tag} lang="en">{tag}</span>)}</div>
              <p>{copy.thought}<a href={`mailto:${profile.email}?subject=${encodeURIComponent(`Re: ${post.title}`)}`}>{copy.hello}<Icon name="external" className="blog-small-icon" /></a></p>
            </div>
          </footer>
        </article>
        <section className="article-related" aria-labelledby="related-title">
          <div className="article-related-heading"><h2 id="related-title">{copy.keepReading}</h2><Link href="/blog">{copy.allPosts}<Icon name="back" className="blog-small-icon" /></Link></div>
          <ul className="article-related-list">{related.map((entry, index) => <BlogPostCard key={entry.slug} post={{ ...entry, readingMinutes: getReadingMinutes(entry) }} index={index} heading="h3" />)}</ul>
        </section>
        <SiteDock activePage="blog" onScrollToTop={scrollToTop} />
      </main>
    </>
  );
}
