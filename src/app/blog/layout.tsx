import type { ReactNode } from "react";
import { BlogFeedProvider } from "@/components/blog-feed-provider";
import "./blog.css";
import "./feed.css";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <BlogFeedProvider>{children}</BlogFeedProvider>;
}
