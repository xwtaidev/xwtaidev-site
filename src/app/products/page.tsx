import type { Metadata } from "next";
import Link from "next/link";
import { DetailButton } from "@/components/detail-trigger";
import { Icon } from "@/components/icon";
import { OrbitNavigation } from "@/components/orbit-navigation";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Products — xwtaidev" };

const products = [
  { detail: "lattice", title: "Lattice Board", description: "A Kanban-style view of your notes inside Obsidian." },
  { detail: "weekly", title: "Weekly Schedule", description: "Plan and review the week without leaving Obsidian." },
  { detail: "vibespace", title: "VibeSpace", description: "A local-first AI workspace for macOS. In development." },
] as const;

export default function ProductsPage() {
  return (
    <main className="page">
      <header className="identity identity-orbit"><OrbitNavigation currentPage="products" /></header>
      <section aria-labelledby="products-title">
        <h1 className="section-title" id="products-title">Products</h1>
        <div className="product-list">
          {products.map(({ detail, title, description }) => (
            <article key={detail}>
              <h2><DetailButton detail={detail} className="product-detail-link"><span>{title}</span><Icon name="external" className="external-icon" /></DetailButton></h2>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <Link className="text-link back-link" href="/">← Home</Link>
      <SiteFooter />
    </main>
  );
}
