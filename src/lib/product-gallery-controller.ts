import {
  clamp,
  getGalleryCardPose,
  getGalleryGeometry,
  getTransitionProgress,
  getWheelSceneInput,
  type GalleryPhase,
  type GalleryScene,
  type GalleryTransition,
} from "./product-gallery";
import type { ProductGalleryStore } from "./product-gallery-store";

export function setupProductGallery(root: HTMLElement, store: ProductGalleryStore, slots: readonly number[]) {
  function query<T extends HTMLElement>(selector: string) {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing product gallery element: ${selector}`);
    return element;
  }

  const stage = query<HTMLDivElement>(".product-gallery-stage");
  const field = query<HTMLDivElement>(".product-gallery-field");
  const folderHit = query<HTMLDivElement>(".product-folder-hit");
  const folder = query<HTMLButtonElement>(".product-folder");
  const flap = query<HTMLSpanElement>(".product-folder-flap");
  const floor = query<HTMLDivElement>(".product-folder-floor");
  const dragHint = query<HTMLSpanElement>(".product-gallery-hint");
  const enter = query<HTMLSpanElement>(".product-gallery-enter");
  const close = query<HTMLButtonElement>(".product-gallery-close");
  const cards = Array.from(root.querySelectorAll<HTMLAnchorElement>(".product-gallery-card"));
  const papers = Array.from(root.querySelectorAll<HTMLSpanElement>(".product-folder-paper"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saved = store.getSnapshot();
  let phase: GalleryPhase = saved.phase === "open" || saved.phase === "opening" ? "open" : "closed";
  const scene: GalleryScene = { yaw: saved.yaw, pan: saved.pan, selected: saved.selected };
  const motion = { progress: phase === "open" ? 1 : 0, transition: null as GalleryTransition | null, velocity: 0, hover: 0, hoverTarget: 0, hoverVelocity: 0, tiltX: 0, tiltY: 0 };
  let geometry = getGalleryGeometry(0, 0);
  let frame = 0, lastFrame = 0, blockedUntil = 0, saveAfterMotion = false, disposed = false;
  let drag: { id: number; x: number; y: number; yaw: number; pan: number; moved: boolean; lastX: number; lastTime: number } | null = null;
  const cleanup: (() => void)[] = [];
  const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value, 0, 1), 3);
  const easeInOut = (value: number) => {
    const p = clamp(value, 0, 1);
    return p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
  };

  function listen<K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K, listener: (event: HTMLElementEventMap[K]) => void, options?: AddEventListenerOptions) {
    target.addEventListener(type, listener as EventListener, options);
    cleanup.push(() => target.removeEventListener(type, listener as EventListener, options));
  }

  function persist() { store.update({ phase, ...scene }); }
  function setPhase(next: GalleryPhase) { phase = next; root.dataset.phase = next; persist(); }

  function measure() {
    if (disposed || !root.isConnected || !stage.clientWidth) return;
    geometry = getGalleryGeometry(stage.clientWidth, stage.clientHeight);
    cards.forEach((card) => {
      Object.assign(card.style, {
        width: `${geometry.cardWidth}px`, height: `${geometry.cardHeight}px`,
        marginLeft: `${-geometry.cardWidth / 2}px`, marginTop: `${-geometry.cardHeight / 2}px`,
      });
    });
    paint();
  }

  function paint() {
    const p = motion.progress;
    const flapOpen = easeOut(p / 0.25), depart = easeInOut((p - 0.43) / 0.4);
    const folderFade = clamp((p - 0.62) / 0.22, 0, 1), hover = motion.hover * (1 - flapOpen);
    root.dataset.progress = p.toFixed(3);
    root.dataset.hover = motion.hover.toFixed(3);
    root.dataset.phase = phase;
    field.inert = phase !== "open";
    folder.inert = (phase === "open" || phase === "opening") && p > 0.6;
    folderHit.inert = folder.inert;
    folderHit.style.pointerEvents = p > 0.6 ? "none" : "auto";
    folder.style.transform = `translate3d(0,${depart * 150 - hover * 11}px,0) rotateX(${6 * (1 - flapOpen) + motion.tiltX * hover}deg) rotateY(${-16 * (1 - flapOpen) + motion.tiltY * hover}deg) rotateZ(${-4 * (1 - flapOpen) + hover * 1.6}deg) scale(${1 - depart * 0.38 + hover * 0.025})`;
    folder.style.opacity = String(1 - folderFade);
    flap.style.transform = `translateZ(14px) rotateX(${-12 - flapOpen * 58 - hover * 10}deg)`;
    floor.style.opacity = String((1 - folderFade) * (1 - hover * 0.25));
    floor.style.transform = `scale(${1 - hover * 0.12})`;
    papers.forEach((paper, i) => {
      paper.style.transform = `translate3d(0,${-4 + i * 5 - flapOpen * (20 - i * 3) - hover * (12 - i * 3)}px,${-3 + i * 4}px) rotateZ(${(i - 1) * (2 - flapOpen - hover * 0.5)}deg)`;
    });
    cards.forEach((card, index) => {
      const pose = getGalleryCardPose(slots[index], geometry, p, scene);
      card.style.transform = `translate3d(${pose.x}px,${pose.y}px,${pose.z}px) rotateY(${pose.yaw}deg) rotateZ(${pose.roll}deg) scale(${pose.scale})`;
      card.style.opacity = String(pose.opacity);
      card.setAttribute("aria-current", scene.selected === index ? "true" : "false");
    });
    dragHint.style.opacity = String(clamp((p - 0.91) / 0.09, 0, 1));
  }

  function updateSelection() {
    let best = Infinity;
    slots.forEach((slot, index) => {
      const angle = (slot - 1) * 45 + scene.yaw;
      const distance = Math.abs(((angle + 180) % 360 + 360) % 360 - 180);
      if (distance < best) { best = distance; scene.selected = index; }
    });
  }

  function centerCard(index: number) {
    const slot = slots[index];
    if (slot === undefined) return;
    scene.yaw = -(slot - 1) * 45;
    scene.pan = -(slot - 1) * geometry.step;
    scene.selected = index;
    motion.velocity = 0;
    saveAfterMotion = false;
    paint(); persist();
  }

  function tick(now: number) {
    if (disposed) return;
    const dt = Math.min((now - lastFrame) / 1000 || 1 / 60, 0.035);
    lastFrame = now;
    motion.hoverVelocity += ((motion.hoverTarget - motion.hover) * 160 - motion.hoverVelocity * 21) * dt;
    motion.hover += motion.hoverVelocity * dt;
    if (motion.transition) {
      motion.progress = getTransitionProgress(motion.transition, now);
      if (now >= motion.transition.start + motion.transition.duration) {
        const opened = motion.transition.to === 1;
        motion.progress = motion.transition.to;
        motion.transition = null;
        setPhase(opened ? "open" : "closed");
        if (opened) { field.inert = false; cards[scene.selected]?.focus({ preventScroll: true }); }
      }
    }
    if (!drag && Math.abs(motion.velocity) > 0.12) {
      scene.yaw = clamp(scene.yaw + motion.velocity * dt, -150, 150);
      motion.velocity *= Math.exp(-6 * dt);
      updateSelection();
    }
    paint();
    const hovering = Math.abs(motion.hoverTarget - motion.hover) > 0.001 || Math.abs(motion.hoverVelocity) > 0.005;
    if (motion.transition || Math.abs(motion.velocity) > 0.12 || hovering) frame = requestAnimationFrame(tick);
    else {
      motion.velocity = 0; motion.hover = motion.hoverTarget; motion.hoverVelocity = 0; frame = 0;
      paint();
      if (saveAfterMotion) { saveAfterMotion = false; persist(); }
    }
  }

  function animate() {
    if (!frame && !disposed) { lastFrame = performance.now(); frame = requestAnimationFrame(tick); }
  }

  function changeOpen(open: boolean) {
    enter.classList.remove("is-active");
    motion.velocity = 0; motion.hoverTarget = 0; saveAfterMotion = false;
    root.classList.remove("is-folder-hover");
    if (open && motion.progress < 0.01) { scene.yaw = 0; scene.pan = 0; scene.selected = 0; }
    const distance = Math.abs((open ? 1 : 0) - motion.progress);
    motion.transition = {
      from: motion.progress, to: open ? 1 : 0, start: performance.now(),
      duration: reduced.matches ? 0 : Math.max(180, distance * (open ? 1800 : 1250)),
    };
    setPhase(open ? "opening" : "closing");
    if (!open) { folder.inert = false; folderHit.inert = false; folder.focus({ preventScroll: true }); }
    paint(); animate();
  }

  function setHover(active: boolean) {
    if (phase !== "closed") active = false;
    motion.hoverTarget = active && !reduced.matches ? 1 : 0;
    root.classList.toggle("is-folder-hover", active);
    animate();
  }

  function driveScene(yaw: number, pan: number, velocity: number, input: "drag" | "wheel", continueMotion = false) {
    scene.yaw = clamp(yaw, -150, 150); scene.pan = clamp(pan, -geometry.step, geometry.step);
    motion.velocity = reduced.matches ? 0 : clamp(velocity, -280, 280);
    root.dataset.lastInput = input;
    updateSelection(); paint();
    if (continueMotion) animate();
  }

  function beginDrag(event: PointerEvent) {
    if (drag || phase !== "open" || event.button !== 0 || (event.target as Element).closest(".product-folder-hit")) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: scene.yaw, pan: scene.pan, moved: false, lastX: event.clientX, lastTime: performance.now() };
    motion.velocity = 0;
  }

  function track(event: PointerEvent) {
    if (drag && event.pointerType === "mouse" && event.buttons === 0) { drag = null; motion.velocity = 0; return; }
    if (!drag) {
      const card = (event.target as Element).closest(".product-gallery-card");
      if (card && phase === "open" && event.pointerType !== "touch" && !reduced.matches) {
        const bounds = stage.getBoundingClientRect();
        enter.style.transform = `translate3d(${event.clientX - bounds.left - 23.5}px,${event.clientY - bounds.top - 23.5}px,0)`;
        enter.classList.add("is-active");
      } else enter.classList.remove("is-active");
      return;
    }
    if (event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (event.pointerType === "touch" && !drag.moved && Math.abs(dy) > Math.abs(dx) * 1.3 && Math.abs(dy) > 8) { drag = null; return; }
    if (Math.abs(dx) + Math.abs(dy) > 6 && !drag.moved) {
      drag.moved = true;
      try { stage.setPointerCapture(event.pointerId); } catch {}
    }
    if (!drag.moved) return;
    enter.classList.remove("is-active");
    const now = performance.now(), elapsed = Math.max(16, now - drag.lastTime);
    driveScene(drag.yaw + dx * 0.22, drag.pan + dy * 0.32, (event.clientX - drag.lastX) * 0.22 / elapsed * 1000, "drag");
    drag.lastX = event.clientX; drag.lastTime = now;
  }

  function finishDrag(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved; drag = null;
    try { stage.releasePointerCapture(event.pointerId); } catch {}
    if (moved) { blockedUntil = performance.now() + 350; saveAfterMotion = true; animate(); }
  }

  listen(folder, "click", () => changeOpen(phase === "closed" || phase === "closing"));
  listen(close, "click", () => changeOpen(false));
  listen(folderHit, "pointerenter", () => setHover(true));
  listen(folderHit, "pointerleave", () => setHover(false));
  listen(folderHit, "pointermove", (event) => {
    if (phase !== "closed" || reduced.matches) return;
    if (motion.hoverTarget === 0) setHover(true);
    const bounds = folderHit.getBoundingClientRect();
    motion.tiltY = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5) * 9;
    motion.tiltX = clamp(0.5 - (event.clientY - bounds.top) / bounds.height, -0.5, 0.5) * 6;
    paint();
  });
  listen(folder, "focusin", () => { if (folder.matches(":focus-visible")) setHover(true); });
  listen(folder, "focusout", () => setHover(false));
  listen(stage, "pointerdown", beginDrag);
  listen(stage, "pointermove", track);
  listen(stage, "pointerup", finishDrag);
  listen(stage, "pointercancel", finishDrag);
  listen(stage, "pointerleave", () => enter.classList.remove("is-active"));
  listen(stage, "dragstart", (event) => event.preventDefault());
  listen(stage, "wheel", (event) => {
    if (phase !== "open" || drag) return;
    const input = getWheelSceneInput(event, geometry.height, motion.velocity);
    if (!input) return;
    event.preventDefault(); enter.classList.remove("is-active");
    blockedUntil = performance.now() + 120; saveAfterMotion = true;
    driveScene(scene.yaw + input.yawDelta, scene.pan, input.velocity, "wheel", true);
  }, { passive: false });
  listen(field, "click", (event) => {
    const card = (event.target as Element).closest<HTMLAnchorElement>(".product-gallery-card");
    if (!card) return;
    if (phase !== "open" || (event.detail > 0 && performance.now() < blockedUntil)) {
      event.preventDefault(); event.stopPropagation(); return;
    }
    const index = cards.indexOf(card);
    if (index < 0) return;
    scene.selected = index; motion.velocity = 0; saveAfterMotion = false; persist();
  }, { capture: true });
  listen(field, "focusin", (event) => {
    const card = (event.target as Element).closest<HTMLAnchorElement>(".product-gallery-card");
    if (phase === "open" && card?.matches(":focus-visible")) centerCard(cards.indexOf(card));
  });
  listen(root, "keydown", (event) => {
    if (event.defaultPrevented || root.querySelector('.orbit-navigation[data-open="true"]')) return;
    if (event.key === "Escape" && phase !== "closed") { event.preventDefault(); changeOpen(false); }
    if (phase === "open" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      const order = slots.map((slot, index) => ({ slot, index })).sort((a, b) => a.slot - b.slot);
      const current = order.findIndex(({ index }) => index === scene.selected);
      const next = order[(current + (event.key === "ArrowRight" ? 1 : order.length - 1)) % order.length];
      centerCard(next.index);
      cards[next.index].focus({ preventScroll: true });
    }
  });

  const handleReducedMotion = () => {
    if (!reduced.matches) return;
    motion.velocity = 0; motion.hover = motion.hoverTarget = motion.hoverVelocity = 0;
    if (motion.transition) {
      motion.progress = motion.transition.to; motion.transition = null;
      setPhase(motion.progress === 1 ? "open" : "closed");
    }
    paint();
  };
  reduced.addEventListener("change", handleReducedMotion);
  cleanup.push(() => reduced.removeEventListener("change", handleReducedMotion));
  const resize = new ResizeObserver(measure);
  resize.observe(stage);
  setPhase(phase); measure();

  return {
    dispose() {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect();
      cleanup.forEach((remove) => remove());
      if (drag) { try { stage.releasePointerCapture(drag.id); } catch {} }
      drag = null;
    },
  };
}
