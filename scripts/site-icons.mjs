import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const original = await readFile(join(root, "scripts/assets/site-symbol.svg"), "utf8");

for (const theme of ["light", "dark"]) {
  const svg = theme === "dark" ? original.replaceAll("#ffffff", "#171918").replaceAll("#242424", "#e7ece8") : original;
  const source = Buffer.from(svg);
  await writeFile(join(root, "public", theme === "light" ? "favicon.svg" : "favicon-dark.svg"), svg);
  const sizes = [16, 32, 48, 64];
  const images = await Promise.all(sizes.map((size) => sharp(source).resize(size, size).removeAlpha().png({ compressionLevel: 9 }).toBuffer()));
  await writeFile(join(root, "public", theme === "light" ? "favicon-32x32.png" : "favicon-32x32-dark.png"), images[1]);

  // ICO can contain PNG frames; use the same artwork in legacy browsers.
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  for (let index = 0; index < sizes.length; index++) {
    const entry = 6 + index * 16;
    header[entry] = sizes[index]; header[entry + 1] = sizes[index];
    header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(images[index].length, entry + 8); header.writeUInt32LE(offset, entry + 12);
    offset += images[index].length;
  }
  await writeFile(join(root, "public/assets", `favicon-${theme}.ico`), Buffer.concat([header, ...images]));

  if (theme === "light") {
    for (const [name, size] of [["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]]) {
      await sharp(source).resize(size, size).removeAlpha().png({ compressionLevel: 9 }).toFile(join(root, "public", name));
    }
  }
}
console.log("Generated SVG, PNG, ICO, Apple Touch, and manifest icons from one vector symbol.");
