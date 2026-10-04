import type { Metadata } from "next";
import Link from "next/link";
import { OrbitNavigation } from "@/components/orbit-navigation";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Blog — xwtaidev" };

export default function BlogPage() {
  return (
    <main className="page">
      <header className="identity identity-orbit"><OrbitNavigation currentPage="blog" /></header>
      <section className="introduction" aria-labelledby="blog-title">
        <h1 className="section-title" id="blog-title">Blog</h1>
        <p>Notes on building AI tools, productivity apps, and independent projects.</p>
        <p>Writing is on the way.</p>
      </section>
      <Link className="text-link back-link" href="/">← Home</Link>
      <SiteFooter />
    </main>
  );
}
