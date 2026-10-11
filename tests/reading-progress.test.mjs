import assert from "node:assert/strict";
import { test } from "node:test";
import { getReadingProgress } from "../src/lib/reading-progress.ts";

test("long articles start at zero and finish above the floating navigation", () => {
  assert.equal(getReadingProgress(500, 2400, 900), 0);
  assert.equal(getReadingProgress(88, 2400, 900), 0);
  assert.equal(getReadingProgress(-1612, 2400, 900), 1);
  assert.equal(getReadingProgress(-3000, 2400, 900), 1);
});

test("reading progress accounts for both the top controls and bottom dock", () => {
  assert.equal(getReadingProgress(-762, 2400, 900), .5);
});

test("a short article is complete when all of its text is visible", () => {
  assert.equal(getReadingProgress(900, 300, 900), 0);
  assert.equal(getReadingProgress(500, 300, 900), 0);
  assert.equal(getReadingProgress(480, 300, 900), 1);
});

test("empty content never produces invalid progress", () => {
  assert.equal(getReadingProgress(0, 0, 900), 0);
  assert.ok(Number.isFinite(getReadingProgress(0, 200, 120)));
});
