"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createProductGalleryStore, type ProductGalleryStore } from "@/lib/product-gallery-store";

const ProductGalleryContext = createContext<ProductGalleryStore | null>(null);

export function ProductGalleryProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createProductGalleryStore);
  return <ProductGalleryContext.Provider value={store}>{children}</ProductGalleryContext.Provider>;
}

export function useProductGalleryStore() {
  const store = useContext(ProductGalleryContext);
  if (!store) throw new Error("Product gallery must be inside ProductGalleryProvider.");
  return store;
}
