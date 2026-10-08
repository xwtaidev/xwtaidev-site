"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { products } from "@/content/products";
import { details } from "@/content/site";
import { setupProductGallery } from "@/lib/product-gallery-controller";
import { Icon } from "./icon";
import { useProductGalleryStore } from "./product-gallery-provider";
import { ThemeButton } from "./theme-button";

const slots = products.map((product) => product.slot);

export function ProductGallery() {
  const store = useProductGalleryStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldId = useId();
  const expanded = snapshot.phase === "opening" || snapshot.phase === "open";
  const closed = snapshot.phase === "closed";

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const gallery = setupProductGallery(root, store, slots);
    return () => gallery.dispose();
  }, [store]);

  return (
    <div ref={rootRef} className="product-gallery" data-phase={snapshot.phase} data-progress="0">
      <h1 className="sr-only">Products</h1>
      <nav className="product-gallery-controls" aria-label="Gallery controls">
        <div className="product-gallery-utilities" inert={!closed} aria-hidden={!closed}>
          <Link className="product-gallery-home" href="/" aria-label="Back to home">
            <Image className="signature" src="/assets/signature-xwt.png" alt="" width={64} height={25} sizes="64px" />
            <span>Home</span>
          </Link>
          <ThemeButton />
        </div>
        <div className="product-gallery-open-controls" inert={closed} aria-hidden={closed}>
          <button className="product-back product-gallery-close" type="button">
            <Icon name="back" className="product-back-icon" /><span>Close folder</span>
          </button>
          <span className="product-gallery-hint">Drag or scroll to rotate · Click to open</span>
        </div>
      </nav>
      <div className="product-gallery-stage">
        <div className="product-folder-floor" aria-hidden="true" />
        <div className="product-gallery-field" id={fieldId} aria-label="Product collection" inert={snapshot.phase !== "open"}>
          {products.map((product, index) => (
            <Link
              className="product-gallery-card"
              href={`/products/${product.slug}`}
              key={product.id}
              aria-label={`Open ${details[product.id].title}`}
              aria-current={snapshot.selected === index ? "true" : undefined}
              data-product={product.id}
              draggable={false}
            >
              <Image className="product-gallery-cover" src={product.cover} alt={product.coverAlt} width={1000} height={667} sizes="(max-width: 600px) 320px, 520px" loading="eager" draggable={false} />
              <span className="product-gallery-shade" aria-hidden="true" />
              <span className="product-gallery-wordmark" aria-hidden="true">
                <Icon name={product.icon} className="product-wordmark-icon" />
                <span>{details[product.id].title}<small>{product.label}</small></span>
              </span>
            </Link>
          ))}
        </div>
        <div className="product-folder-hit">
          <button className="product-folder" type="button" aria-label={expanded ? "Close products folder" : "Open products folder"} aria-expanded={expanded} aria-controls={fieldId}>
            <span className="product-folder-back" aria-hidden="true"><span /></span>
            <span className="product-folder-paper product-folder-paper-one" aria-hidden="true" />
            <span className="product-folder-paper product-folder-paper-two" aria-hidden="true" />
            <span className="product-folder-paper product-folder-paper-three" aria-hidden="true" />
            <span className="product-folder-flap" aria-hidden="true">
              <span className="product-folder-rim" />
              <span className="product-folder-label">Products<small>Selected work</small></span>
              <span className="product-folder-count">{String(products.length).padStart(2, "0")}</span>
            </span>
          </button>
        </div>
        <span className="product-gallery-enter" aria-hidden="true"><Icon name="external" className="product-enter-icon" /></span>
      </div>
    </div>
  );
}
