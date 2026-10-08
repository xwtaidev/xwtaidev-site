import type { ReactNode } from "react";
import { ProductGalleryProvider } from "@/components/product-gallery-provider";
import "./products.css";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <ProductGalleryProvider>{children}</ProductGalleryProvider>;
}
