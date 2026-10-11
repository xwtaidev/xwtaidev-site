import type { Metadata } from "next";
import { BlogPostContent } from "@/components/blog-post";
import { notFound } from "next/navigation";
import { getBlogPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog.server";
import { profile } from "@/content/site";

export function generateStaticParams() {
  return getBlogPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  return {
    title: `${post.title} — xwtaidev`,
    description: post.description,
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: { title: post.title, description: post.description, type: "article", publishedTime: post.date, authors: [profile.name] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  return <BlogPostContent post={post} related={getRelatedPosts(post)} />;
}
