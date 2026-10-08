import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getGalleryCardPose,
  getGalleryGeometry,
  getTransitionProgress,
  getWheelSceneInput,
} from "../src/lib/product-gallery.ts";

const desktop = getGalleryGeometry(1120, 720);
const scene = { yaw: 0, pan: 0 };

test("opening preserves its intermediate frames for the full transition", () => {
  const transition = { from: 0, to: 1, start: 100, duration: 1800 };
  assert.equal(getTransitionProgress(transition, 100), 0);
  assert.equal(getTransitionProgress(transition, 1000), 0.5);
  assert.equal(getTransitionProgress(transition, 1900), 1);
  assert.equal(getTransitionProgress(transition, 4000), 1);
});

test("reversing a partly opened folder starts from the current pose", () => {
  const opening = { from: 0, to: 1, start: 0, duration: 1800 };
  const current = getTransitionProgress(opening, 720);
  const closing = { from: current, to: 0, start: 720, duration: 500 };
  assert.equal(getTransitionProgress(closing, 720), current);
  assert.equal(getTransitionProgress(closing, 970), current / 2);
  assert.equal(getTransitionProgress(closing, 1220), 0);
});

test("cards rise from the folder before spreading into the exhibition", () => {
  const closed = getGalleryCardPose(0, desktop, 0, scene);
  const emerging = getGalleryCardPose(0, desktop, 0.35, scene);
  const spreading = getGalleryCardPose(0, desktop, 0.72, scene);
  const opened = getGalleryCardPose(0, desktop, 1, scene);
  assert.equal(closed.opacity, 0);
  assert.ok(emerging.opacity > 0.9);
  assert.ok(emerging.y < closed.y - 80);
  assert.ok(Math.abs(emerging.x - closed.x) < 20);
  assert.ok(spreading.x < emerging.x && spreading.x > opened.x);
  assert.ok(Math.abs(spreading.yaw) > 0 && Math.abs(spreading.yaw) < 45);
});

test("the exhibition has vertical offsets and real perspective depth", () => {
  const upper = getGalleryCardPose(0, desktop, 1, scene);
  const front = getGalleryCardPose(1, desktop, 1, scene);
  const lower = getGalleryCardPose(2, desktop, 1, scene);
  assert.ok(upper.x < front.x && front.x < lower.x);
  assert.ok(upper.y < front.y && front.y < lower.y);
  assert.ok(front.z > upper.z && front.z > lower.z);
  assert.equal(front.scale, 1);
  assert.equal(upper.scale, 1);
  assert.equal(lower.scale, 1);
  assert.equal(front.yaw, 0);
});

test("rotating the scene moves every card while retaining its helix height", () => {
  for (const slot of [0, 1, 2]) {
    const before = getGalleryCardPose(slot, desktop, 1, scene);
    const after = getGalleryCardPose(slot, desktop, 1, { yaw: -30, pan: 12 });
    assert.notEqual(after.x, before.x);
    assert.notEqual(after.z, before.z);
    assert.equal(after.y - before.y, 12);
    assert.equal(after.yaw - before.yaw, -30);
  }
});

test("wheel pixels and lines produce the same rotation", () => {
  const pixels = getWheelSceneInput({ deltaX: 0, deltaY: 48, deltaMode: 0 }, 720, 0);
  const lines = getWheelSceneInput({ deltaX: 0, deltaY: 3, deltaMode: 1 }, 720, 0);
  assert.deepEqual(lines, pixels);
  assert.ok(pixels.yawDelta < 0);
  assert.ok(pixels.velocity < 0);
});

test("horizontal trackpads work and zoom gestures remain available", () => {
  const horizontal = getWheelSceneInput({ deltaX: -40, deltaY: 3, deltaMode: 0 }, 720, 0);
  assert.ok(horizontal.yawDelta > 0);
  assert.equal(getWheelSceneInput({ deltaX: 0, deltaY: 40, deltaMode: 0, ctrlKey: true }, 720, 0), null);
  assert.equal(getWheelSceneInput({ deltaX: 0, deltaY: 40, deltaMode: 0, metaKey: true }, 720, 0), null);
  assert.equal(getWheelSceneInput({ deltaX: 0, deltaY: 0, deltaMode: 0 }, 720, 0), null);
});

test("narrow screens and reduced motion do not create invalid geometry", () => {
  const mobile = getGalleryGeometry(272, 600);
  assert.ok(mobile.cardWidth < mobile.width);
  assert.ok(mobile.radius < mobile.width / 2);
  for (const slot of [0, 1, 2]) {
    const pose = getGalleryCardPose(slot, mobile, 1, scene);
    assert.ok(Object.values(pose).every(Number.isFinite));
  }
  assert.equal(getTransitionProgress({ from: 0, to: 1, start: 0, duration: 0 }, 0), 1);
});
