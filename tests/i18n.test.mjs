import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { getLocale, getServerLocale, localeBootstrap, resolveLocale, setLocale, subscribeLocale } from "../src/lib/i18n.ts";

const storageKey = "xwtaidev-site-locale";

function browserContext(t, blocked = false) {
  const values = new Map();
  const window = new EventTarget();
  window.localStorage = {
    getItem(key) { if (blocked) throw new Error("Storage blocked"); return values.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw new Error("Storage blocked"); values.set(key, value); },
  };
  const document = { documentElement: { lang: "en" } };
  const previous = ["window", "document"].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  Object.assign(globalThis, { window, document });
  t.after(() => previous.forEach(([key, descriptor]) => descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key]));
  return { window, document, values };
}

test("English is the default and unsupported saved languages fall back to it", () => {
  assert.equal(getServerLocale(), "en");
  for (const value of [null, undefined, "", "fr", "zh", "<script>"]) assert.equal(resolveLocale(value), "en");
  assert.equal(resolveLocale("zh-CN"), "zh-CN");
});

test("the bootstrap restores the saved language before hydration", () => {
  for (const saved of [null, "en", "zh-CN", "unsupported"]) {
    const document = { documentElement: { lang: "en" } };
    runInNewContext(localeBootstrap, { document, localStorage: { getItem: () => saved } });
    assert.equal(document.documentElement.lang, resolveLocale(saved));
  }
});

test("the bootstrap remains usable when local storage is blocked", () => {
  const document = { documentElement: { lang: "en" } };
  assert.doesNotThrow(() => runInNewContext(localeBootstrap, { document, localStorage: { getItem() { throw new Error("Blocked"); } } }));
  assert.equal(document.documentElement.lang, "en");
});

test("switching language updates the document, persists the choice, and notifies subscribers", (t) => {
  const { document, values } = browserContext(t);
  let changes = 0;
  const unsubscribe = subscribeLocale(() => changes++);
  setLocale("zh-CN");
  assert.equal(getLocale(), "zh-CN");
  assert.equal(document.documentElement.lang, "zh-CN");
  assert.equal(values.get(storageKey), "zh-CN");
  assert.equal(changes, 1);
  unsubscribe();
  setLocale("en");
  assert.equal(changes, 1);
});

test("switching still works for this page when storage cannot be written", (t) => {
  browserContext(t, true);
  assert.doesNotThrow(() => setLocale("zh-CN"));
  assert.equal(getLocale(), "zh-CN");
});

test("language changes sync across tabs without responding to theme preferences", (t) => {
  const { window } = browserContext(t);
  let changes = 0;
  const unsubscribe = subscribeLocale(() => changes++);
  const dispatch = (key, newValue) => window.dispatchEvent(Object.assign(new Event("storage"), { key, newValue }));
  dispatch("xwtaidev-site-theme", "dark");
  assert.equal(changes, 0);
  dispatch(storageKey, "zh-CN");
  assert.equal(getLocale(), "zh-CN");
  assert.equal(changes, 1);
  dispatch(storageKey, null);
  assert.equal(getLocale(), "en");
  dispatch(null, null);
  assert.equal(changes, 3);
  unsubscribe();
});
