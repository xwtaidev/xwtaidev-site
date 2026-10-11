import { layoutMasonry } from "./masonry";

export function setupMasonry(root: HTMLElement) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>(":scope > li"));
  let frame: number | null = null;
  let disposed = false;
  let lastWidth = -1;

  function paint() {
    frame = null;
    if (disposed || root.clientWidth <= 0) return;
    lastWidth = root.clientWidth;
    const { cardWidth } = layoutMasonry([], lastWidth);
    cards.forEach((card) => { card.style.width = `${cardWidth}px`; });
    const layout = layoutMasonry(cards.map((card) => card.getBoundingClientRect().height), lastWidth);
    root.dataset.layout = "ready";
    root.style.height = `${layout.height}px`;
    cards.forEach((card, index) => {
      const { x, y } = layout.positions[index];
      card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }

  function schedule() {
    if (disposed || frame !== null) return;
    frame = requestAnimationFrame(paint);
  }

  const observer = new ResizeObserver((entries) => {
    if (entries.some((entry) => entry.target !== root || Math.abs(entry.contentRect.width - lastWidth) > .1)) schedule();
  });
  observer.observe(root);
  cards.forEach((card) => observer.observe(card));
  paint();
  void document.fonts.ready.then(schedule);

  return () => {
    disposed = true;
    observer.disconnect();
    if (frame !== null) cancelAnimationFrame(frame);
  };
}
