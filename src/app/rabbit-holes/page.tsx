"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import { SiteFooter } from "@/components/site-footer";
import { discoveries, discoveryPreviews, discoveryThumbnails } from "@/content/rabbit-holes";
import { calculateCoverExtra, calculatePageSize, filterDiscoveries, getPreviewSources, paginateDiscoveries, parsePageNumber, pickDiscovery } from "@/lib/rabbit-holes";
import "./rabbit-holes.css";

const categories = ["All", "Interactive", "Visualizations", "Games", "Archives", "Reading", "Audio", "Tools"] as const;
const illustrated = new Set(["atlas", "crystals", "cursor", "human", "patterns"]);

function Cover({ kind, title, category, index }: { kind: string; title: string; category: string; index: number }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const original = discoveryPreviews[kind];
  const sources = getPreviewSources(original ? discoveryThumbnails[original] : undefined, original);
  const image = sources[sourceIndex];

  useEffect(() => {
    const element = imageRef.current;
    if (image && element?.complete && element.naturalWidth === 0) {
      setSourceIndex((current) => current === sourceIndex ? current + 1 : current);
    }
  }, [image, sourceIndex]);
  return <div className={`rabbit-cover cover-${kind}${illustrated.has(kind) ? "" : ` cover-abstract cover-abstract-${index % 6}`}`} aria-hidden="true">
    {kind === "atlas" && <><span className="cover-stars">·　✦　　 ·　　✧　　·</span><span className="atlas-orbit orbit-one" /><span className="atlas-orbit orbit-two" /><span className="atlas-planet" /><span className="atlas-moon" /></>}
    {kind === "crystals" && <div className="crystal-flower">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ transform: `rotate(${i * 30}deg)` }} />)}<b /></div>}
    {kind === "cursor" && <><svg viewBox="0 0 360 130" preserveAspectRatio="none"><path d="M-10 104 C 55 99, 77 23, 141 67 S 213 126, 270 49" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 7" /></svg><span className="cursor-pointer">↖</span></>}
    {kind === "human" && <><span className="speech speech-one">•••</span><span className="speech speech-two">•••</span></>}
    {kind === "patterns" && <div className="pattern-window"><span className="window-dots">•••</span><i /><i /><b /></div>}
    {!illustrated.has(kind) && <><span className="abstract-orbit abstract-orbit-one" /><span className="abstract-orbit abstract-orbit-two" /><span className="abstract-symbol">{["✳", "◌", "✧", "◎", "∿", "✦"][index % 6]}</span><span className="abstract-label">{category} / {title}</span></>}
    {/* External previews are served by their owners and need a local fallback. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {image && <img ref={imageRef} className="rabbit-preview" src={image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setSourceIndex((current) => current === sourceIndex ? current + 1 : current)} />}
  </div>;
}

export default function RabbitHolesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [surprise, setSurprise] = useState<{ id: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const gridRef = useRef<HTMLDivElement>(null);
  const visible = filterDiscoveries(discoveries, query, category);
  const pagination = paginateDiscoveries(visible, page, pageSize);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const update = () => {
      const cards = [...grid.querySelectorAll<HTMLElement>(".rabbit-card")];
      if (!cards.length) return;
      const style = getComputedStyle(grid);
      const columns = style.gridTemplateColumns.split(" ").filter(Boolean).length;
      const gap = parseFloat(style.rowGap) || 0;
      const currentExtra = parseFloat(grid.style.getPropertyValue("--rabbit-cover-extra")) || 0;
      const cardHeight = Math.max(...cards.map((card) => card.offsetHeight)) - currentExtra;
      const top = grid.getBoundingClientRect().top + window.scrollY;
      const availableHeight = window.innerHeight - top - 60;
      setPageSize(calculatePageSize(columns, availableHeight, cardHeight, gap));
      const extra = calculateCoverExtra(columns, availableHeight, cardHeight, gap, cards.length, 12);
      if (extra !== currentExtra) grid.style.setProperty("--rabbit-cover-extra", `${extra}px`);
    };
    const observer = new ResizeObserver(update);
    observer.observe(grid);
    window.addEventListener("resize", update);
    update();
    return () => { observer.disconnect(); window.removeEventListener("resize", update); };
  }, [visible.length, pagination.page]);

  useEffect(() => {
    if (!surprise) return;
    document.getElementById(`discovery-${surprise.id}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
  }, [surprise]);

  function surpriseMe() {
    const choice = pickDiscovery(visible);
    if (!choice) return;
    setPage(Math.floor(visible.indexOf(choice) / pageSize) + 1);
    setSurprise({ id: choice.id });
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    setSurprise(null);
    document.getElementById("rabbit-results")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }

  function jumpToPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("page");
    if (!(input instanceof HTMLInputElement)) return;
    const nextPage = parsePageNumber(input.value, pagination.pageCount);
    input.setCustomValidity(nextPage === null ? `Enter a page number between 1 and ${pagination.pageCount}.` : "");
    if (nextPage === null) { input.reportValidity(); return; }
    input.value = String(nextPage);
    changePage(nextPage);
  }

  return <main className="rabbit-page">
    <header className="rabbit-heading"><Link href="/" className="rabbit-home">← <span>Back home</span></Link><h1>Internet Rabbit Holes<span>.</span></h1><p>Curious corners of the internet, found through Hacker News.</p><SiteFooter /></header>
    <section className="rabbit-layout" aria-label="Browse discoveries">
      <aside className="rabbit-toolbar" aria-label="Search and categories">
        <label className="rabbit-search"><Icon name="search" /><span className="visually-hidden">Search discoveries</span><input type="search" placeholder="Search the collection..." value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); setSurprise(null); }} /></label>
        <p className="rabbit-filter-label">BROWSE BY</p>
        <div className="rabbit-filters" aria-label="Filter by category">{categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setPage(1); setSurprise(null); }}>{item}</button>)}</div>
        <button className="rabbit-surprise" type="button" onClick={surpriseMe} disabled={!visible.length}><span aria-hidden="true">↝</span> Surprise me</button>
      </aside>
      <div className="rabbit-main">
      <div id="rabbit-results" className="rabbit-results"><span>DISCOVERED ON HACKER NEWS · AUTOMATICALLY FILTERED · <a href="https://sql.clickhouse.com/" target="_blank" rel="noopener noreferrer">DATA SOURCE ↗</a></span><span>{visible.length} {visible.length === 1 ? "discovery" : "discoveries"}</span></div>
      <p className="visually-hidden" aria-live="polite">{surprise ? `A surprise for you: ${visible.find((item) => item.id === surprise.id)?.title}` : `${visible.length} ${visible.length === 1 ? "discovery" : "discoveries"} found. Page ${pagination.page} of ${pagination.pageCount}.`}</p>
      {visible.length ? <><div ref={gridRef} className="rabbit-grid">{pagination.items.map((item) => <article id={`discovery-${item.id}`} key={item.id} className={`rabbit-card${surprise?.id === item.id ? " is-surprise" : ""}`}>
        <Cover kind={item.id} title={item.title} category={item.categories[0]} index={discoveries.indexOf(item)} /><div className="rabbit-card-content"><h2>{item.title}</h2><p>{item.description}</p><div className="rabbit-card-meta"><div className="rabbit-tags">{item.categories.map((tag) => <span key={tag} data-tag={tag}>{tag}</span>)}</div><div className="rabbit-card-links"><a href={item.discussion} target="_blank" rel="noopener noreferrer">HN <Icon name="external" /><span className="visually-hidden"> discussion about {item.title} (opens in a new tab)</span></a><a href={item.url} target="_blank" rel="noopener noreferrer">Visit <Icon name="external" /><span className="visually-hidden"> {item.title} (opens in a new tab)</span></a></div></div></div>
      </article>)}</div>{pagination.pageCount > 1 && <nav className="rabbit-pagination" aria-label="Pagination"><button type="button" onClick={() => changePage(pagination.page - 1)} disabled={pagination.page === 1}>← <span>Previous</span></button><form className="rabbit-page-jump" onSubmit={jumpToPage} noValidate><label>Page <input key={`${pagination.page}-${pagination.pageCount}`} name="page" type="text" inputMode="numeric" aria-label={`Page number, from 1 to ${pagination.pageCount}`} defaultValue={pagination.page} onInput={(event) => event.currentTarget.setCustomValidity("")} /></label><span>of {pagination.pageCount}</span><button type="submit">Go</button></form><button type="button" onClick={() => changePage(pagination.page + 1)} disabled={pagination.page === pagination.pageCount}><span>Next</span> →</button></nav>}</> : <div className="rabbit-empty"><p>No rabbit holes found.</p><button type="button" onClick={() => { setQuery(""); setCategory("All"); setPage(1); }}>Clear filters</button></div>}
      </div>
    </section>
  </main>;
}
