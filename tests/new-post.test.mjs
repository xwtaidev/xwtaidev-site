import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { parse } from "yaml";
import { createPost } from "../scripts/new-post.mjs";

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "xwtaidev-new-post-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(join(directory, "_template.md"), '---\ntitle: Template\ndescription: A summary\ndate: "2026-01-01"\ncategory: Design\ndraft: false\nsample: true\n---\n\n## A starting point\n\nWrite something.\n');
  return directory;
}

test("new-post creates a draft from the template with a title, date and custom defaults", (t) => {
  const directory = fixture(t);
  const filename = createPost("my-first-post", "My first post", { directory, date: "2026-10-11" });
  const source = readFileSync(filename, "utf8");
  const metadata = parse(source.match(/^---\n([\s\S]*?)\n---/)[1]);
  assert.equal(metadata.title, "My first post");
  assert.equal(metadata.date, "2026-10-11");
  assert.equal(metadata.category, "Design");
  assert.equal(metadata.draft, true);
  assert.equal(metadata.sample, false);
  assert.match(source, /## A starting point/);
});

test("new-post never overwrites an existing article", (t) => {
  const directory = fixture(t);
  createPost("existing", "Original title", { directory });
  assert.throws(() => createPost("existing", "Replacement title", { directory }), /already exists/i);
  assert.match(readFileSync(join(directory, "existing.md"), "utf8"), /Original title/);
});

test("new-post rejects path traversal and filenames that cannot become article URLs", (t) => {
  const directory = fixture(t);
  for (const slug of ["../escape", "UpperCase", "with spaces", "_template", "post.md"]) {
    assert.throws(() => createPost(slug, "Title", { directory }), /lowercase/i);
  }
});
