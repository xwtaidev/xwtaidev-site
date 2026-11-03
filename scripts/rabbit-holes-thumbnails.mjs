import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import https from "node:https";
import { isIP } from "node:net";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const MAX_BYTES = 8 * 1024 * 1024;
const PREVIEW_DIR = "public/assets/rabbit-holes/previews";
const MANIFEST = "src/content/rabbit-holes-thumbnails.json";

export function isPublicIPv4(ip) {
  if (isIP(ip) !== 4) return false;
  const [a, b, c] = ip.split(".").map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113));
}

export function isSafePreviewUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password || url.port || isIP(host) || !host.includes(".") || /\.(local|internal|localhost|test|invalid)$/.test(host)) return false;
    if (/(?:^|\/)(?:token|secret|password|credential|session)(?:\/|$)/i.test(url.pathname)) return false;
    return ![...url.searchParams].some(([key, item]) => /token|secret|password|api.?key|signature|credential|authorization|session|jwt/i.test(key) || (/^[a-z0-9_-]{40,}$/i.test(item) && /[a-z]/i.test(item) && /\d/.test(item)));
  } catch { return false; }
}

export async function makeThumbnail(input) {
  const header = input.subarray(0, 512).toString("utf8").trimStart().toLowerCase();
  if (header.startsWith("<") || header.includes("<svg")) throw new Error("unsupported image");
  const image = sharp(input, { limitInputPixels: 36_000_000, animated: false });
  const { format } = await image.metadata();
  if (!["jpeg", "png", "webp", "gif", "avif", "tiff"].includes(format)) throw new Error("unsupported image");
  return image.rotate().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
}

async function resolvePublicIPv4(hostname) {
  const addresses = await Promise.race([
    lookup(hostname, { family: 4, all: true }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("DNS timeout")), 8000).unref()),
  ]);
  if (addresses.length && addresses.every(({ address }) => isPublicIPv4(address))) return addresses[0].address;
  // Some local proxies use 198.18.0.0/15 as a synthetic DNS range. Resolve the
  // real address independently and pin it, rather than trusting the proxy IP.
  if (!addresses.length || !addresses.every(({ address }) => /^198\.(18|19)\./.test(address))) throw new Error("non-public address");
  const query = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`;
  const payload = await new Promise((resolve, reject) => {
    const request = https.get(query, { timeout: 8000, headers: { Accept: "application/dns-json" } }, (response) => {
      if (response.statusCode !== 200) { response.resume(); reject(new Error("DNS unavailable")); return; }
      const chunks = [];
      let size = 0;
      response.on("data", (chunk) => { size += chunk.length; if (size > 65536) response.destroy(new Error("DNS response too large")); else chunks.push(chunk); });
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      response.on("error", reject);
    });
    request.on("timeout", () => request.destroy(new Error("DNS timeout")));
    request.on("error", reject);
  });
  const parsed = JSON.parse(payload);
  const publicAddresses = (parsed.Answer || []).filter((answer) => answer.type === 1).map((answer) => answer.data);
  if (parsed.Status !== 0 || !publicAddresses.length || !publicAddresses.every(isPublicIPv4)) throw new Error("non-public address");
  return publicAddresses[0];
}

export async function download(value, redirects = 0) {
  if (!isSafePreviewUrl(value) || redirects > 3) throw new Error("unsafe URL or redirect");
  const url = new URL(value);
  const address = await resolvePublicIPv4(url.hostname);
  const result = await new Promise((resolve, reject) => {
    const request = https.get(url, {
      family: 4,
      autoSelectFamily: false,
      lookup: (_host, _options, callback) => callback(null, address, 4),
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif;q=0.8", "User-Agent": "RabbitHolesPreview/1.0" },
      timeout: 12000,
      maxHeaderSize: 32768,
    }, (response) => {
      const status = response.statusCode || 0;
      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume();
        try { resolve({ redirect: new URL(response.headers.location, url).href }); }
        catch { reject(new Error("invalid redirect")); }
        return;
      }
      if (status !== 200 || Number(response.headers["content-length"] || 0) > MAX_BYTES) {
        response.resume(); reject(new Error("unavailable or too large")); return;
      }
      const chunks = [];
      let total = 0;
      response.on("data", (chunk) => {
        total += chunk.length;
        if (total > MAX_BYTES) response.destroy(new Error("image too large"));
        else chunks.push(chunk);
      });
      response.on("end", () => resolve({ input: Buffer.concat(chunks) }));
      response.on("error", reject);
    });
    const deadline = setTimeout(() => request.destroy(new Error("request deadline exceeded")), 20000);
    deadline.unref();
    request.on("close", () => clearTimeout(deadline));
    request.on("timeout", () => request.destroy(new Error("request timeout")));
    request.on("error", reject);
  });
  return result.redirect ? download(result.redirect, redirects + 1) : result.input;
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function saveManifest(manifest) {
  const temp = `${MANIFEST}.tmp`;
  await writeFile(temp, JSON.stringify(manifest, null, 2) + "\n");
  await rename(temp, MANIFEST);
}

async function main() {
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.slice(8)) : Infinity;
  if (!(limit > 0)) throw new Error("--limit must be a positive number");
  const seed = JSON.parse(await readFile("src/content/rabbit-holes-seed-previews.json", "utf8"));
  const entries = JSON.parse(await readFile("src/content/rabbit-holes-imported.json", "utf8"));
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  const urls = [...new Set([...Object.values(seed), ...entries.map((entry) => entry.image).filter(Boolean)])];
  await mkdir(PREVIEW_DIR, { recursive: true });
  const pending = [];
  for (const url of urls) {
    const path = manifest[url];
    if (!path || !path.startsWith("/assets/rabbit-holes/previews/") || !(await exists(`public${path}`))) pending.push(url);
  }
  const selected = pending.slice(0, limit);
  let next = 0, finished = 0, saved = 0, sourceBytes = 0, outputBytes = 0;
  let checkpoint = Promise.resolve();
  const workers = Array.from({ length: 10 }, async () => {
    while (next < selected.length) {
      const url = selected[next++];
      try {
        const input = await download(url);
        const output = await makeThumbnail(input);
        const name = `${createHash("sha256").update(output).digest("hex").slice(0, 24)}.webp`;
        await writeFile(`${PREVIEW_DIR}/${name}`, output);
        manifest[url] = `/assets/rabbit-holes/previews/${name}`;
        saved++; sourceBytes += input.length; outputBytes += output.length;
      } catch { /* The original URL remains available as the browser fallback. */ }
      finished++;
      if (finished % 50 === 0 || finished === selected.length) {
        checkpoint = checkpoint.then(() => saveManifest(manifest));
        await checkpoint;
        console.log(JSON.stringify({ processed: finished, total: selected.length, saved, sourceBytes, outputBytes }));
      }
    }
  });
  await Promise.all(workers);
  await checkpoint;
  await saveManifest(manifest);
  console.log(JSON.stringify({ totalSources: urls.length, previouslyCached: urls.length - pending.length, processed: finished, saved, failed: finished - saved, sourceBytes, outputBytes }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
