# xwtaidev-site

A developer and independent maker website built with Next.js, React, TypeScript and Tailwind CSS.

## Development

Use Node.js 22, then run:

```sh
npm ci
npm run dev
```

The local site runs at http://127.0.0.1:4173.

## Build and preview

```sh
npm run build
npm start
```

Next.js exports the production site to `out/`. Images are served as static assets, and interactive details, theme controls and entrance animations run in the browser.

## Writing blog posts

Each article lives in `content/blog/<slug>.md`. The filename becomes its URL: `content/blog/my-first-post.md` is available at `/blog/my-first-post`. Use lowercase words separated by hyphens. There is no article registry or route file to edit.

### Create and preview an article

```sh
npm run post:new -- my-first-post "My first post"
npm run dev
```

This creates `content/blog/my-first-post.md` from `_template.md`, sets the date to your computer's local date, and marks the article as a draft. It will never overwrite an existing file. Edit the new Markdown file and refresh `http://127.0.0.1:4173/blog/my-first-post` to preview it. You can also copy `_template.md` manually and update its fields.

Start with YAML frontmatter, then write ordinary Markdown:

```markdown
---
title: "My first post"
description: "What I learned while making a small tool."
date: "2026-10-11"
category: "Building"
tags: ["Independent work", "Learning"]
cover: "sketch"
draft: true
---

An opening paragraph that gives the reader a reason to keep going.

## The idea

Write the story here, with **bold**, *emphasis*, and [links](/products).

### A smaller detail

Subheadings appear in the reading navigation automatically.

## What I learned

Leave the reader with something concrete to think about or try.
```

The page title comes from `title`; start body sections with `##` and use `###` for subsections. The table of contents, heading anchors, reading time, cards, category filters, and related articles are generated from the files. Write the public article content in English, matching the rest of the site.

### Frontmatter fields

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | Yes | Article heading and card title. |
| `description` | Yes | Card summary and search description. |
| `date` | Yes | Publication date as a quoted `YYYY-MM-DD` string; newest dates appear first. |
| `category` | Yes | A topic such as `Building`, `Engineering`, or `Notes`. New topic names appear in the filters automatically. |
| `tags` | No | A YAML list of strings; defaults to an empty list. |
| `draft` | No | `true` previews locally and excludes the article from production. Defaults to `false`. Use booleans without quotes. |
| `cover` | No | Built-in artwork: `board`, `workspace`, `markdown`, `agent`, `week`, `keyboard`, or `sketch`. |
| `coverImage` | No | Your own card thumbnail, such as `/assets/blog/my-first-post/cover.webp`; takes precedence over `cover`. HTTPS images are also supported. |
| `coverAlt` | No | A description of the thumbnail when it conveys information beyond the title. |
| `format` | No | `paper` for a lined-paper card, or `quote` for an excerpt card. Omit for a regular card. |
| `pullQuote` | For quote cards | The excerpt shown when `format: quote`. |
| `sample` | No | Marks mock content as a sample. Defaults to `false`; migrated mock articles keep `sample: true`. |

Files beginning with `_`, including `_template.md`, are never articles. Published files require valid metadata and a non-empty body. A correctly marked draft can remain unfinished without breaking a production build. The date controls display and sorting; it does not schedule a future deployment.

### Markdown features and images

Standard Markdown and GitHub-flavored Markdown work, including links, blockquotes, lists, task lists, tables, fenced code, and images. Raw HTML and JSX are not rendered.

For code with a filename, use a fenced block such as:

````markdown
```typescript title="task.ts"
const task = { state: "ready" };
```
````

For a note styled like the existing articles:

```markdown
> [!NOTE] A useful constraint
>
> Keep the first version small enough to use today.
```

`TIP`, `IMPORTANT`, `WARNING`, and `CAUTION` also work. Keep a blank quoted line between the marker and the body.

Put images in `public/assets/blog/<slug>/`. Reference them without the `public` prefix:

```markdown
![The first sketch of the board](/assets/blog/my-first-post/sketch.webp)
```

### Publish an article

1. Finish the article, update its date, and set `draft: false`.
2. Validate the production export:

   ```sh
   npm test
   npm run build
   ```

3. Preview the exported site with `npm start` after stopping the development server, since both use port 4173. Drafts are absent from this production preview.
4. Commit the Markdown and any images, then push to `main` if Cloudflare's GitHub integration is connected as described below. The connected production build will rebuild and deploy the static site.

   ```sh
   git add content/blog/my-first-post.md
   # Also stage this article's images, if you added any.
   git commit -m "Publish my first post"
   git push origin main
   ```

   For a manual deployment, run `npm run build` and `npx wrangler deploy` instead. For GitHub deployments, commit the Markdown implementation and lockfile along with the initial migration; subsequent articles only need their content and assets.

Editing an existing `.md` file follows the same build-and-deploy process. To remove an article from the public site, set `draft: true` or delete its file, then rebuild and deploy. Changing a published filename changes its URL, so keep it stable.

## Cloudflare Workers with GitHub

Create a Worker connected to `xwtaidev/xwtaidev-site`. Use these settings:

| Setting | Value |
| --- | --- |
| Worker name | `xwtaidev-site` |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler preview` |
| Root directory | Repository root |

`wrangler.jsonc` serves the exported `out/` directory as static assets, including the exported 404 page. The `.node-version` file selects Node.js 22. No application environment variables are required for the current site.

Keep preview builds enabled to preview other Git branches. Cloudflare Access is optional; leave it disabled for a public website. GitHub pushes to the production branch trigger new deployments.

## Deploy manually with Wrangler

```sh
npx wrangler login
npm run build
npx wrangler deploy
```

Wrangler opens a browser for authorization and prints the deployed URL after deployment. To validate packaging without publishing:

```sh
npx wrangler deploy --dry-run
```

## Cloudflare Pages alternative

The same static export can also be hosted on Pages. Choose the Next.js (Static HTML Export) preset, production branch `main`, build command `npm run build`, and output directory `out`.

Official references: [Workers static assets](https://developers.cloudflare.com/workers/static-assets/), [Workers Builds settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [Next.js static export on Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/).
