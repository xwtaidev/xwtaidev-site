import type { Metadata } from "next";
import { BlogPostContent } from "@/components/blog-post";
import { notFound } from "next/navigation";
import { getBlogPosts, getPostBySlug, getAdjacentPosts } from "@/lib/blog.server";
import { createSocialMetadata, getPostSocialCard } from "@/lib/social";

export function generateStaticParams() {
  return getBlogPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const social = createSocialMetadata(getPostSocialCard(post));
  return {
    ...social,
    authors: [{ name: post.author }],
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: { ...social.openGraph, type: "article", publishedTime: post.date, authors: [post.author], tags: [...post.tags] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const adjacent = getAdjacentPosts(slug);
  return <BlogPostContent post={post} previous={adjacent.previous} next={adjacent.next} />;
}
