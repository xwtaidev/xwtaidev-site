export type StickerPoint = { x: number; y: number };
export type StickerBounds = { left: number; top: number; right: number; bottom: number };

export function clampStickerPosition(position: StickerPoint, origin: StickerBounds, area: StickerBounds): StickerPoint {
  const inset = 12;
  return {
    x: Math.min(Math.max(position.x, area.left + inset - origin.left), area.right - inset - origin.right),
    y: Math.min(Math.max(position.y, area.top + inset - origin.top), area.bottom - inset - origin.bottom),
  };
}

export function isStickerDrag(start: StickerPoint, current: StickerPoint): boolean {
  return Math.hypot(current.x - start.x, current.y - start.y) >= 6;
}
