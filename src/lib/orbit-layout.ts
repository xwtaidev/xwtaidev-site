type Point = { x: number; y: number };

export function getOrbitLayout(width: number, anchor: Point) {
  const rx = Math.max(64, Math.min(144, (Math.min(width, 340) - 76) / 1.95));
  const ry = 48;
  const tilt = -13 * Math.PI / 180;
  const cos = Math.cos(tilt), sin = Math.sin(tilt);
  // The avatar is the leftmost point of the rotated ellipse.
  const cx = anchor.x + rx * cos, cy = anchor.y + rx * sin;
  const positions = [
    { key: "about", angle: -125 },
    { key: "blog", angle: -40 },
    { key: "products", angle: 35 },
  ] as const;

  return {
    origin: anchor,
    track: { left: cx - rx, top: cy - ry, width: rx * 2, height: ry * 2 },
    nodes: positions.map(({ key, angle }) => {
      const radians = angle * Math.PI / 180;
      return {
        key,
        x: cx + rx * Math.cos(radians) * cos - ry * Math.sin(radians) * sin,
        y: cy + rx * Math.cos(radians) * sin + ry * Math.sin(radians) * cos,
      };
    }),
  };
}
