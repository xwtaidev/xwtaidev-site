import assert from "node:assert/strict";
import { test } from "node:test";
import { clampStickerPosition, isStickerDrag } from "../src/lib/sticker-drag.ts";

const origin = { left: 120, top: 200, right: 220, bottom: 280 };
const page = { left: 0, top: 0, right: 1440, bottom: 1800 };

test("stickers follow the pointer without snapping when inside the page", () => {
  assert.deepEqual(clampStickerPosition({ x: 53, y: 87 }, origin, page), { x: 53, y: 87 });
});

test("stickers remain reachable when dragged beyond any page edge", () => {
  assert.deepEqual(clampStickerPosition({ x: -500, y: -500 }, origin, page), { x: -108, y: -188 });
  assert.deepEqual(clampStickerPosition({ x: 2000, y: 2000 }, origin, page), { x: 1208, y: 1508 });
});

test("drag bounds use document coordinates so scrolling does not trap a sticker", () => {
  const scrolledOrigin = { left: 24, top: 900, right: 120, bottom: 980 };
  assert.deepEqual(clampStickerPosition({ x: 10, y: -300 }, scrolledOrigin, page), { x: 10, y: -300 });
});

test("tiny pointer movements still allow a click but a real drag suppresses navigation", () => {
  assert.equal(isStickerDrag({ x: 100, y: 100 }, { x: 103, y: 102 }), false);
  assert.equal(isStickerDrag({ x: 100, y: 100 }, { x: 106, y: 100 }), true);
  assert.equal(isStickerDrag({ x: 100, y: 100 }, { x: 96, y: 95 }), true);
});
