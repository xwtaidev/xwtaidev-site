import assert from "node:assert/strict";
import { test } from "node:test";
import { compileMarkdown } from "../src/lib/markdown.ts";

test("Markdown keeps inline formatting and creates stable, unique heading anchors", () => {
  const result = compileMarkdown("An **ordinary** file with `code`.\n\n## A small idea\n\nA [link](/products).\n\n### A smaller idea\n\nText.\n\n## A small idea\n\nAgain.");
  assert.deepEqual(result.headings.map(({ id, depth }) => [id, depth]), [["a-small-idea", 2], ["a-smaller-idea", 3], ["a-small-idea-1", 2]]);
  assert.match(result.html, /<strong>ordinary<\/strong>/);
  assert.match(result.html, /class="article-introduction"/);
  assert.match(result.html, /class="article-section"/);
  assert.match(result.html, /href="#a-small-idea"/);
  assert.match(result.html, /aria-hidden="true"/);
  assert.match(result.html, /href="\/products"/);
});

test("fenced code keeps its filename, language and literal content", () => {
  const result = compileMarkdown('## Code\n\n```typescript title="task.ts"\nconst value = "<script>";\n```');
  assert.match(result.html, /class="article-code"/);
  assert.match(result.html, /<span>task\.ts<\/span>/);
  assert.match(result.html, /TypeScript/);
  assert.match(result.html, /tabindex="0"/);
  assert.match(result.html, /(?:&lt;|&#x3C;|&#60;)script(?:&gt;|>)/i);
});

test("note callouts preserve their title and Markdown body, while ordinary quotes remain quotes", () => {
  const result = compileMarkdown("> [!NOTE] A useful constraint\n>\n> Keep **ordinary** files.\n\n> A regular quotation.");
  assert.match(result.html, /<aside class="article-note">/);
  assert.match(result.html, /<span>A useful constraint<\/span>/);
  assert.match(result.html, /<strong>ordinary<\/strong>/);
  assert.match(result.html, /<blockquote>/);
  assert.doesNotMatch(result.html, /\[!NOTE\]/);
});

test("GitHub-flavored tables, task lists and images render as semantic HTML", () => {
  const result = compileMarkdown("| Tool | Files |\n| --- | --- |\n| Obsidian | Markdown |\n\n- [x] Write\n- [ ] Review\n\n![A notebook](/assets/blog/notebook.webp)");
  assert.match(result.html, /<table>/);
  assert.match(result.html, /type="checkbox"/);
  assert.match(result.html, /alt="A notebook"/);
  assert.match(result.html, /loading="lazy"/);
  assert.match(result.html, /decoding="async"/);
});

test("raw HTML and unsafe URL protocols never become executable article markup", () => {
  const result = compileMarkdown('<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n[bad](javascript:alert%281%29)\n\n![bad](javascript:alert%281%29)');
  assert.doesNotMatch(result.html, /<script|onerror|javascript:/i);
});

test("content headings cannot collide with the reader's own anchor IDs", () => {
  const result = compileMarkdown("## Article content\n\nBody.\n\n## Related title\n\nMore.");
  assert.deepEqual(result.headings.map(({ id }) => id), ["article-content-1", "related-title-1"]);
});
