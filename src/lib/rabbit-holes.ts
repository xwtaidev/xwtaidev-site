export type SearchableDiscovery = {
  title: string;
  description: string;
  categories: readonly string[];
};

export function filterDiscoveries<T extends SearchableDiscovery>(entries: readonly T[], query: string, category: string): T[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    const searchable = `${entry.title} ${entry.description} ${entry.categories.join(" ")}`.toLowerCase();
    return (category === "All" || entry.categories.includes(category)) && terms.every((term) => searchable.includes(term));
  });
}

export function pickDiscovery<T>(entries: readonly T[], random: () => number = Math.random): T | null {
  return entries.length ? entries[Math.floor(random() * entries.length)] ?? null : null;
}

export function paginateDiscoveries<T>(entries: readonly T[], requestedPage: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
  const page = Math.max(1, Math.min(requestedPage, pageCount));
  return { items: entries.slice((page - 1) * pageSize, page * pageSize), page, pageCount };
}

export function calculatePageSize(columns: number, availableHeight: number, cardHeight: number, gap: number) {
  const rows = Math.max(1, Math.floor((availableHeight + gap) / (cardHeight + gap)));
  return Math.max(1, columns) * rows;
}

export function calculateCoverExtra(columns: number, availableHeight: number, cardHeight: number, gap: number, itemCount: number, safetyMargin = 0) {
  const pageSize = calculatePageSize(columns, availableHeight, cardHeight, gap);
  if (itemCount < pageSize) return 0;
  const rows = pageSize / Math.max(1, columns);
  const remaining = availableHeight - safetyMargin - rows * cardHeight - (rows - 1) * gap;
  return Math.max(0, Math.min(80, Math.floor(remaining / rows)));
}
