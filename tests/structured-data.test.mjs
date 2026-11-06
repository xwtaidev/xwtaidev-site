import assert from "node:assert/strict";
import { test } from "node:test";
import { getArticleStructuredData, getSiteStructuredData, serializeJsonLd } from "../src/lib/structured-data.ts";

test("site structured data connects the real developer to the website", () => {
  const graph = getSiteStructuredData()["@graph"];
  const person = graph.find((node) => node["@type"] === "Person");
  const site = graph.find((node) => node["@type"] === "WebSite");
  assert.equal(site.publisher["@id"], person["@id"]);
  assert.equal(person.name, "xwtaidev");
  assert.equal(person.jobTitle, "Independent AI Developer");
  assert.ok(person.sameAs.includes("https://github.com/xwtaidev"));
  assert.equal(site.url, "https://xwtai.cn/");
});

test("article structured data preserves the actual author and publication date", () => {
  const post = { slug: "test-story", title: "AI & 中文", description: "", author: "徐伟腾", date: "2026-10-28", category: "Notes", readingMinutes: 2 };
  const article = getArticleStructuredData(post);
  assert.equal(article["@type"], "BlogPosting");
  assert.equal(article.headline, post.title);
  assert.equal(article.description, post.title);
  assert.equal(article.author.name, post.author);
  assert.equal(article.datePublished, post.date);
  assert.equal(article.mainEntityOfPage, "https://xwtai.cn/blog/test-story");
  assert.deepEqual(article.image, ["https://xwtai.cn/assets/social/blog/test-story.png"]);
  assert.equal(getArticleStructuredData({ ...post, description: "A useful summary." }).description, "A useful summary.");
});

test("JSON-LD cannot close its script element when article text contains HTML", () => {
  const data = { headline: '</script><script>alert("x")</script>', description: "<b>中文 & text</b>" };
  const serialized = serializeJsonLd(data);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), data);
});
