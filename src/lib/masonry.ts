export function layoutMasonry(heights: readonly number[], width: number, gap = 24, minCardWidth = 270) {
  const columns = Math.max(1, Math.min(4, Math.floor((width + gap) / (minCardWidth + gap))));
  const cardWidth = Math.max(0, (width - gap * (columns - 1)) / columns);
  const bottoms = Array.from({ length: columns }, (_, index) => columns > 1 ? [18, 0, 36, 9][index] : 0);
  const positions = heights.map((height, index) => {
    const column = index < columns ? index : bottoms.indexOf(Math.min(...bottoms));
    const position = { x: column * (cardWidth + gap), y: bottoms[column], column };
    bottoms[column] += Math.max(0, height) + gap;
    return position;
  });
  return { columns, cardWidth, positions, height: heights.length ? Math.max(...bottoms) - gap : 0 };
}
