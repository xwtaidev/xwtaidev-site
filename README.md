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
