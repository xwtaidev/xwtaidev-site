"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { profile } from "@/content/site";
import { getOrbitLayout } from "@/lib/orbit-layout";
import { themeAvatars } from "@/lib/theme";
import { Icon } from "./icon";
import { useSite } from "./site-provider";

type Phase = "closed" | "open" | "closing";

export function OrbitNavigation({ currentPage }: { currentPage?: "blog" | "products" }) {
  const { openDetails } = useSite();
  const [phase, setPhase] = useState<Phase>("closed");
  const phaseRef = useRef<Phase>("closed");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();
  const open = phase === "open";

  const closeNavigation = useCallback((restoreFocus = false) => {
    if (phaseRef.current !== "open") return;
    phaseRef.current = "closing";
    setPhase("closing");
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dropdown-close-dur")) || 150;
    closeTimer.current = setTimeout(() => {
      phaseRef.current = "closed";
      setPhase("closed");
      closeTimer.current = null;
    }, duration);
  }, []);

  function toggleNavigation() {
    if (phaseRef.current === "open") {
      closeNavigation();
    } else {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = null;
      phaseRef.current = "open";
      setPhase("open");
    }
  }

  useEffect(() => {
    const root = rootRef.current, panel = panelRef.current;
    if (!root || !panel) return;
    function positionOrbit() {
      const avatar = root!.querySelector<HTMLElement>(".orbit-photo");
      const track = panel!.querySelector<HTMLElement>(".orbit-track");
      if (!avatar || !track || !panel!.clientWidth) return;
      const avatarBox = avatar.getBoundingClientRect(), rootBox = root!.getBoundingClientRect();
      const layout = getOrbitLayout(panel!.clientWidth, {
        x: avatarBox.left - rootBox.left + avatarBox.width / 2,
        y: avatarBox.top - rootBox.top + avatarBox.height / 2 - panel!.offsetTop,
      });
      panel!.style.transformOrigin = `${layout.origin.x}px ${layout.origin.y}px`;
      Object.assign(track.style, {
        left: `${layout.track.left}px`, top: `${layout.track.top}px`,
        width: `${layout.track.width}px`, height: `${layout.track.height}px`,
      });
      layout.nodes.forEach(({ key, x, y }, index) => {
        const node = panel!.querySelector<HTMLElement>(`[data-orbit-node="${key}"]`);
        if (!node) return;
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.setProperty("--orbit-return-x", `${layout.origin.x - x}px`);
        node.style.setProperty("--orbit-return-y", `${layout.origin.y - y}px`);
        node.style.setProperty("--orbit-stagger", `${index * 40}ms`);
      });
    }
    positionOrbit();
    const observer = new ResizeObserver(positionOrbit);
    observer.observe(root);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    function dismissOutside(event: Event) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) closeNavigation();
    }
    function dismissEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && phaseRef.current === "open") {
        event.preventDefault();
        closeNavigation(true);
      }
    }
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("keydown", dismissEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("keydown", dismissEscape);
    };
  }, [open, closeNavigation]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return (
    <div ref={rootRef} className="orbit-navigation" data-open={open}>
      <button
        ref={triggerRef}
        className="orbit-trigger"
        type="button"
        aria-label="Explore navigation"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggleNavigation}
      >
        <span className="orbit-photo">
          <Image className="identity-avatar avatar-light" src={themeAvatars.light} alt={`Portrait of ${profile.name}`} width={40} height={40} sizes="40px" priority />
          <Image className="identity-avatar avatar-dark" src={themeAvatars.dark} alt={`Portrait of ${profile.name}`} width={40} height={40} sizes="40px" priority />
          <span className="orbit-mark" aria-hidden="true">+</span>
        </span>
        <span className="orbit-label">Explore</span>
      </button>
      <nav
        ref={panelRef}
        id={panelId}
        className={`orbit-panel t-dropdown${open ? " is-open" : phase === "closing" ? " is-closing" : ""}`}
        aria-label="Site navigation"
        aria-hidden={!open}
        inert={!open}
      >
        <span className="orbit-track" aria-hidden="true" />
        <button className="orbit-node" data-orbit-node="about" type="button" onClick={() => { closeNavigation(true); openDetails("about"); }}>
          <Icon name="orbitAbout" className="orbit-icon" /><span>About me</span>
        </button>
        <Link className="orbit-node" data-orbit-node="blog" href="/blog" aria-current={currentPage === "blog" ? "page" : undefined} onClick={() => closeNavigation(true)}>
          <Icon name="orbitBlog" className="orbit-icon" /><span>Blog</span>
        </Link>
        <Link className="orbit-node" data-orbit-node="products" href="/products" aria-current={currentPage === "products" ? "page" : undefined} onClick={() => closeNavigation(true)}>
          <Icon name="orbitProducts" className="orbit-icon" /><span>Products</span>
        </Link>
      </nav>
    </div>
  );
}
