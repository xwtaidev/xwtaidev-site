import assert from "node:assert/strict";
import { test } from "node:test";
import { getOrbitLayout } from "../src/lib/orbit-layout.ts";

const widths = [225, 272, 327, 342, 382, 540];
const sizes = { about: 110, blog: 80, products: 107 };

for (const width of widths) {
  test(`avatar lies on the ellipse at ${width}px`, () => {
    const anchor = { x: 20, y: 132 };
    const { track } = getOrbitLayout(width, anchor);
    const dx = anchor.x - (track.left + track.width / 2);
    const dy = anchor.y - (track.top + track.height / 2);
    const angle = -13 * Math.PI / 180;
    const x = dx * Math.cos(angle) + dy * Math.sin(angle);
    const y = -dx * Math.sin(angle) + dy * Math.cos(angle);
    const distance = (x / (track.width / 2)) ** 2 + (y / (track.height / 2)) ** 2;
    assert.ok(Math.abs(distance - 1) < 0.000001);
  });

  test(`navigation remains readable and clear of the introduction at ${width}px`, () => {
    const { nodes } = getOrbitLayout(width, { x: 20, y: 132 });
    const boxes = nodes.map(({ key, x, y }) => ({
      left: x - sizes[key] / 2,
      right: x + sizes[key] / 2,
      top: y - 22,
      bottom: y + 22,
    }));
    for (const box of boxes) {
      assert.ok(box.left >= -24 && box.right <= width + 24, "stay inside the page gutters");
      assert.ok(box.top >= 0, "fit inside the reserved space above the avatar");
      assert.ok(box.bottom - 110 < 72, "do not obscure the introduction");
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        const intersects = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        assert.equal(intersects, false, "touch targets must not overlap");
      }
    }
    assert.ok(nodes[0].key === "about" && nodes[0].x < nodes[1].x);
    assert.ok(nodes[1].key === "blog" && nodes[1].y < nodes[2].y);
  });
}
