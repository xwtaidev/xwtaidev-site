import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";
import type { Element, ElementContent, Root as HtmlRoot } from "hast";
import type { Paragraph, PhrasingContent, Root as MarkdownRoot } from "mdast";
import type { BlogHeading } from "../content/blog.ts";

function element(tagName: string, properties: Element["properties"], children: Element["children"]): Element {
  return { type: "element", tagName, properties, children };
}

function text(value: string) { return { type: "text" as const, value }; }

function firstLine(children: readonly PhrasingContent[]) {
  let line = "";
  for (const child of children) {
    if (child.type === "break") break;
    const value = toString(child);
    line += value.split("\n")[0];
    if (value.includes("\n")) break;
  }
  return line;
}

function afterFirstLine(children: readonly PhrasingContent[]): PhrasingContent[] {
  const remaining: PhrasingContent[] = [];
  let found = false;
  for (const child of children) {
    if (found) remaining.push(child);
    else if (child.type === "break") found = true;
    else if (child.type === "text" && child.value.includes("\n")) {
      found = true;
      const value = child.value.slice(child.value.indexOf("\n") + 1);
      if (value) remaining.push({ ...child, value });
    }
  }
  return remaining;
}

export function compileMarkdown(markdown: string) {
  const headings: BlogHeading[] = [];
  const slugger = new GithubSlugger();
  let hasIntroduction = false;
  // Reader-owned anchors must stay unique. Generated article IDs retain their existing URLs.
  slugger.slug("article-content");
  slugger.slug("related-title");

  function prepareMarkdown() {
    return (tree: MarkdownRoot) => {
      visit(tree, "heading", (node) => {
        if (node.depth === 1) node.depth = 2;
        const title = toString(node);
        const id = slugger.slug(title) || slugger.slug("section");
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
        if (node.depth === 2 || node.depth === 3) headings.push({ id, title, depth: node.depth });
      });
      visit(tree, "code", (node) => {
        const filename = node.meta?.match(/(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|(\S+))/);
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, dataFilename: filename?.[1] ?? filename?.[2] ?? filename?.[3] ?? "", dataLanguage: node.lang ?? "" } };
      });
      visit(tree, "blockquote", (node) => {
        const first = node.children[0];
        if (first?.type !== "paragraph" || first.children[0]?.type !== "text") return;
        const marker = firstLine(first.children).match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:[ \t]+(.+))?$/i);
        if (!marker) return;
        const title = marker[2]?.trim() || marker[1][0].toUpperCase() + marker[1].slice(1).toLowerCase();
        const remainder = afterFirstLine(first.children);
        const label: Paragraph = { type: "paragraph", data: { hName: "span" }, children: [text(title)] };
        node.children = [label, ...(remainder.length ? [{ ...first, children: remainder }] : []), ...node.children.slice(1)];
        node.data = { ...node.data, hName: "aside", hProperties: { className: ["article-note"] } };
      });
    };
  }

  function prepareCodeBlocks() {
    return (tree: HtmlRoot) => {
      visit(tree, "element", (node, index, parent) => {
        if (node.tagName !== "pre" || index === undefined || !parent) return;
        const code = node.children.find((child): child is Element => child.type === "element" && child.tagName === "code");
        if (!code) return;
        const language = String(code.properties.dataLanguage ?? "");
        const labels: Record<string, string> = { ts: "TypeScript", typescript: "TypeScript", js: "JavaScript", javascript: "JavaScript", md: "Markdown", markdown: "Markdown", sh: "Shell", bash: "Shell", python: "Python", json: "JSON", css: "CSS", html: "HTML", rust: "Rust" };
        const label = labels[language.toLowerCase()] ?? (language || "Code");
        const filename = String(code.properties.dataFilename ?? "");
        delete code.properties.dataFilename;
        delete code.properties.dataLanguage;
        node.properties = { ...node.properties, tabIndex: 0, ariaLabel: `${label} example${filename ? `: ${filename}` : ""}` };
        parent.children[index] = element("figure", { className: ["article-code"] }, [
          element("figcaption", {}, [element("span", {}, [text(filename || "Code snippet")]), element("span", {}, [text(label)])]),
          node,
        ]);
        return SKIP;
      });
    };
  }

  function decorateArticle() {
    return (tree: HtmlRoot) => {
      visit(tree, "element", (node, index, parent) => {
        if (/^h[2-6]$/.test(node.tagName) && node.properties.id) {
          node.children = [element("a", { href: `#${node.properties.id}` }, [
            ...node.children,
            element("span", { className: ["article-heading-anchor"], ariaHidden: "true" }, [text("#")]),
          ])];
        }
        if (node.tagName === "img") node.properties = { ...node.properties, loading: "lazy", decoding: "async" };
        if (node.tagName === "table" && index !== undefined && parent) {
          parent.children[index] = element("div", { className: ["article-table"], tabIndex: 0, role: "region", ariaLabel: "Scrollable table" }, [node]);
          return SKIP;
        }
      });
      const intro: ElementContent[] = [];
      const sections: Element[] = [];
      let current: Element | undefined;
      for (const child of tree.children) {
        if (child.type === "doctype") continue;
        if (child.type === "element" && child.tagName === "h2") {
          current = element("section", { className: ["article-section"], ariaLabelledBy: child.properties.id ? [String(child.properties.id)] : undefined }, [child]);
          sections.push(current);
        } else if (current) current.children.push(child);
        else intro.push(child);
      }
      hasIntroduction = intro.some((node) => node.type !== "text" || node.value.trim());
      tree.children = [...(hasIntroduction ? [element("div", { className: ["article-introduction"] }, intro)] : []), ...sections];
    };
  }

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(prepareMarkdown)
    .use(remarkRehype)
    .use(prepareCodeBlocks)
    .use(rehypeSanitize, {
      ...defaultSchema,
      // Only our generated headings receive IDs; raw HTML is disabled above.
      clobberPrefix: "",
      tagNames: [...new Set([...(defaultSchema.tagNames ?? []), "aside", "figure", "figcaption"])],
      attributes: {
        ...defaultSchema.attributes,
        aside: [["className", "article-note"]],
        figure: [["className", "article-code"]],
        pre: [...(defaultSchema.attributes?.pre ?? []), ["tabIndex", 0], "ariaLabel"],
      },
    })
    .use(decorateArticle)
    .use(rehypeStringify);
  const tree = processor.parse(markdown);
  const plainText = toString(tree);
  const html = processor.stringify(processor.runSync(tree));
  return { html, headings, plainText, hasIntroduction };
}
