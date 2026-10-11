import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const postsDirectory = fileURLToPath(new URL("../content/blog/", import.meta.url));

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function createPost(slug, title, { directory = postsDirectory, date = localDate() } = {}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? "")) throw new Error("Use a lowercase, hyphen-separated slug without .md, such as my-first-post.");
  const template = readFileSync(join(directory, "_template.md"), "utf8");
  const parts = template.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!parts) throw new Error("The article template needs YAML frontmatter between --- lines.");
  const metadata = {
    ...parse(parts[1]),
    title: title?.trim() || slug.replaceAll("-", " ").replace(/^./, (letter) => letter.toUpperCase()),
    date,
    draft: true,
    sample: false,
  };
  const filename = join(directory, `${slug}.md`);
  try {
    writeFileSync(filename, `---\n${stringify(metadata, { lineWidth: 0 })}---\n\n${parts[2].trim()}\n`, { flag: "wx" });
  } catch (error) {
    if (error.code === "EEXIST") throw new Error(`${filename} already exists. Choose another slug.`, { cause: error });
    throw error;
  }
  return filename;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [slug, ...title] = process.argv.slice(2);
  if (!slug || slug === "--help") {
    console.log('Usage: npm run post:new -- my-first-post "My first post"');
    if (!slug) process.exitCode = 1;
  } else {
    try {
      const filename = createPost(slug, title.join(" "));
      console.log(`Created ${filename} (draft).`);
      console.log(`Preview: http://127.0.0.1:4173/blog/${slug}`);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
