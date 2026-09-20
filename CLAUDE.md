# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Portfolio site built on Astro (`astro` ^7, requires Node >=22.12.0). It is currently the unmodified "minimal" starter template: a single page (`src/pages/index.astro`), no layouts, components, content collections, integrations, or styling setup yet. `astro.config.mjs` is an empty `defineConfig({})`.

## Commands

```
npm install          # install dependencies
npm run build        # production build to ./dist/
npm run preview      # serve the built site locally
npx astro check      # type-check .astro/.ts files (may prompt to install @astrojs/check on first run)
```

There is no test runner or linter configured.

### Dev server

Start the dev server in background mode (per project convention):

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`. The default URL is `localhost:4321`.

## Architecture

- File-based routing: every `.astro`/`.md` file under `src/pages/` becomes a route named after its path (`src/pages/index.astro` → `/`).
- `public/` holds static assets served as-is from the site root (e.g. `/favicon.svg`).
- `tsconfig.json` extends `astro/tsconfigs/strict`; it includes `.astro/types.d.ts`, which Astro generates on `dev`/`build`/`sync`.
- `AGENTS.md` duplicates the dev-server and Documentation sections of this file; keep them in sync if either changes.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
