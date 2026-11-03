import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { isPublicIPv4, makeThumbnail, isSafePreviewUrl } from "../scripts/rabbit-holes-thumbnails.mjs";

test("thumbnail generation scales large raster images without enlarging small ones", async () => {
  const big = await sharp({ create: { width: 1280, height: 720, channels: 3, background: "#556677" } }).png().toBuffer();
  const small = await sharp({ create: { width: 120, height: 80, channels: 3, background: "#556677" } }).png().toBuffer();
  const largeMeta = await sharp(await makeThumbnail(big)).metadata();
  const smallMeta = await sharp(await makeThumbnail(small)).metadata();
  assert.equal(largeMeta.format, "webp");
  assert.equal(largeMeta.width, 640);
  assert.equal(smallMeta.width, 120);
});

test("thumbnail acquisition rejects private addresses and sensitive URLs", () => {
  assert.equal(isPublicIPv4("8.8.8.8"), true);
  for (const value of ["127.0.0.1", "10.0.0.1", "192.168.1.4", "172.16.2.3", "169.254.169.254", "::1"]) assert.equal(isPublicIPv4(value), false);
  assert.equal(isSafePreviewUrl("https://example.com/image.png?v=3"), true);
  assert.equal(isSafePreviewUrl("http://127.0.0.1/private"), false);
  assert.equal(isSafePreviewUrl("https://example.com/image?access_token=secret"), false);
  assert.equal(isSafePreviewUrl("https://user:secret@example.com/image"), false);
});
