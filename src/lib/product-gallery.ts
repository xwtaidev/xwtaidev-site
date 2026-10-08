export type GalleryPhase = "closed" | "opening" | "open" | "closing";
export type GalleryScene = { yaw: number; pan: number; selected: number };
export type GalleryTransition = { from: number; to: number; start: number; duration: number };

export type GalleryGeometry = ReturnType<typeof getGalleryGeometry>;
export type GalleryCardPose = ReturnType<typeof getGalleryCardPose>;

export const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const mix = (a: number, b: number, progress: number) => a + (b - a) * progress;
const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value, 0, 1), 3);
const easeInOut = (value: number) => {
  const progress = clamp(value, 0, 1);
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
};

export function getGalleryGeometry(width: number, height: number) {
  const mobile = width < 600;
  const cardWidth = Math.min(320, Math.max(205, width * 0.64));
  const cardHeight = cardWidth * 215 / 320;
  return {
    width,
    height,
    mobile,
    radius: Math.min(432, width * 0.355),
    // Narrow cylinders bring neighboring planes together; separate their vertical extents.
    step: mobile ? cardHeight + 16 : Math.min(170, height * 0.205),
    cardWidth,
    cardHeight,
  };
}

export function getTransitionProgress(transition: GalleryTransition, now: number) {
  if (transition.duration <= 0) return transition.to;
  return mix(transition.from, transition.to, clamp((now - transition.start) / transition.duration, 0, 1));
}

export function getGalleryCardPose(slot: number, geometry: GalleryGeometry, progress: number, scene: Pick<GalleryScene, "yaw" | "pan">) {
  const rise = easeOut((progress - (0.15 + slot * 0.065)) / 0.3);
  const fan = easeInOut((progress - (0.43 + slot * 0.03)) / 0.48);
  const angle = 90 + (slot - 1) * 45 + scene.yaw;
  const radians = angle * Math.PI / 180;
  const originX = -geometry.width * (geometry.mobile ? 0.02 : 0.05);
  const endX = -geometry.radius * Math.cos(radians);
  const endY = (slot - 1) * geometry.step + scene.pan;
  const endZ = geometry.radius * Math.sin(radians);

  return {
    x: mix(mix(originX + (slot - 1) * 4, originX + (slot - 1) * 8, rise), endX, fan),
    y: mix(mix(20 + slot * 2, -112 - (2 - slot) * 9, rise), endY, fan),
    z: mix(mix(slot * 2, 30 + slot * 4, rise), endZ, fan),
    scale: mix(mix(0.5, 0.66, rise), 1, fan),
    yaw: (angle - 90) * fan,
    roll: (slot - 1) * 4 * rise * (1 - fan),
    opacity: clamp((progress - (0.14 + slot * 0.065)) / 0.09, 0, 1),
  };
}

type WheelInput = Pick<WheelEvent, "deltaX" | "deltaY" | "deltaMode"> & Partial<Pick<WheelEvent, "ctrlKey" | "metaKey">>;

export function getWheelSceneInput(event: WheelInput, height: number, velocity: number) {
  if (event.ctrlKey || event.metaKey) return null;
  const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height * 0.6 : 1;
  const delta = clamp(raw * unit, -120, 120);
  if (!delta) return null;
  return { yawDelta: -delta * 0.16, velocity: clamp(velocity * 0.25 - delta * 1.8, -280, 280) };
}
