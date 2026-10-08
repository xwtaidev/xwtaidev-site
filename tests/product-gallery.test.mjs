import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getGalleryCardPose,
  getGalleryGeometry,
  getDampedYaw,
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
  const pixels = getWheelSceneInput({ deltaX: 0, deltaY: 48, deltaMode: 0 }, 720);
  const lines = getWheelSceneInput({ deltaX: 0, deltaY: 3, deltaMode: 1 }, 720);
  assert.deepEqual(lines, pixels);
  assert.ok(pixels.yawDelta < 0);
});

test("horizontal trackpads work and zoom gestures remain available", () => {
  const horizontal = getWheelSceneInput({ deltaX: -40, deltaY: 3, deltaMode: 0 }, 720);
  assert.ok(horizontal.yawDelta > 0);
  assert.equal(getWheelSceneInput({ deltaX: 0, deltaY: 40, deltaMode: 0, ctrlKey: true }, 720), null);
  assert.equal(getWheelSceneInput({ deltaX: 0, deltaY: 40, deltaMode: 0, metaKey: true }, 720), null);
  assert.equal(getWheelSceneInput({ deltaX: 0, deltaY: 0, deltaMode: 0 }, 720), null);
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

// Open cards only rotate around Y, so collisions need Y overlap and crossing XZ edges.
function cardPlanesIntersect(a, b, geometry) {
  const halfHeightA = geometry.cardHeight * a.scale / 2;
  const halfHeightB = geometry.cardHeight * b.scale / 2;
  if (Math.min(a.y + halfHeightA, b.y + halfHeightB) <= Math.max(a.y - halfHeightA, b.y - halfHeightB)) return false;

  const edge = (pose) => {
    const radians = pose.yaw * Math.PI / 180;
    const dx = Math.cos(radians) * geometry.cardWidth * pose.scale / 2;
    const dz = -Math.sin(radians) * geometry.cardWidth * pose.scale / 2;
    return [{ x: pose.x - dx, z: pose.z - dz }, { x: pose.x + dx, z: pose.z + dz }];
  };
  const [a0, a1] = edge(a), [b0, b1] = edge(b);
  const r = { x: a1.x - a0.x, z: a1.z - a0.z };
  const s = { x: b1.x - b0.x, z: b1.z - b0.z };
  const offset = { x: b0.x - a0.x, z: b0.z - a0.z };
  const cross = (u, v) => u.x * v.z - u.z * v.x;
  const denominator = cross(r, s);
  if (Math.abs(denominator) < 1e-6) return false;
  const t = cross(offset, s) / denominator, u = cross(offset, r) / denominator;
  return t > 0 && t < 1 && u > 0 && u < 1;
}

test("mobile cards do not intersect each other across the drag rotation range", () => {
  for (const width of [272, 327, 345, 382, 552]) {
    const geometry = getGalleryGeometry(width, 600);
    for (let yaw = -150; yaw <= 150; yaw += 15) {
      for (const pan of [-geometry.step, 0, geometry.step]) {
        const poses = [0, 1, 2].map((slot) => getGalleryCardPose(slot, geometry, 1, { yaw, pan }));
        for (const [a, b] of [[0, 1], [1, 2], [0, 2]]) {
          assert.equal(cardPlanesIntersect(poses[a], poses[b], geometry), false, `Cards ${a} and ${b} intersect at width ${width}, yaw ${yaw}, pan ${pan}`);
        }
      }
    }
  }
});

test("desktop exhibition dimensions retain the approved composition", () => {
  assert.equal(desktop.cardWidth, 320);
  assert.equal(desktop.cardHeight, 215);
  assert.ok(Math.abs(desktop.radius - 397.6) < 1e-9);
  assert.equal(desktop.step, 147.6);
});

test("a wheel impulse starts gradually instead of jumping to its destination", () => {
  const next = getDampedYaw(0, -30, 0, 1 / 60);
  assert.ok(next.yaw < 0 && next.yaw > -3);
  assert.ok(next.velocity < 0);
  assert.equal(next.settled, false);
});

test("wheel damping approaches its destination without overshooting and comes to rest", () => {
  let state = { yaw: 0, velocity: 0 };
  for (let frame = 0; frame < 90; frame++) {
    const next = getDampedYaw(state.yaw, -40, state.velocity, 1 / 60);
    assert.ok(next.yaw <= state.yaw && next.yaw >= -40);
    state = next;
  }
  assert.equal(state.yaw, -40);
  assert.equal(state.velocity, 0);
  assert.equal(state.settled, true);
});

test("wheel damping feels the same at 30, 60 and 120 frames per second", () => {
  const samples = [30, 60, 120].map((fps) => {
    let state = { yaw: 0, velocity: 0 };
    for (let frame = 0; frame < fps / 5; frame++) state = getDampedYaw(state.yaw, 55, state.velocity, 1 / fps);
    return state;
  });
  for (const sample of samples.slice(1)) {
    assert.ok(Math.abs(sample.yaw - samples[0].yaw) < 1e-8);
    assert.ok(Math.abs(sample.velocity - samples[0].velocity) < 1e-8);
  }
});

test("changing the wheel destination preserves the current pose and then reverses smoothly", () => {
  let state = getDampedYaw(0, -40, 0, 0.1);
  const reversed = getDampedYaw(state.yaw, 30, state.velocity, 0);
  assert.equal(reversed.yaw, state.yaw);
  assert.equal(reversed.velocity, state.velocity);
  for (let frame = 0; frame < 90; frame++) state = getDampedYaw(state.yaw, 30, state.velocity, 1 / 60);
  assert.equal(state.yaw, 30);
  assert.equal(state.settled, true);
});

test("wheel damping stops at the exhibition limits without residual velocity", () => {
  assert.deepEqual(getDampedYaw(149, 500, 200, 0.25), { yaw: 150, velocity: 0, settled: true });
  assert.deepEqual(getDampedYaw(-149, -500, -200, 0.25), { yaw: -150, velocity: 0, settled: true });
});
