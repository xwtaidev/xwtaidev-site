import type { Metadata } from "next";
import { BlogFeed } from "@/components/blog-feed";
import { getBlogPostPreviews } from "@/lib/blog.server";
import { createSocialMetadata, socialPages } from "@/lib/social";

export const metadata: Metadata = createSocialMetadata(socialPages.blog);

export default function BlogPage() {
  return <BlogFeed posts={getBlogPostPreviews()} />;
}
