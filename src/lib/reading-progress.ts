export function getReadingProgress(articleTop: number, articleHeight: number, viewportHeight: number, topInset = 88, bottomInset = 112) {
  if (articleHeight <= 0) return 0;
  const readingBottom = Math.max(topInset, viewportHeight - bottomInset);
  const availableHeight = Math.max(1, readingBottom - topInset);
  const distance = articleHeight - availableHeight;
  if (distance <= 0) return Number(articleTop + articleHeight <= readingBottom);
  return Math.max(0, Math.min(1, (topInset - articleTop) / distance));
}
