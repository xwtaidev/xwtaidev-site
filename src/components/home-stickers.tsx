"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type DragEvent, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import type { DetailKey } from "@/content/site";
import type { ObsidianThemeId } from "@/content/obsidian-themes";
import { clampStickerPosition, isStickerDrag, type StickerBounds, type StickerPoint } from "@/lib/sticker-drag";
import { useSite } from "./site-provider";
import "./home-stickers.css";

type Sticker = {
  id: string;
  label: string;
  href: string;
  detail?: DetailKey;
  size: number;
  angle: number;
};

const stickers: readonly Sticker[] = [
  { id: "vibespace", label: "VibeSpace — a local-first AI agent", href: "#vibespace", detail: "vibespace", size: 96, angle: -11 },
  { id: "lattice", label: "Lattice Board — Kanban for your Obsidian notes", href: "#lattice", detail: "lattice", size: 82, angle: 9 },
  { id: "themes", label: "Obsidian themes — Morandi, Inkblade, and Duskstone", href: "#themes", detail: "themes", size: 104, angle: 8 },
  { id: "rabbit-holes", label: "Internet Rabbit Holes — curious corners of the web", href: "/rabbit-holes", size: 104, angle: -8 },
];

const themeHotspots: readonly { id: ObsidianThemeId; label: string; left: number; top: number; width: number; height: number; polygon: string }[] = [
  { id: "morandi", label: "Morandi", left: 1, top: 6, width: 33, height: 90, polygon: "polygon(0% 14%, 76% 0%, 100% 4%, 85% 27%, 73% 57%, 70% 88%, 67% 100%, 46% 82%)" },
  { id: "inkblade", label: "Inkblade", left: 24, top: 0, width: 50, height: 70, polygon: "polygon(20% 3%, 80% 0%, 100% 13%, 94% 24%, 82% 24%, 60% 57%, 34% 93%, 4% 100%, 12% 43%)" },
  { id: "duskstone", label: "Duskstone", left: 23, top: 16, width: 77, height: 83, polygon: "polygon(53% 0%, 84% 5%, 100% 22%, 65% 94%, 56% 100%, 8% 98%, 0% 87%)" },
];

type Drag = {
  pointerId: number;
  start: StickerPoint;
  offset: StickerPoint;
  origin: StickerBounds;
  moved: boolean;
  captureTarget: HTMLElement;
};

function DraggableSticker({ sticker }: { sticker: Sticker }) {
  const { openDetails } = useSite();
  const elementRef = useRef<HTMLElement | null>(null);
  const position = useRef<StickerPoint>({ x: 0, y: 0 });
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);

  function setPosition(next: StickerPoint) {
    position.current = next;
    elementRef.current?.style.setProperty("--sticker-x", `${next.x}px`);
    elementRef.current?.style.setProperty("--sticker-y", `${next.y}px`);
  }

  function getOrigin(): StickerBounds {
    const box = elementRef.current!.getBoundingClientRect();
    return {
      left: box.left + window.scrollX - position.current.x,
      right: box.right + window.scrollX - position.current.x,
      top: box.top + window.scrollY - position.current.y,
      bottom: box.bottom + window.scrollY - position.current.y,
    };
  }

  function pageBounds(): StickerBounds {
    return { left: 0, top: 0, right: document.documentElement.clientWidth, bottom: document.documentElement.scrollHeight };
  }

  useEffect(() => {
    // A different viewport restores the layout instead of leaving a sticker off-screen.
    function resetPosition() {
      position.current = { x: 0, y: 0 };
      drag.current = null;
      elementRef.current?.style.removeProperty("--sticker-x");
      elementRef.current?.style.removeProperty("--sticker-y");
      elementRef.current?.removeAttribute("data-dragging");
    }
    window.addEventListener("resize", resetPosition);
    return () => window.removeEventListener("resize", resetPosition);
  }, []);

  function startDrag(event: PointerEvent<HTMLElement>) {
    if (!event.isPrimary || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    suppressClick.current = false;
    // Capture on the pressed link, so a click still reaches that card after pointerup.
    const captureTarget = event.target instanceof HTMLElement ? event.target.closest("a") ?? event.currentTarget : event.currentTarget;
    drag.current = {
      pointerId: event.pointerId,
      start: { x: event.pageX, y: event.pageY },
      offset: { ...position.current },
      origin: getOrigin(),
      moved: false,
      captureTarget,
    };
    captureTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const pointer = { x: event.pageX, y: event.pageY };
    if (!active.moved && !isStickerDrag(active.start, pointer)) return;
    active.moved = true;
    suppressClick.current = true;
    event.currentTarget.setAttribute("data-dragging", "true");
    setPosition(clampStickerPosition({
      x: active.offset.x + pointer.x - active.start.x,
      y: active.offset.y + pointer.y - active.start.y,
    }, active.origin, pageBounds()));
  }

  function endDrag(event: PointerEvent<HTMLElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (event.type === "pointercancel") {
      setPosition(active.offset);
      suppressClick.current = true;
    }
    drag.current = null;
    event.currentTarget.removeAttribute("data-dragging");
    if (active.captureTarget.hasPointerCapture(event.pointerId)) active.captureTarget.releasePointerCapture(event.pointerId);
  }

  function activate(event: MouseEvent<HTMLAnchorElement>, detail = sticker.detail) {
    if (suppressClick.current && event.detail !== 0) {
      event.preventDefault();
      suppressClick.current = false;
      return;
    }
    if (detail && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      openDetails(detail);
    }
  }

  function moveWithKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setPosition({ x: 0, y: 0 });
      return;
    }
    const direction: Record<string, StickerPoint> = {
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
    };
    const step = direction[event.key];
    if (!step || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    const distance = event.shiftKey ? 30 : 10;
    setPosition(clampStickerPosition({ x: position.current.x + step.x * distance, y: position.current.y + step.y * distance }, getOrigin(), pageBounds()));
  }

  const dragProps = {
    ref: (element: HTMLElement | null) => { elementRef.current = element; },
    className: "home-sticker",
    "data-sticker": sticker.id,
    style: { "--sticker-size": `${sticker.size}px`, "--sticker-angle": `${sticker.angle}deg` } as CSSProperties,
    onDragStart: (event: DragEvent<HTMLElement>) => event.preventDefault(),
    onPointerDown: startDrag,
    onPointerMove: moveDrag,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onLostPointerCapture: endDrag,
    onKeyDown: moveWithKeyboard,
  };

  if (sticker.id === "themes") {
    return (
      <div {...dragProps} role="group" aria-label="Obsidian theme palette stickers">
        <div className="theme-sticker-surface home-sticker-art">
          <Image className="home-sticker-image" src="/assets/stickers/themes.webp" alt="" width={480} height={455} sizes="120px" draggable={false} />
          {themeHotspots.map((theme) => (
            <Link
              key={theme.id}
              href={`#${theme.id}`}
              className="theme-sticker-target"
              data-theme={theme.id}
              style={{ left: `${theme.left}%`, top: `${theme.top}%`, width: `${theme.width}%`, height: `${theme.height}%`, clipPath: theme.polygon }}
              aria-label={`${theme.label} theme sticker`}
              aria-describedby="sticker-instructions"
              title={`${theme.label} · Drag to move, click to explore`}
              draggable={false}
              onClick={(event) => activate(event, theme.id)}
            />
          ))}
        </div>
        {themeHotspots.map((theme) => (
          <span key={theme.id} className="theme-sticker-focus-label" data-for-theme={theme.id} aria-hidden="true">{theme.label}</span>
        ))}
      </div>
    );
  }

  const external = sticker.href.startsWith("https:");
  return (
    <Link
      {...dragProps}
      href={sticker.href}
      aria-label={sticker.label}
      aria-describedby="sticker-instructions"
      title={`${sticker.label} · Drag to move, click to explore`}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      draggable={false}
      onClick={(event) => activate(event)}
    >
      <Image className="home-sticker-image home-sticker-art" src={`/assets/stickers/${sticker.id}.webp`} alt="" width={480} height={480} sizes="120px" draggable={false} />
    </Link>
  );
}

export function HomeStickers() {
  return (
    <aside className="home-stickers" aria-label="A few things from my workbench">
      <p className="visually-hidden" id="sticker-instructions">Drag a sticker to move it, or use the arrow keys when focused. Press Escape to reset its position. Follow the link to explore.</p>
      {stickers.map((sticker) => <DraggableSticker key={sticker.id} sticker={sticker} />)}
    </aside>
  );
}
