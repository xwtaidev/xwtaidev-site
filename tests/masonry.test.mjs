import assert from "node:assert/strict";
import { test } from "node:test";
import { layoutMasonry } from "../src/lib/masonry.ts";

test("uneven cards stay inside their columns without overlapping", () => {
  const heights = [426, 287, 354, 498, 312, 404, 268, 376, 455];
  const layout = layoutMasonry(heights, 1240);
  assert.equal(layout.columns, 4);
  assert.deepEqual(layout.positions.slice(0, 4).map(({ y }) => y), [18, 0, 36, 9]);
  layout.positions.forEach((position, index) => {
    assert.ok(position.x >= 0 && position.x + layout.cardWidth <= 1240.001);
    for (let previous = 0; previous < index; previous++) {
      const other = layout.positions[previous];
      if (position.column === other.column) assert.ok(position.y >= other.y + heights[previous] + 23.999);
    }
    assert.ok(layout.height >= position.y + heights[index]);
  });
});

test("appending another page does not move any existing cards", () => {
  const firstPage = [426, 287, 354, 498, 312, 404];
  const before = layoutMasonry(firstPage, 1100);
  const after = layoutMasonry([...firstPage, 330, 465, 291, 402], 1100);
  assert.deepEqual(after.positions.slice(0, firstPage.length), before.positions);
  assert.ok(after.height > before.height);
});

test("phone layouts use one column and preserve article order", () => {
  const layout = layoutMasonry([310, 455, 278], 280);
  assert.equal(layout.columns, 1);
  assert.equal(layout.cardWidth, 280);
  assert.deepEqual(layout.positions.map(({ x, y }) => [x, y]), [[0, 0], [0, 334], [0, 813]]);
  assert.equal(layout.height, 1091);
});

test("an empty result has zero height", () => {
  assert.equal(layoutMasonry([], 1240).height, 0);
});
