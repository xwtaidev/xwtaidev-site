import type { Metadata } from "next";
import { ProductGallery } from "@/components/product-gallery";
import { createSocialMetadata, socialPages } from "@/lib/social";

export const metadata: Metadata = createSocialMetadata(socialPages.products);

export default function ProductsPage() {
  return (
    <main className="products-gallery-page">
      <ProductGallery />
    </main>
  );
}
