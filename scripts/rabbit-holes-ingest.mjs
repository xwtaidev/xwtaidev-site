import { readFile, readdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const blockedHosts = ["news.ycombinator.com", "github.com", "gitlab.com", "youtube.com", "youtu.be", "twitter.com", "x.com", "reddit.com", "medium.com", "substack.com", "apps.apple.com", "itunes.apple.com", "play.google.com", "archive.org"];
const excludeTitle = /\b(library|framework|chrome extension|browser extension|sdk|api|self.host|open.source|command.line|ai agent|llm|chatbot|gpu|database|github|hiring|benchmark|web ?server|ios app|iphone app)\b/i;

export function normalizeCandidateUrl(input) {
  try {
    const url = new URL(input.replaceAll("&amp;", "&"));
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.port || !host.includes(".") || /^[\d.]+$/.test(host) || host.includes(":") || /\.(local|internal|localhost|test|example|invalid)$/.test(host)) return null;
    if (blockedHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) return null;
    if (/\.(pdf|png|jpe?g|gif|webp|zip|tar|gz|mp4|mp3)$/i.test(url.pathname)) return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) if (/^(utm_.+|fbclid|gclid|ref|source)$/i.test(key)) url.searchParams.delete(key);
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
    return url.href;
  } catch { return null; }
}

export function classifyCandidate(text) {
  const value = text.toLowerCase();
  const tags = [];
  if (/\b(puzzle|game|playable|gameplay)\b/.test(value)) tags.push("Games");
  if (/\b(interactive|playground|simulator|simulation|simulating|browser game|web game|toy|draw|game)\b/.test(value)) tags.push("Interactive");
  if (/\b(visuali[sz](?:ation|e|ing)|map|atlas|globe|fractal|particle|planet)\b/.test(value)) tags.push("Visualizations");
  if (/\b(archive|museum|collection|history)\b/.test(value)) tags.push("Archives");
  if (/\b(music|audio|radio|sound)\b/.test(value)) tags.push("Audio");
  if (/\b(book|essay|story|stories|reading)\b/.test(value)) tags.push("Reading");
  return tags.slice(0, 2);
}

const unsafeOrUnavailable = /\b(casino|gambling|gamble|slot gacor|togel|judi|poker online|sportsbook|porn|xxx|adult entertainment|sex toys|escort service|domain (?:is |for )?sale|buy this domain|buy\s+[a-z0-9-]+\.[a-z]{2,}|premium domain|available business name for sale|account suspended|website (?:is )?for sale|domain parking|no longer (?:available|playable|operating|active)|has been (?:shut down|discontinued)|site (?:is )?under construction|coming soon|access denied|page not found|404 not found)\b/i;
const genericWords = new Set(["show", "made", "built", "build", "make", "create", "created", "first", "using", "with", "from", "this", "that", "your", "website", "project", "browser", "online", "site", "web", "tool", "have", "been", "what", "like", "just", "free"]);

function hasSensitiveParameters(value) {
  try {
    const url = new URL(value);
    return [...url.searchParams].some(([key, item]) => /token|secret|password|api.?key|signature|credential|authorization|session|jwt/i.test(key) || (/^[a-z0-9_-]{40,}$/i.test(item) && /[a-z]/i.test(item) && /\d/.test(item)));
  } catch { return true; }
}

export function isEligibleMetadata(candidate, metadata) {
  if (metadata.status !== "ok" || !metadata.title || !metadata.description || metadata.description.length < 20) return false;
  if (metadata.requestedUrl !== candidate.url) return false;
  if (hasSensitiveParameters(candidate.url) || hasSensitiveParameters(metadata.url)) return false;
  if (/^(home|welcome|introduction|index|loading|untitled)$/i.test(metadata.title.trim())) return false;
  if (!normalizeCandidateUrl(metadata.url)) return false;
  const host = (value) => new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  try { if (host(candidate.url) !== host(metadata.url)) return false; } catch { return false; }
  const combined = `${candidate.title} ${metadata.title} ${metadata.description}`;
  if (unsafeOrUnavailable.test(combined)) return false;
  const keywords = classifyCandidate(combined);
  if (!keywords.length) return false;
  if (candidate.title) {
    const meaningful = candidate.title.toLowerCase().match(/[a-z0-9]{4,}/g)?.filter((word) => !genericWords.has(word)) || [];
    const current = `${metadata.title} ${metadata.description}`.toLowerCase();
    if (meaningful.length && !meaningful.some((word) => current.includes(word))) return false;
  }
  return true;
}

function tidyText(value) {
  return value.replace(/&(?:mdash|ndash);/gi, "–").replace(/&hellip;/gi, "…").replace(/&nbsp;/gi, " ").replace(/&(?:lsquo|rsquo);/gi, "’").replace(/&(?:ldquo|rdquo);/gi, "\"").replace(/\s+/g, " ").trim();
}

export async function buildPublishedCandidates(rawDirectory) {
  const shortlist = JSON.parse(await readFile(`${rawDirectory}/shortlist.json`, "utf8"));
  const longtail = JSON.parse(await readFile(`${rawDirectory}/longtail.json`, "utf8"));
  const allCandidates = [...shortlist.candidates, ...longtail.candidates];
  const chunks = (await readdir(rawDirectory)).filter((name) => /^enriched-(?:lt-)?\d+\.json$/.test(name)).sort();
  const metadata = (await Promise.all(chunks.map(async (name) => JSON.parse(await readFile(`${rawDirectory}/${name}`, "utf8"))))).flat();
  const statuses = {};
  const used = new Set();
  const published = [];
  for (const record of metadata) {
    statuses[record.status] = (statuses[record.status] || 0) + 1;
    const candidate = allCandidates[record.index];
    if (!candidate || !isEligibleMetadata(candidate, record)) continue;
    const url = normalizeCandidateUrl(record.url);
    if (!url || used.has(url)) continue;
    used.add(url);
    const source = candidate.sources[0];
    const title = tidyText(record.title).slice(0, 150);
    const description = tidyText(record.description).slice(0, 300);
    const categories = candidate.categories.length ? candidate.categories : classifyCandidate(`${record.title} ${record.description}`);
    published.push({ id: `hn-${source.id}-${record.index}`, title, description, categories, url, discussion: `https://news.ycombinator.com/item?id=${source.id}`, sourceKind: source.kind, sourceTime: source.time, ...(record.image && !hasSensitiveParameters(record.image) ? { image: record.image } : {}) });
  }
  return { cutoff: shortlist.cutoff, candidates: allCandidates.length, checked: metadata.length - (statuses.sensitive_url_skipped || 0), statuses, published };
}

export async function buildLongtailCandidates(rawDirectory, existingCandidates) {
  const files = (await readdir(rawDirectory)).filter((name) => /^show-hn-low-score-\d{4}\.json$/.test(name)).sort();
  const data = (await Promise.all(files.map(async (name) => JSON.parse(await readFile(`${rawDirectory}/${name}`, "utf8"))))).flatMap((file) => file.rows);
  const used = new Set(existingCandidates.map((item) => item.url.replace(/^https?:\/\/(?:www\.)?/, "").replace(/\/$/, "")));
  const candidates = [];
  for (const row of data) {
    const categories = classifyCandidate(row.title);
    if (!categories.length || excludeTitle.test(row.title)) continue;
    const url = normalizeCandidateUrl(row.url);
    if (!url) continue;
    const key = url.replace(/^https?:\/\/(?:www\.)?/, "").replace(/\/$/, "");
    if (used.has(key)) continue;
    used.add(key);
    candidates.push({ title: row.title.replace(/^show hn:\s*/i, ""), categories, score: row.score, sources: [{ kind: "show-hn", id: row.id, time: row.time }], url });
  }
  return { inputFiles: files.length, sourceRows: data.length, candidates };
}

export function extractUrls(html) {
  const decoded = html.replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (entity, hex, decimal) => {
    const code = Number.parseInt(hex || decimal, hex ? 16 : 10);
    return code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  }).replaceAll("&amp;", "&");
  return [...new Set([...decoded.matchAll(/https?:\/\/[^\s"'<>]+/gi)].map((m) => m[0].replace(/[),.;]+$/, "")))];
}

export async function buildCandidates(rawDirectory) {
  const show = JSON.parse(await readFile(`${rawDirectory}/show-hn.json`, "utf8"));
  const comments = JSON.parse(await readFile(`${rawDirectory}/recommendation-comments.json`, "utf8"));
  const byUrl = new Map();
  const add = (url, candidate) => {
    if (!url) return;
    const key = url.replace(/^https?:\/\/(?:www\.)?/, "").replace(/\/$/, "");
    const existing = byUrl.get(key);
    if (existing) { for (const source of candidate.sources) if (!existing.sources.some((item) => item.kind === source.kind && item.id === source.id)) existing.sources.push(source); return; }
    byUrl.set(key, { ...candidate, url });
  };
  for (const row of show.rows) {
    const categories = classifyCandidate(row.title);
    if (!categories.length || excludeTitle.test(row.title)) continue;
    add(normalizeCandidateUrl(row.url), { title: row.title.replace(/^show hn:\s*/i, ""), categories, score: row.score, sources: [{ kind: "show-hn", id: row.id, time: row.time }] });
  }
  for (const row of comments.rows) {
    for (const url of extractUrls(row.text)) {
      add(normalizeCandidateUrl(url), { title: "", categories: [], score: 0, sources: [{ kind: "discussion-mention", id: row.id, time: row.time }] });
    }
  }
  return { source: show.source, cutoff: show.cutoff, counts: { scannedShowStories: show.rows.length, recommendationComments: comments.rows.length }, candidates: [...byUrl.values()] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rawDirectory = process.argv[2] || "data/rabbit-holes/raw";
  const result = await buildCandidates(rawDirectory);
  await writeFile(`${rawDirectory}/shortlist.json`, JSON.stringify(result, null, 2) + "\n");
  const longtail = await buildLongtailCandidates(rawDirectory, result.candidates);
  await writeFile(`${rawDirectory}/longtail.json`, JSON.stringify(longtail, null, 2) + "\n");
  const published = await buildPublishedCandidates(rawDirectory);
  await writeFile("src/content/rabbit-holes-imported.json", JSON.stringify(published.published, null, 2) + "\n");
  await writeFile("data/rabbit-holes/acquisition.json", JSON.stringify({ sourceUrl: result.source, dataset: "open-index/hacker-news", datasetRevision: "c54ced5973b95d80cd934b8921f44ec8d87c3cd1", cutoff: published.cutoff, generatedAt: new Date().toISOString(), scope: "Current ClickHouse source queried through the dataset cutoff, not the exact Hugging Face snapshot; topic-matched Show HN stories and links mentioned in selected Ask HN discussions, not the full archive", highScoreShowStories: result.counts.scannedShowStories, lowScoreShowStories: longtail.sourceRows, lowScoreInputFiles: longtail.inputFiles, longtailCandidates: longtail.candidates.length, recommendationComments: result.counts.recommendationComments, candidates: published.candidates, checked: published.checked, skippedSensitive: published.statuses.sensitive_url_skipped || 0, statuses: published.statuses, imported: published.published.length }, null, 2) + "\n");
  console.log(JSON.stringify({ ...result.counts, candidates: published.candidates, checked: published.checked, imported: published.published.length, lowScoreStories: longtail.sourceRows, longtailCandidates: longtail.candidates.length }));
}
