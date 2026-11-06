import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { themeBootstrap, themeColors, themeFavicons, themePngFavicons, themeSvgFavicons, toggleTheme, subscribeTheme } from "../src/lib/theme.ts";

function fixture(saved = "dark", metaPresent = true) {
  const nodes = new Map(["site-icon", "site-icon-png", "site-icon-svg", "theme-color"].map((id) => [id, { values: {}, setAttribute(key, value) { this.values[key] = value; } }]));
  const values = new Map([["xwtaidev-site-theme", saved]]);
  const localStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const document = Object.assign(new EventTarget(), {
    documentElement: { dataset: { theme: "light" } }, readyState: "loading", metaPresent,
    getElementById: (id) => nodes.get(id),
    querySelector(selector) { return selector === 'meta[name="theme-color"]' && this.metaPresent ? nodes.get("theme-color") : null; },
  });
  return { document, nodes, localStorage, values };
}

function assertAssets(nodes, theme) {
  assert.equal(nodes.get("site-icon").values.href, themeFavicons[theme]);
  assert.equal(nodes.get("site-icon-png").values.href, themePngFavicons[theme]);
  assert.equal(nodes.get("site-icon-svg").values.href, themeSvgFavicons[theme]);
  assert.equal(nodes.get("theme-color").values.content, themeColors[theme]);
}

test("the bootstrap restores all favicon formats and toolbar color for the saved theme", () => {
  for (const saved of ["light", "dark", null, "invalid"]) {
    const context = fixture(saved);
    runInNewContext(themeBootstrap, context);
    const expected = saved === "dark" ? "dark" : "light";
    assert.equal(context.document.documentElement.dataset.theme, expected);
    assertAssets(context.nodes, expected);
  }
});

test("the bootstrap updates theme-color even if metadata is parsed after the bootstrap script", () => {
  const context = fixture("dark", false);
  runInNewContext(themeBootstrap, context);
  assert.equal(context.nodes.get("theme-color").values.content, undefined);
  context.document.metaPresent = true;
  context.document.dispatchEvent(new Event("DOMContentLoaded"));
  assertAssets(context.nodes, "dark");
});

test("manual theme changes and cross-tab changes keep every icon and theme-color synchronized", (t) => {
  const context = fixture("light");
  const window = Object.assign(new EventTarget(), { localStorage: context.localStorage });
  const previous = ["window", "document", "localStorage"].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  Object.assign(globalThis, { window, document: context.document, localStorage: context.localStorage });
  t.after(() => previous.forEach(([key, descriptor]) => descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key]));
  let changes = 0;
  const unsubscribe = subscribeTheme(() => changes++);
  toggleTheme();
  assertAssets(context.nodes, "dark");
  assert.equal(context.values.get("xwtaidev-site-theme"), "dark");
  window.dispatchEvent(Object.assign(new Event("storage"), { key: "xwtaidev-site-theme", newValue: "light" }));
  assertAssets(context.nodes, "light");
  assert.equal(changes, 2);
  unsubscribe();
});
