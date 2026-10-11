"use client";

import Image from "next/image";
import { useId, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { products } from "@/content/products";
import { getDetails } from "@/content/site";
import { setupProductGallery } from "@/lib/product-gallery-controller";
import { Icon } from "./icon";
import { useProductGalleryStore } from "./product-gallery-provider";
import { useLocale } from "./locale-provider";
import { SiteDock } from "./site-dock";
import { Tooltip } from "./tooltip";

const slots = products.map((product) => product.slot);
const cardSides = ["front", "back"] as const;

export function ProductGallery() {
  const { locale, messages } = useLocale();
  const details = getDetails(locale);
  const store = useProductGalleryStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldId = useId();
  const closeHintId = useId();
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
      <h1 className="sr-only">{messages.navigation.products}</h1>
      <SiteDock activePage="products" hint={closed ? undefined : messages.products.hint} action={
        <span className="site-dock-custom-action" hidden={closed}>
          <Tooltip id={closeHintId} content={messages.products.closeFolder}>
            <button className="icon-button product-gallery-close t-tt-trigger" type="button" aria-label={messages.products.closeFolder} aria-describedby={closeHintId}>
              <Icon name="back" className="product-back-icon" />
            </button>
          </Tooltip>
        </span>
      } />
      <div className="product-gallery-stage">
        <div className="product-folder-floor" aria-hidden="true" />
        <div className="product-gallery-field" id={fieldId} aria-label={messages.products.collection} inert={snapshot.phase !== "open"}>
          {products.map((product, index) => {
            const content = details[product.id];
            const href = content.links?.[0]?.href;
            const cardProps = {
              className: "product-gallery-card",
              "aria-label": href ? messages.products.openItem.replace("{name}", content.title) : content.title,
              "aria-current": snapshot.selected === index ? "true" as const : undefined,
              "data-product": product.id,
              draggable: false,
            };
            const faces = cardSides.map((side) => (
              <span className={`product-gallery-face product-gallery-face-${side}`} key={side} aria-hidden={side === "back" ? true : undefined}>
                <Image className="product-gallery-cover" src={product.cover} alt={side === "front" ? messages.products.covers[product.id] : ""} width={1536} height={1024} sizes="(max-width: 600px) 320px, 520px" loading="eager" draggable={false} />
                <span className="product-gallery-shade" aria-hidden="true" />
                <span className="product-gallery-wordmark" aria-hidden="true">
                  <Icon name={product.icon} className="product-wordmark-icon" />
                  <span>{content.title}<small>{product.id === "vibespace" ? messages.products.agent : messages.products.plugin}</small></span>
                </span>
              </span>
            ));

            return href ? (
              <a {...cardProps} href={href} target="_blank" rel="noopener noreferrer" key={product.id}>{faces}</a>
            ) : (
              <div {...cardProps} role="group" aria-disabled="true" aria-describedby={`${fieldId}-${product.id}-status`} tabIndex={-1} key={product.id}>
                {faces}
              </div>
            );
          })}
        </div>
        {products.filter((product) => !details[product.id].links?.[0]?.href).map((product) => (
          <span className="product-gallery-status t-tt" id={`${fieldId}-${product.id}-status`} role="tooltip" aria-hidden={snapshot.phase !== "open"} key={product.id}>{details[product.id].eyebrow}</span>
        ))}
        <div className="product-folder-hit">
          <button className="product-folder" type="button" aria-label={expanded ? messages.products.closeProductsFolder : messages.products.openFolder} aria-expanded={expanded} aria-controls={fieldId}>
            <span className="product-folder-back" aria-hidden="true"><span /></span>
            <span className="product-folder-paper product-folder-paper-one" aria-hidden="true" />
            <span className="product-folder-paper product-folder-paper-two" aria-hidden="true" />
            <span className="product-folder-paper product-folder-paper-three" aria-hidden="true" />
            <span className="product-folder-flap" aria-hidden="true">
              <span className="product-folder-rim" />
              <span className="product-folder-label">{messages.navigation.products}<small>{messages.products.selectedWork}</small></span>
              <span className="product-folder-count">{String(products.length).padStart(2, "0")}</span>
            </span>
          </button>
        </div>
        <span className="product-gallery-enter" aria-hidden="true"><Icon name="external" className="product-enter-icon" /></span>
      </div>
    </div>
  );
}
