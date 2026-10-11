"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getBlogCategories, getCategoryLabel, filterPosts, type BlogCategory } from "@/content/blog";
import type { BlogPostPreview } from "@/content/blog";
import { setupMasonry } from "@/lib/masonry-controller";
import { BlogPostCard } from "./blog-post-card";
import { SiteDock } from "./site-dock";
import { feedPageSize, initialFeedCount, useBlogFeed } from "./blog-feed-provider";
import { Icon } from "./icon";
import { useLocale } from "./locale-provider";

export function BlogFeed({ posts }: { posts: readonly BlogPostPreview[] }) {
  const { messages } = useLocale();
  const copy = messages.blog;
  const feedCopy = copy.feed;
  const { state, setState, scrollPositionRef } = useBlogFeed();
  const [loading, setLoading] = useState(false);
  const grid = useRef<HTMLUListElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const searchId = useId();
  const gridId = useId();
  const blogCategories = useMemo(() => getBlogCategories(posts), [posts]);
  const filtered = useMemo(() => filterPosts(posts, state.category, state.query), [posts, state.category, state.query]);
  const visible = useMemo(() => filtered.slice(0, state.visibleCount), [filtered, state.visibleCount]);
  const hasMore = visible.length < filtered.length;
  const resultsMessage = (filtered.length === 1 ? feedCopy.statusOne : feedCopy.statusMany)
    .replace("{count}", String(filtered.length)).replace("{visible}", String(visible.length));
  const progressMessage = feedCopy.progress.replace("{count}", String(filtered.length)).replace("{visible}", String(visible.length));

  useLayoutEffect(() => {
    if (!grid.current) return;
    return setupMasonry(grid.current);
  }, [visible]);

  useLayoutEffect(() => {
    if (!scrollPositionRef.current) return;
    const position = scrollPositionRef.current;
    const frame = requestAnimationFrame(() => window.scrollTo({ top: position, behavior: "instant" }));
    return () => cancelAnimationFrame(frame);
  }, [scrollPositionRef]);

  const loadMore = useCallback(() => {
    if (timer.current !== null || state.visibleCount >= filtered.length) return;
    setLoading(true);
    // Keep feedback visible while revealing the next batch of the local collection.
    timer.current = window.setTimeout(() => {
      setState((previous) => ({ ...previous, visibleCount: Math.min(previous.visibleCount + feedPageSize, filtered.length) }));
      timer.current = null;
      setLoading(false);
    }, 380);
  }, [filtered.length, setState, state.visibleCount]);

  useEffect(() => {
    if (!hasMore || !sentinel.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); }, { rootMargin: "400px 0px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  function updateFilters(category: BlogCategory, query: string) {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setLoading(false);
    scrollPositionRef.current = 0;
    setState({ category, query, visibleCount: initialFeedCount });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <main className="blog-feed">
      <a className="skip-link" href={`#${gridId}`}>{copy.skipPosts}</a>
      <header className="feed-heading">
        <div className="feed-hero-scrap" aria-hidden="true"><span>{feedCopy.scrapFile}</span><i /><i /><i /><div><span />{feedCopy.scrapNote}</div></div>
        <svg className="feed-idea-trail" viewBox="0 0 300 100" fill="none" aria-hidden="true"><path d="M12 73C50 84 67 27 112 37S169 87 202 48S251 11 287 26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="1 7" /><circle cx="287" cy="26" r="3" stroke="currentColor" /><circle cx="12" cy="73" r="2" fill="currentColor" /></svg>
        <div className="feed-heading-copy"><p className="feed-eyebrow"><span />{feedCopy.eyebrow}</p><h1>{feedCopy.title}<span>{feedCopy.titleEnd}</span></h1><p className="feed-introduction">{feedCopy.introductionFirst}<br className="feed-hero-break" />{feedCopy.introductionSecond}</p></div>
        <aside aria-hidden="true"><span className="feed-annotation-arrow">↳</span><p>{feedCopy.annotationFirst}<br />{feedCopy.annotationSecond}</p><span>{feedCopy.annotationNote}</span></aside>
      </header>
      <div className="feed-toolbar"><div className="feed-filters" role="group" aria-label={copy.filter}>{blogCategories.map((category) => <button key={category} type="button" aria-pressed={state.category === category} aria-controls={gridId} onClick={() => updateFilters(category, state.query)}>{category === "All" ? feedCopy.allStories : getCategoryLabel(category, copy.categories)}{state.category === category && <span>{filtered.length.toString().padStart(2, "0")}</span>}</button>)}</div><div className="feed-search"><Icon name="search" /><label className="visually-hidden" htmlFor={searchId}>{copy.search}</label><input id={searchId} type="search" placeholder={copy.searchPlaceholder} value={state.query} onChange={(event) => updateFilters(state.category, event.target.value)} aria-controls={gridId} autoComplete="off" /></div></div>
      <p className="visually-hidden" role="status" aria-live="polite">{resultsMessage}</p>
      {visible.length ? <ul className="feed-grid" ref={grid} id={gridId} aria-label={copy.postsRegion}>{visible.map((post, index) => <BlogPostCard key={post.slug} post={post} index={index} onOpen={() => { scrollPositionRef.current = window.scrollY; }} />)}</ul> : <div className="feed-empty" id={gridId}><Icon name="search" /><h2>{copy.noResults}</h2><p>{copy.noResultsHint}</p><button type="button" onClick={() => updateFilters("All", "")}>{copy.clearFilters} <Icon name="back" /></button></div>}
      {hasMore && <div className="feed-load" ref={sentinel}>{loading ? <><div className="feed-loading-lines" aria-hidden="true"><span /><span /><span /></div><p role="status">{feedCopy.loading}</p></> : <button type="button" onClick={loadMore} aria-controls={gridId}>{copy.keepReading} <Icon name="back" /></button>}<span>{progressMessage}</span></div>}
      {!hasMore && visible.length > 0 && <div className="feed-end"><Icon name="note" /><p>{feedCopy.endTitle}</p><span>{feedCopy.endNote}</span><button type="button" onClick={scrollToTop}>{feedCopy.backToBeginning} <Icon name="back" /></button></div>}
      <SiteDock activePage="blog" onScrollToTop={scrollToTop} />
    </main>
  );
}
