"use client";

import { useEffect, useRef, useState } from "react";
import { getReadingProgress } from "@/lib/reading-progress";
import { Icon } from "./icon";
import { useLocale } from "./locale-provider";

export function BlogReadingTools({ sections }: { sections: readonly { id: string; title: string; depth?: 2 | 3 }[] }) {
  const { locale, messages } = useLocale();
  const copy = messages.blog;
  const [activeId, setActiveId] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const progressRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const mobileContentsRef = useRef<HTMLDetailsElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const article = document.getElementById("article-content");
    if (!article) return;
    const headings = sections.map(({ id }) => document.getElementById(id)).filter((element): element is HTMLElement => element !== null);
    let frame: number | null = null;
    let disposed = false;

    function update() {
      frame = null;
      if (!article || disposed) return;
      const bounds = article.getBoundingClientRect();
      const progress = getReadingProgress(bounds.top, bounds.height, window.innerHeight);
      const percentage = Math.round(progress * 100);
      article.closest<HTMLElement>(".blog-article-page")?.style.setProperty("--article-progress", String(progress));
      progressRef.current?.setAttribute("aria-valuenow", String(percentage));
      if (progressTextRef.current) progressTextRef.current.textContent = `${percentage}%`;
      const current = headings.filter((heading) => heading.getBoundingClientRect().top <= Math.min(180, window.innerHeight * .25)).at(-1);
      setActiveId(current?.id ?? "");
    }

    function scheduleUpdate() {
      if (!disposed && frame === null) frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(article);
    if (article.parentElement) resizeObserver.observe(article.parentElement);
    void document.fonts.ready.then(scheduleUpdate);
    return () => {
      disposed = true;
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [sections]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  async function copyLink() {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    try {
      const url = new URL(window.location.href);
      url.hash = "";
      await navigator.clipboard.writeText(url.toString());
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    copyTimer.current = setTimeout(() => setCopyState("idle"), 3000);
  }

  const contents = <ol>{sections.map((section, index) => <li key={section.id} data-depth={section.depth}><a href={`#${section.id}`} lang={section.id === "article-content" ? locale : "en"} aria-current={activeId === section.id ? "location" : undefined} onClick={() => { if (mobileContentsRef.current) mobileContentsRef.current.open = false; }}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{section.title}</a></li>)}</ol>;

  return (
    <>
      <div className="blog-reading-progress" ref={progressRef} role="progressbar" aria-label={copy.readingProgress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}><div /></div>
      <aside className="article-tools" aria-label={copy.readingTools}>
        <div className="article-tools-sticky">
          <nav className="article-toc-desktop" aria-label={copy.contents}><p className="article-toc-label">{copy.contents}</p>{contents}</nav>
          <details className="article-toc-mobile" ref={mobileContentsRef}><summary>{copy.contents}<span aria-hidden="true">+</span></summary><nav aria-label={copy.contents}>{contents}</nav></details>
          <div className="article-reading-status"><span>{copy.readingProgress}</span><span ref={progressTextRef}>0%</span><div aria-hidden="true"><span /></div></div>
          <button className="article-copy-link" type="button" onClick={copyLink}>
            <Icon name={copyState === "copied" ? "check" : "copy"} className="blog-small-icon" />
            <span aria-live="polite">{copyState === "copied" ? copy.copied : copyState === "error" ? copy.copyError : copy.copyLink}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
