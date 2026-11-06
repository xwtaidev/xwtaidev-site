import assert from "node:assert/strict";
import { test } from "node:test";
import { createSocialMetadata, getPostSocialCard, socialPages, siteUrl } from "../src/lib/social.ts";

test("every public section has its own absolute share URLs and large X card", () => {
  for (const card of Object.values(socialPages)) {
    const metadata = createSocialMetadata(card);
    assert.equal(metadata.alternates.canonical, new URL(card.path, siteUrl).href);
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(metadata.openGraph.locale, "en_US");
    assert.deepEqual(metadata.openGraph.alternateLocale, ["zh_CN"]);
    assert.match(metadata.openGraph.images[0].url, /^https:\/\/xwtai\.cn\/assets\/social\/.+\.png$/);
    assert.equal(metadata.openGraph.images[0].width, 1200);
    assert.equal(metadata.openGraph.images[0].height, 630);
    assert.equal(metadata.twitter.card, "summary_large_image");
    assert.equal(metadata.twitter.creator, "@xwtaidev");
    assert.equal(metadata.twitter.images[0].url, metadata.openGraph.images[0].url);
  }
  assert.equal(new Set(Object.values(socialPages).map((card) => card.image)).size, 4);
});

test("article cards preserve Unicode titles, escape URLs, and fall back to title for empty summaries", () => {
  const post = { slug: "test-post", title: "Small tools & 中文", description: "", category: "Notes", date: "2026-10-28", author: "徐伟腾", readingMinutes: 2 };
  const card = getPostSocialCard(post);
  const metadata = createSocialMetadata(card);
  assert.equal(card.title, post.title);
  assert.equal(card.description, post.title);
  assert.equal(card.image, "/assets/social/blog/test-post.png");
  assert.equal(metadata.alternates.canonical, "https://xwtai.cn/blog/test-post");
  assert.equal(metadata.openGraph.images[0].alt, `${post.title} — xwtaidev`);
  assert.equal(getPostSocialCard({ ...post, description: "A useful summary." }).description, "A useful summary.");
});
