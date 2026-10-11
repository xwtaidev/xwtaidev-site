import assert from "node:assert/strict";
import { test } from "node:test";
import { filterPosts, formatPostDate, getBlogCategories } from "../src/content/blog.ts";
import { getBlogPosts, getPostBySlug } from "../src/lib/blog.server.ts";

const blogPosts = getBlogPosts({ includeDrafts: false });
const searchablePosts = [
  { title: "Plain text is a feature", description: "Notes in Obsidian.", category: "Engineering", tags: ["Markdown"] },
  { title: "Making a small tool", description: "A useful starting point.", category: "Building", tags: ["Independent work"] },
];

test("post dates follow the chosen language while retaining the UTC calendar date", () => {
  assert.equal(formatPostDate("2026-10-06"), "Oct 6, 2026");
  assert.equal(formatPostDate("2026-10-06", false, "zh-CN"), "2026年10月6日");
  assert.equal(formatPostDate("2026-10-06", true, "zh-CN"), "10月6日");
});

test("search and category filters work together, regardless of case or surrounding whitespace", () => {
  const results = filterPosts(searchablePosts, "Engineering", "  OBSIDIAN  ");
  assert.ok(results.length > 0);
  assert.ok(results.every((post) => post.category === "Engineering"));
  assert.ok(results.every((post) => `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase().includes("obsidian")));
});

test("search finds all query words across post metadata and handles no matches", () => {
  assert.ok(filterPosts(searchablePosts, "All", "plain obsidian").includes(searchablePosts[0]));
  assert.deepEqual(filterPosts(searchablePosts, "All", "an-impossible-search-term"), []);
  assert.deepEqual(filterPosts(searchablePosts, "All", "  "), searchablePosts);
});

test("article lookup never silently falls back for an unknown route", () => {
  assert.equal(getPostBySlug("missing-article"), undefined);
  for (const post of blogPosts) assert.equal(getPostBySlug(post.slug), post);
});

test("published Markdown files have unique slugs and newest-first dates", () => {
  assert.equal(new Set(blogPosts.map(({ slug }) => slug)).size, blogPosts.length);
  assert.deepEqual(blogPosts.map(({ date }) => date), blogPosts.map(({ date }) => date).sort().reverse());
});

test("categories written in Markdown appear automatically after the established topics", () => {
  assert.deepEqual(getBlogCategories([{ category: "Notes" }, { category: "Design" }, { category: "Building" }, { category: "Engineering" }]), ["All", "Building", "Engineering", "Notes", "Design"]);
});
