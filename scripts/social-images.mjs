import { copyFile, mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getBlogPosts } from "../src/lib/blog.server.ts";
import { getPostSocialCard, siteUrl, socialPages } from "../src/lib/social.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "public/assets/social");
const fontDirectory = join(root, "scripts/fonts");
const temporary = await mkdtemp(join(tmpdir(), "xwtaidev-social-"));
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);

// Isolate font discovery and caching so local and Cloudflare builds use the same
// bundled fonts. Set this before loading Sharp's native Fontconfig dependency.
const configFile = join(temporary, "fonts.conf");
await writeFile(configFile, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>${escape(fontDirectory)}</dir><cachedir>${escape(temporary)}</cachedir><alias><family>sans-serif</family><prefer><family>Instrument Sans</family><family>LXGW WenKai Screen</family></prefer></alias></fontconfig>`);
process.env.FONTCONFIG_FILE = configFile;
const { default: sharp } = await import("sharp");

// Register the CJK fallback explicitly as well: native text renderers may use
// platform font discovery rather than Fontconfig (notably on macOS).
await sharp({ text: { text: "字", font: "LXGW WenKai Screen 16", fontfile: join(fontDirectory, "LXGWWenKaiScreen.ttf"), rgba: true } }).png().toBuffer();

const svg = (content, width = 1200, height = 630) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`);

async function textLayer(text, { left, top, width, height, size = 28, color = "#f3f1df", bold = false }) {
  // Measure the rendered block, including CJK glyphs, and shrink long titles
  // until the entire title fits. Word/character wrapping also handles long URLs.
  for (let fontSize = size; fontSize >= 12; fontSize -= 2) {
    const { data, info } = await sharp({ text: {
      text: `<span foreground="${color}"${bold ? ' weight="bold"' : ""}>${escape(text)}</span>`,
      font: `Instrument Sans ${fontSize}`, fontfile: join(fontDirectory, bold ? "InstrumentSans-Bold.ttf" : "InstrumentSans-Regular.ttf"),
      width, wrap: "word-char", spacing: 8, rgba: true,
    } }).png().toBuffer({ resolveWithObject: true });
    if (info.height <= height) return { input: data, left, top };
  }
  throw new Error(`Social image text is too long to fit: ${text}`);
}

function ornament(card) {
  const article = card.kind === "article";
  const colors = ["#274a3d", "#38604c", "#67866b", "#9cb58d", "#d0d8b2"];
  const columns = article ? 5 : 10;
  const rows = article ? 4 : 7;
  const step = article ? 14 : 27;
  const size = article ? 10 : 20;
  const origin = article ? { x: 962, y: 74 } : { x: 833, y: 244 };
  let cells = "";
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const color = colors[(row * 13 + column * 7 + row * column) % colors.length];
      cells += `<rect x="${origin.x + column * step}" y="${origin.y + row * step}" width="${size}" height="${size}" rx="${article ? 2 : 4}" fill="${color}"/>`;
    }
  }
  return `${cells}<g transform="translate(1084 102)" stroke="#d4d9b6" stroke-width="3"><path d="M-18 0h36M0-18v36M-13-13l26 26M-13 13l26-26"/></g>`;
}

async function render(card) {
  const filename = resolve(root, `public${card.image}`);
  await mkdir(dirname(filename), { recursive: true });
  if (card.sourceImage) {
    const source = resolve(root, card.sourceImage);
    const { width, height, format } = await sharp(source).metadata();
    if (format === "png" && width === 1200 && height === 630) {
      await copyFile(source, filename);
      return;
    }
    // Keep the selected ImageGen artwork as a build input; normalize its export
    // to the sharing dimensions without re-creating its typography or texture.
    await sharp(source)
      .resize(1200, 630, { fit: "cover", position: "centre" })
      .removeAlpha().png({ palette: true, dither: 0, compressionLevel: 9 }).toFile(filename);
    return;
  }
  const article = card.kind === "article";
  const layers = [
    await textLayer("xwtaidev", { left: 80, top: 70, width: 450, height: 44, size: 34, color: "#eef1df", bold: true }),
    await textLayer(socialPages.home.label, { left: 80, top: 120, width: 720, height: 26, size: 17, color: "#a5bbab" }),
    await textLayer(card.headline, { left: 74, top: article ? 235 : 219, width: article ? 1040 : 740, height: article ? 235 : 216, size: article ? 68 : 84, bold: true }),
    await textLayer(card.subtitle, { left: 80, top: article ? 497 : 461, width: article ? 1040 : 740, height: article ? 28 : 60, size: article ? 22 : 24, color: "#b5c8b8" }),
    await textLayer(article ? "THE BLOG / XWTAIDEV" : card.kind === "home" ? "AI TOOLS / OBSIDIAN / DESKTOP APPS" : `XWTAIDEV / ${card.kind.toUpperCase().replaceAll("-", " ")}`, { left: 80, top: 572, width: 770, height: 26, size: 16, color: "#a5bbab" }),
    await textLayer(new URL(siteUrl).hostname, { left: 1012, top: 568, width: 150, height: 30, size: 23, color: "#d4d9b6" }),
  ];
  if (card.kind !== "home") {
    layers.push(await textLayer(card.label, { left: 80, top: 178, width: 1040, height: 35, size: 17, color: "#d4d9b6" }));
  }
  const background = svg(`<rect width="1200" height="630" fill="#17362c"/><path d="M80 540H1120" stroke="#416052"/>${ornament(card)}`);
  await sharp(background).composite(layers).removeAlpha().png({ compressionLevel: 9 }).toFile(filename);
}

try {
  const posts = getBlogPosts({ includeDrafts: process.argv.includes("--drafts") });
  const cards = [...Object.values(socialPages), ...posts.map(getPostSocialCard)];
  // Clear the generated directory so deleted/drafted articles leave no images.
  await rm(output, { recursive: true, force: true });
  for (const card of cards) {
    await render(card);
    const { size } = await stat(resolve(root, `public${card.image}`));
    if (size > 1_000_000) throw new Error(`Social image exceeds 1 MB: ${card.image} (${size} bytes).`);
  }
  console.log(`Generated ${cards.length} social images (1200 × 630) in public/assets/social.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
