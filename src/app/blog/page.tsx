import type { Metadata } from "next";
import { BlogFeed } from "@/components/blog-feed";
import { getBlogPostPreviews } from "@/lib/blog.server";

export const metadata: Metadata = {
  title: "Blog — xwtaidev",
  description: "Notes on software, small products, and the process of making things. A blog by xwtaidev, developer and independent maker.",
};

export default function BlogPage() {
  return <BlogFeed posts={getBlogPostPreviews()} />;
}
