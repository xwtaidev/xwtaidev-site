import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { parseDocument } from "yaml";
import { blogCoverKinds, type BlogPost, type BlogPostPreview } from "../content/blog.ts";
import { profile } from "../content/site.ts";
import { compileMarkdown } from "./markdown.ts";

type BlogOptions = { directory?: string; includeDrafts?: boolean };
const defaultDirectory = join(process.cwd(), "content", "blog");
const parsedFiles = new Map<string, { source: string; post: BlogPost | undefined }>();
const allowedFields = new Set(["title", "description", "author", "date", "category", "tags", "cover", "coverImage", "coverAlt", "format", "pullQuote", "draft", "sample"]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parsePost(source: string, filename: string, includeDrafts: boolean): BlogPost | undefined {
  try {
    const normalized = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    const parts = normalized.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/);
    if (!parts) throw new Error("Start the file with YAML frontmatter between --- lines.");
    const document = parseDocument(parts[1], { uniqueKeys: true });
    if (document.errors.length) throw new Error(document.errors[0].message);
    const value: unknown = document.toJS({ maxAliasCount: 50 });
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Frontmatter must be a mapping of fields.");
    const metadata = value as Record<string, unknown>;

    function stringField(key: string, required = false) {
      const value = metadata[key];
      if (value === undefined && !required) return undefined;
      if (typeof value !== "string" || !value.trim()) throw new Error(`"${key}" must be a non-empty string.`);
      return value.trim();
    }
    function booleanField(key: string) {
      const value = metadata[key];
      if (value === undefined) return false;
      if (typeof value !== "boolean") throw new Error(`"${key}" must be true or false, without quotes.`);
      return value;
    }
    function optionalTextField(key: string) {
      const value = metadata[key];
      if (value != null && typeof value !== "string") throw new Error(`"${key}" must be a string or left empty.`);
      return value?.trim() ?? "";
    }

    const draft = booleanField("draft");
    if (draft && !includeDrafts) return undefined;
    for (const key of Object.keys(metadata)) if (!allowedFields.has(key)) throw new Error(`Unknown frontmatter field "${key}".`);

    const slug = basename(filename, ".md");
    if (!slugPattern.test(slug)) throw new Error("Use a lowercase, hyphen-separated filename such as my-first-post.md.");
    const title = stringField("title", true)!;
    const description = optionalTextField("description");
    const author = optionalTextField("author") || profile.name;
    const date = stringField("date", true)!;
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) throw new Error('"date" must be a real calendar date in YYYY-MM-DD format.');
    const category = stringField("category", true)!;
    if (category.toLowerCase() === "all") throw new Error('"category" must name a topic; "All" is reserved for the filter.');
    const tags = metadata.tags ?? [];
    if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string" || !tag.trim())) throw new Error('"tags" must be a list of non-empty strings.');
    const cover = stringField("cover");
    if (cover && !blogCoverKinds.includes(cover as (typeof blogCoverKinds)[number])) throw new Error(`"cover" must be one of: ${blogCoverKinds.join(", ")}.`);
    const coverImage = stringField("coverImage");
    if (coverImage && !/^(?:\/(?!\/)|https:\/\/)/.test(coverImage)) throw new Error('"coverImage" must be a /public-asset path or an https:// URL.');
    const format = stringField("format");
    if (format && format !== "quote" && format !== "paper") throw new Error('"format" must be "quote" or "paper".');
    const pullQuote = stringField("pullQuote");
    if (format === "quote" && !pullQuote) throw new Error('Quote cards require a "pullQuote".');
    const body = parts[2].trim();
    if (!body && !draft) throw new Error("The article body cannot be empty.");
    const compiled = compileMarkdown(body);
    return {
      slug, title, description, author, date, category, tags: tags.map((tag) => tag.trim()),
      cover: cover as BlogPost["cover"], coverImage, coverAlt: stringField("coverAlt"), format: format as BlogPost["format"], pullQuote,
      draft, sample: booleanField("sample"),
      html: compiled.html, headings: compiled.headings, hasIntroduction: compiled.hasIntroduction,
      readingMinutes: Math.max(1, Math.ceil(compiled.plainText.split(/\s+/).filter(Boolean).length / 200)),
    };
  } catch (error) {
    throw new Error(`${filename}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}

export function getBlogPosts({ directory = defaultDirectory, includeDrafts = process.env.NODE_ENV === "development" }: BlogOptions = {}): readonly BlogPost[] {
  const posts = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith("_"))
    .map((entry) => {
      const filename = resolve(directory, entry.name);
      const cacheKey = `${filename}:${includeDrafts ? "preview" : "published"}`;
      const source = readFileSync(filename, "utf8");
      const cached = parsedFiles.get(cacheKey);
      if (cached?.source === source) return cached.post;
      const post = parsePost(source, filename, includeDrafts);
      parsedFiles.set(cacheKey, { source, post });
      return post;
    });
  return posts.filter((post): post is BlogPost => post !== undefined).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getBlogPostPreviews(options?: BlogOptions): readonly BlogPostPreview[] {
  return getBlogPosts(options).map((post) => ({
    slug: post.slug, title: post.title, description: post.description, author: post.author, date: post.date, category: post.category, tags: post.tags,
    cover: post.cover, coverImage: post.coverImage, coverAlt: post.coverAlt, format: post.format, pullQuote: post.pullQuote,
    draft: post.draft, sample: post.sample, readingMinutes: post.readingMinutes,
  }));
}

export function getPostBySlug(slug: string, options?: BlogOptions) {
  if (!slugPattern.test(slug)) return undefined;
  return getBlogPosts(options).find((post) => post.slug === slug);
}

export function getAdjacentPosts(slug: string, options?: BlogOptions): { previous?: BlogPostPreview; next?: BlogPostPreview } {
  const posts = getBlogPostPreviews(options);
  const index = posts.findIndex((post) => post.slug === slug);
  if (index < 0) return { previous: undefined, next: undefined };
  return { previous: posts[index + 1], next: posts[index - 1] };
}
