import type { GalleryPhase, GalleryScene } from "./product-gallery";

export type ProductGallerySnapshot = GalleryScene & { phase: GalleryPhase };

const initialSnapshot: ProductGallerySnapshot = { phase: "closed", yaw: 0, pan: 0, selected: 0 };

export function createProductGalleryStore() {
  let snapshot = initialSnapshot;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initialSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    update(next: Partial<ProductGallerySnapshot>) {
      const updated = { ...snapshot, ...next };
      if (updated.phase === snapshot.phase && updated.yaw === snapshot.yaw && updated.pan === snapshot.pan && updated.selected === snapshot.selected) return;
      snapshot = updated;
      listeners.forEach((listener) => listener());
    },
  };
}

export type ProductGalleryStore = ReturnType<typeof createProductGalleryStore>;
