import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { stringify } from "yaml";
import { getBlogPosts, getBlogPostPreviews, getPostBySlug, getAdjacentPosts } from "../src/lib/blog.server.ts";
import { profile } from "../src/content/site.ts";

function directoryFor(t) {
  const directory = mkdtempSync(join(tmpdir(), "xwtaidev-posts-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function writePost(directory, slug, changes = {}, body = "An introduction.\n\n## A useful idea\n\nA little more detail.") {
  const metadata = { title: "A useful idea", description: "A short description.", date: "2026-10-11", category: "Notes", tags: ["Writing"], ...changes };
  writeFileSync(join(directory, `${slug}.md`), `---\n${stringify(metadata)}---\n\n${body}\n`);
}

test("adding a Markdown file makes it available by its filename, sorted by publication date", (t) => {
  const directory = directoryFor(t);
  writePost(directory, "older-story", { date: "2026-09-30" });
  writePost(directory, "new-story", { category: "Design", cover: "sketch" });
  const options = { directory, includeDrafts: false };
  assert.deepEqual(getBlogPosts(options).map(({ slug }) => slug), ["new-story", "older-story"]);
  const post = getPostBySlug("new-story", options);
  assert.equal(post.category, "Design");
  assert.equal(post.cover, "sketch");
  assert.equal(post.sample, false);
  assert.ok(post.readingMinutes >= 1);
  assert.equal(post.headings[0].id, "a-useful-idea");
});

test("published articles accept omitted, null, empty and whitespace-only descriptions", (t) => {
  const directory = directoryFor(t);
  const cases = [undefined, null, "", " \t\n "];
  for (const [index, description] of cases.entries()) {
    const slug = `without-summary-${index}`;
    writePost(directory, slug, { description });
    const options = { directory, includeDrafts: false };
    const post = getPostBySlug(slug, options);
    assert.equal(post.description, "");
    assert.match(post.html, /An introduction/);
    assert.equal(getBlogPostPreviews(options).find((entry) => entry.slug === slug).description, "");
  }
  writePost(directory, "bare-description", { description: null });
  const filename = join(directory, "bare-description.md");
  writeFileSync(filename, readFileSync(filename, "utf8").replace("description: null", "description:"));
  assert.equal(getPostBySlug("bare-description", { directory, includeDrafts: false }).description, "");
});

test("provided descriptions are trimmed and invalid non-text descriptions still identify the file", (t) => {
  const directory = directoryFor(t);
  writePost(directory, "with-summary", { description: "  A useful summary.  " });
  assert.equal(getPostBySlug("with-summary", { directory }).description, "A useful summary.");
  for (const description of [42, false, [], { text: "A summary" }]) {
    writePost(directory, "invalid-description", { description });
    assert.throws(() => getBlogPosts({ directory }), /invalid-description\.md.*description/);
  }
});

test("Markdown authors are trimmed and retained in article previews", (t) => {
  const directory = directoryFor(t);
  writePost(directory, "guest-story", { author: "  Notebook Guest  " });
  const options = { directory, includeDrafts: false };
  assert.equal(getPostBySlug("guest-story", options).author, "Notebook Guest");
  assert.equal(getBlogPostPreviews(options)[0].author, "Notebook Guest");
});

test("omitted or blank authors use the site author's name", (t) => {
  const directory = directoryFor(t);
  for (const [index, author] of [undefined, null, "", " \t\n "].entries()) {
    const slug = `default-author-${index}`;
    writePost(directory, slug, { author });
    assert.equal(getPostBySlug(slug, { directory, includeDrafts: false }).author, profile.name);
  }
  writePost(directory, "bare-author", { author: null });
  const filename = join(directory, "bare-author.md");
  writeFileSync(filename, readFileSync(filename, "utf8").replace("author: null", "author:"));
  assert.equal(getPostBySlug("bare-author", { directory }).author, profile.name);
});

test("invalid non-text authors identify the file instead of silently replacing the author's name", (t) => {
  const directory = directoryFor(t);
  for (const author of [42, false, ["First", "Second"], { name: "Notebook Guest" }]) {
    writePost(directory, "invalid-author", { author });
    assert.throws(() => getBlogPosts({ directory }), /invalid-author\.md.*author.*string/);
  }
});

test("drafts are previewable locally and absent from published lists, previews and lookups", (t) => {
  const directory = directoryFor(t);
  writePost(directory, "published");
  writePost(directory, "private-draft", { draft: true }, "Private draft body.");
  writePost(directory, "_template", { draft: true });
  const published = { directory, includeDrafts: false };
  assert.deepEqual(getBlogPosts(published).map(({ slug }) => slug), ["published"]);
  assert.equal(getPostBySlug("private-draft", published), undefined);
  assert.equal(getPostBySlug("../private-draft", published), undefined);
  assert.equal(getBlogPostPreviews(published).length, 1);
  assert.equal(getBlogPosts({ directory, includeDrafts: true }).length, 2);
  assert.doesNotMatch(JSON.stringify(getBlogPostPreviews(published)), /Private draft body|private-draft|html/);
});

test("an unfinished draft body cannot break a production build", (t) => {
  const directory = directoryFor(t);
  writePost(directory, "published");
  writePost(directory, "unfinished", { draft: true, title: "" }, "");
  assert.deepEqual(getBlogPosts({ directory, includeDrafts: false }).map(({ slug }) => slug), ["published"]);
  assert.throws(() => getBlogPosts({ directory, includeDrafts: true }), /unfinished\.md.*title/);
});

test("frontmatter failures identify the file and reject invalid dates, flags and card metadata", (t) => {
  const directory = directoryFor(t);
  const cases = [
    [{ title: "" }, /title/],
    [{ date: "2026-02-30" }, /date/],
    [{ draft: "false" }, /draft/],
    [{ cover: "unknown-cover" }, /cover/],
    [{ format: "quote" }, /pullQuote/],
    [{ tags: "Writing" }, /tags/],
  ];
  for (const [changes, error] of cases) {
    writePost(directory, "invalid", changes);
    assert.throws(() => getBlogPosts({ directory }), (failure) => /invalid\.md/.test(failure.message) && error.test(failure.message));
  }
});

test("editing a file refreshes its content without relying on a cached module", (t) => {
  const directory = directoryFor(t);
  writePost(directory, "changing", {}, "First version.");
  assert.match(getBlogPosts({ directory })[0].html, /First version/);
  writePost(directory, "changing", {}, "Other version.");
  assert.match(getBlogPosts({ directory })[0].html, /Other version/);
  assert.match(readFileSync(join(directory, "changing.md"), "utf8"), /Other version/);
});

test("previous and next articles are the nearest older and newer posts across categories", (t) => {
  const directory = directoryFor(t);
  writePost(directory, "distant-older", { date: "2026-10-01", category: "Engineering" });
  writePost(directory, "previous", { date: "2026-10-05", category: "Notes" });
  writePost(directory, "current", { date: "2026-10-06", category: "Engineering" });
  writePost(directory, "next", { date: "2026-10-09", category: "Building" });
  writePost(directory, "distant-newer", { date: "2026-10-11", category: "Engineering" });
  const adjacent = getAdjacentPosts("current", { directory, includeDrafts: false });
  assert.equal(adjacent.previous.slug, "previous");
  assert.equal(adjacent.next.slug, "next");
  assert.equal(adjacent.previous.html, undefined);
  assert.equal(adjacent.next.html, undefined);
});

test("article navigation never wraps at collection boundaries or falls back for unknown articles", (t) => {
  const directory = directoryFor(t);
  writePost(directory, "oldest", { date: "2026-10-01" });
  writePost(directory, "newest", { date: "2026-10-11" });
  const options = { directory, includeDrafts: false };
  assert.equal(getAdjacentPosts("oldest", options).previous, undefined);
  assert.equal(getAdjacentPosts("oldest", options).next.slug, "newest");
  assert.equal(getAdjacentPosts("newest", options).previous.slug, "oldest");
  assert.equal(getAdjacentPosts("newest", options).next, undefined);
  assert.deepEqual(getAdjacentPosts("missing", options), { previous: undefined, next: undefined });
  const single = directoryFor(t);
  writePost(single, "only-post");
  assert.deepEqual(getAdjacentPosts("only-post", { directory: single }), { previous: undefined, next: undefined });
});

test("published article navigation excludes drafts while local previews can include them", (t) => {
  const directory = directoryFor(t);
  writePost(directory, "previous", { date: "2026-10-04" });
  writePost(directory, "older-draft", { date: "2026-10-05", draft: true });
  writePost(directory, "current", { date: "2026-10-06" });
  writePost(directory, "newer-draft", { date: "2026-10-07", draft: true });
  writePost(directory, "next", { date: "2026-10-08" });
  const published = getAdjacentPosts("current", { directory, includeDrafts: false });
  assert.equal(published.previous.slug, "previous");
  assert.equal(published.next.slug, "next");
  const preview = getAdjacentPosts("current", { directory, includeDrafts: true });
  assert.equal(preview.previous.slug, "older-draft");
  assert.equal(preview.next.slug, "newer-draft");
});

test("same-day articles use the collection's stable filename order", (t) => {
  const directory = directoryFor(t);
  for (const slug of ["c-story", "a-story", "b-story"]) writePost(directory, slug);
  const adjacent = getAdjacentPosts("b-story", { directory, includeDrafts: false });
  assert.equal(adjacent.previous.slug, "c-story");
  assert.equal(adjacent.next.slug, "a-story");
});

test("invalid YAML and empty article bodies fail with a useful filename", (t) => {
  const directory = directoryFor(t);
  writeFileSync(join(directory, "broken.md"), '---\ntitle: [broken\n---\n\nBody.');
  assert.throws(() => getBlogPosts({ directory }), /broken\.md/);
  rmSync(join(directory, "broken.md"));
  writePost(directory, "empty", {}, "");
  assert.throws(() => getBlogPosts({ directory }), /empty\.md.*body/i);
});
