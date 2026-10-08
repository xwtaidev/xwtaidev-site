import type { Metadata } from "next";
import { ProductGallery } from "@/components/product-gallery";

export const metadata: Metadata = { title: "Products — xwtaidev" };

export default function ProductsPage() {
  return (
    <main className="products-gallery-page">
      <ProductGallery />
    </main>
  );
}
