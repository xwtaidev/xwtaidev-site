import test from "node:test";
import assert from "node:assert/strict";
import { calculateCoverExtra, calculatePageSize, filterDiscoveries, paginateDiscoveries, pickDiscovery } from "../src/lib/rabbit-holes.ts";

const entries = [
  { title: "Atlas of Space", description: "Explore the solar system", categories: ["Interactive", "Visualizations"] },
  { title: "A tiny game", description: "Play with patterns", categories: ["Games"] },
];

test("search and category filters work together, ignoring case and whitespace", () => {
  assert.deepEqual(filterDiscoveries(entries, "  SOLAR ", "Visualizations"), [entries[0]]);
  assert.deepEqual(filterDiscoveries(entries, "solar", "Games"), []);
  assert.deepEqual(filterDiscoveries(entries, "", "All"), entries);
});

test("surprise selection respects the filtered collection and handles empty results", () => {
  assert.equal(pickDiscovery([], () => 0), null);
  assert.equal(pickDiscovery(entries, () => 0.99), entries[1]);
});

test("pagination returns the requested slice and clamps out-of-range pages", () => {
  const items = Array.from({ length: 30 }, (_, index) => index);
  assert.deepEqual(paginateDiscoveries(items, 2, 20), { items: items.slice(20), page: 2, pageCount: 2 });
  assert.deepEqual(paginateDiscoveries(items, 10, 20), { items: items.slice(20), page: 2, pageCount: 2 });
  assert.deepEqual(paginateDiscoveries([], 2, 20), { items: [], page: 1, pageCount: 1 });
});

test("page size fills the available viewport with complete rows", () => {
  assert.equal(calculatePageSize(4, 720, 220, 10), 12);
  assert.equal(calculatePageSize(6, 480, 220, 10), 12);
  assert.equal(calculatePageSize(1, 100, 220, 10), 1);
});

test("unused height is shared between full rows without stretching sparse results", () => {
  assert.equal(calculateCoverExtra(4, 850, 240, 10, 12), 36);
  assert.equal(calculateCoverExtra(4, 850, 240, 10, 12, 12), 32);
  assert.equal(calculateCoverExtra(4, 850, 240, 10, 5), 0);
  assert.equal(calculateCoverExtra(1, 100, 240, 10, 1), 0);
});
