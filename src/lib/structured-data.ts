import type { BlogPostPreview } from "../content/blog.ts";
import { profile } from "../content/site.ts";
import { getPostSocialCard, siteUrl, socialPages } from "./social.ts";

export function serializeJsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function getSiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person", "@id": `${siteUrl}/#person`, name: profile.name,
        url: `${siteUrl}/`, jobTitle: "Independent AI Developer",
        sameAs: [profile.github, profile.x],
      },
      {
        "@type": "WebSite", "@id": `${siteUrl}/#website`, name: profile.name,
        url: `${siteUrl}/`, description: socialPages.home.description,
        inLanguage: ["en", "zh-CN"], publisher: { "@id": `${siteUrl}/#person` },
      },
    ],
  };
}

export function getArticleStructuredData(post: Pick<BlogPostPreview, "slug" | "title" | "description" | "author" | "date" | "category" | "readingMinutes">) {
  const card = getPostSocialCard(post);
  const url = new URL(card.path, siteUrl).href;
  return {
    "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${url}#article`,
    url, mainEntityOfPage: url, headline: post.title, description: card.description,
    datePublished: post.date, author: { "@type": "Person", name: post.author },
    publisher: { "@id": `${siteUrl}/#person` }, isPartOf: { "@id": `${siteUrl}/#website` },
    image: [new URL(card.image, siteUrl).href], articleSection: post.category,
  };
}
