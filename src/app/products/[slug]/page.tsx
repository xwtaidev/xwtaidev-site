import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { ProductsHeader } from "@/components/products-header";
import { SiteFooter } from "@/components/site-footer";
import { products } from "@/content/products";
import { details } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((entry) => entry.slug === slug);
  if (!product) return {};
  const content = details[product.id];
  return { title: `${content.title} — xwtaidev`, description: content.paragraphs[0] };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((entry) => entry.slug === slug);
  if (!product) notFound();
  const content = details[product.id];

  return (
    <main className="products-page product-detail-page">
      <ProductsHeader detail>
        <Link className="product-back" href="/products"><Icon name="back" className="product-back-icon" /><span>All products</span></Link>
      </ProductsHeader>
      <article className="product-detail">
        <div className="product-detail-cover"><Image src={product.cover} alt={product.coverAlt} width={1000} height={667} sizes="(max-width: 600px) calc(100vw - 48px), 600px" priority /></div>
        <div className="product-detail-copy">
          <span className="dialog-eyebrow">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {content.links && <div className="product-detail-links">{content.links.map((link) => (
            <a className="text-link" key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.icon === "obsidian" ? <Image src="/assets/icons/obsidian.svg" alt="" width={16} height={16} /> : <Icon name="github" className="product-link-icon" />}
              <span>{link.label}</span><Icon name="external" className="product-link-icon" />
            </a>
          ))}</div>}
        </div>
      </article>
      <SiteFooter showTheme={false} showHome />
    </main>
  );
}
