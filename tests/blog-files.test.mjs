import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { stringify } from "yaml";
import { getBlogPosts, getBlogPostPreviews, getPostBySlug, getRelatedPosts } from "../src/lib/blog.server.ts";

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

test("related reading uses the Markdown collection, excludes the current article and prioritizes its category", (t) => {
  const directory = directoryFor(t);
  writePost(directory, "current");
  writePost(directory, "same-topic");
  writePost(directory, "other-topic", { category: "Design" });
  const options = { directory, includeDrafts: false };
  const current = getPostBySlug("current", options);
  const related = getRelatedPosts(current, options);
  assert.equal(related.length, 2);
  assert.equal(related[0].slug, "same-topic");
  assert.ok(related.every((post) => post.slug !== current.slug));
});

test("invalid YAML and empty article bodies fail with a useful filename", (t) => {
  const directory = directoryFor(t);
  writeFileSync(join(directory, "broken.md"), '---\ntitle: [broken\n---\n\nBody.');
  assert.throws(() => getBlogPosts({ directory }), /broken\.md/);
  rmSync(join(directory, "broken.md"));
  writePost(directory, "empty", {}, "");
  assert.throws(() => getBlogPosts({ directory }), /empty\.md.*body/i);
});
