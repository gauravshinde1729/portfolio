# Portfolio Site Design

Date: 2026-09-20
Status: Draft for user review

## Goal

A complete, production-ready personal portfolio for Gaurav Shinde with a terminal/shell aesthetic (inspired by px0.ai and nadh.in). Single-page scrollable home with anchor navigation, plus detail pages for Scribbles and Blog posts. Fully responsive (mobile-first), static output.

## Decisions made

| Topic | Decision |
|---|---|
| Approach | Static Astro 7, vanilla CSS, small vanilla TS scripts. No React/Vue islands, no Tailwind. |
| Contact | Terminal-styled form that opens the visitor's mail client via `mailto:` to gauravshinde1816@gmail.com. No backend. A plain mailto link is shown as fallback. |
| Deployment | Undecided. `SITE_URL` is a single placeholder constant (`https://gauravshinde.example`) in `src/config.ts`, used by `astro.config.mjs`, canonical URLs, OG tags and the sitemap. Build output is plain static `./dist`, host-agnostic. |
| Sample content | 3 Scribbles, 3 Blog posts written as clearly marked samples. Experience, education, skills and achievements come only from the resume PDF. |

## Theme

- Background `#0d1117`, primary green `#00ff41`, accent amber `#f0c040`, muted gray `#8b949e`, defined as CSS variables in `src/styles/global.css`.
- JetBrains Mono (Google Fonts) for all text. Monospace everywhere.
- Terminal UI: `$` prompts, blinking block cursor, typing animation, window chrome around content blocks.

## Structure

```
src/
  config.ts              SITE_URL placeholder, name, social links, email
  data/resume.ts         typed data extracted from resume.pdf
  content.config.ts      collections: scribbles, research, blog (zod schemas)
  content/{scribbles,research,blog}/*.mdx
  layouts/Base.astro     head (SEO, OG, fonts, favicon), Nav, Footer, global styles
  components/            Nav, Footer, Terminal, Section, Boot, Typed, sections/*
  pages/
    index.astro          composes all 8 sections
    scribbles/index.astro, scribbles/[slug].astro
    blog/index.astro, blog/[slug].astro
    (no research pages: papers render on the home page only and link straight to the PDF)
  styles/global.css      theme tokens, reset, animations
  scripts/               boot.ts, typed.ts, nav.ts, contact.ts, reveal.ts
public/
  images/photo.jpg
  docs/resume.pdf, docs/admission-letter.pdf, docs/papers/crowdfunding-paper.pdf
  favicon.svg (+ .ico)
```

Data flow: section components read `src/data/resume.ts` (Intro, Experience, Education, Achievements) or `getCollection()` (Scribbles, Research, Blog) and render static HTML at build time. Nothing is fetched at runtime.

Integrations: `@astrojs/mdx`, `@astrojs/sitemap`, `remark-math`, `rehype-katex` (KaTeX CSS loaded on blog pages only), Astro's built-in Shiki with a dark theme close to the palette. Exact package versions must be verified against Astro 7 during planning.

## Content collections

- **scribbles**: title, description, tags[], status (`POC` | `WIP` | `Done`), hasSystemDesign (boolean), date, githubUrl.
- **research**: title, abstract, date, paperUrl, tags[]. Real entry: "Decentralized Transaction System for Detection and Prevention of Fraud in Crowdfunding Platforms" -> `/docs/papers/crowdfunding-paper.pdf`.
- **blog**: title, description, date, tags[], draft (boolean; drafts excluded from production builds). MDX with KaTeX math and syntax-highlighted code. The LinkedIn post "Inside LLMs: Building Transformers from Ground Up" is listed as an external entry opening in a new tab: https://www.linkedin.com/pulse/inside-llms-building-transformers-from-ground-up-gaurav-shinde-4rfvf/

## Sections (home page, in order)

1. **Intro**: boot sequence, then `$ whoami`, typed name, about text from resume, circular photo with green glow (right on desktop, stacked on mobile), `$ download resume` button -> `/docs/resume.pdf`.
2. **Experience** (`$ cat experience.log`): terminal timeline (`├──`/`└──`) from `resume.ts`.
3. **Education** (`$ cat education.log`): same style, plus `$ open admission-letter.pdf` -> `/docs/admission-letter.pdf` (new tab).
4. **Scribbles**: `ls -l`-style listing: status badge, title link, tags, date, GitHub link, `[sys-design]` badge when `hasSystemDesign`. Detail pages at `/scribbles/<slug>`.
5. **Research**: card with title, abstract, tags, `[view]` / `[download]` opening the PDF in a new tab.
6. **Achievements** (`$ cat achievements.log`): syslog-style lines from the resume.
7. **Blog**: listing with tags; detail pages at `/blog/<slug>` with math and code.
8. **Contact** (`$ mail -s 'Hello' gauravshinde1816@gmail.com`): terminal form (subject, message) -> `mailto:`; social links repeated.

Persistent: nav as terminal tabs (hamburger below 768px) with `$ download resume` always visible; footer with GitHub, LinkedIn, LeetCode and Email icons; smooth scroll; section reveal animations. On detail pages nav links go to `/#section`.

Links: GitHub https://github.com/gauravshinde1729, LinkedIn https://www.linkedin.com/in/gauravshinde18/, LeetCode https://leetcode.com/u/gauravshinde1816/, Email gauravshinde1816@gmail.com.

## Behavior

- **Boot/typing**: boot log prints line by line (~1.5s), then `$ whoami` and the name type out with a blinking cursor. Plays once per session (`sessionStorage`), skippable by click or keypress. Skipped entirely under `prefers-reduced-motion` or without JS. All content is present in the HTML; scripts only enhance.
- **Reveal**: one `IntersectionObserver` fades/slides sections in; disabled under reduced motion.
- **Smooth scroll**: CSS `scroll-behavior` with `scroll-margin-top` for the sticky nav; disabled under reduced motion.

## Responsive

Mobile-first, one column by default. At >=768px the intro becomes two columns. Terminal blocks scroll horizontally inside their own box (no page-wide overflow). Touch targets >=44px.

## SEO and accessibility

Per-page title, description, canonical URL; Open Graph and Twitter tags with a generated OG image; `sitemap-index.xml` and `robots.txt`; SVG `>_` favicon. Semantic landmarks, visible focus rings, AA contrast for the palette.

## Assets (setup step)

Create `public/images`, `public/docs`, `public/docs/papers`, then download the four Google Drive files supplied by the user (photo, resume, admission letter, paper). Verify each is a real JPEG/PDF and not a Drive HTML confirmation page (check file type and size; retry with the confirm token if needed). Read `resume.pdf` and extract all experience, education, skills and achievements into `src/data/resume.ts`, and show the extracted data to the user.

## Verification

- All four downloads validated as real files.
- `astro build` and `astro check` pass with zero errors.
- Dev server run in background mode (`astro dev --background`, per CLAUDE.md); pages and console checked at desktop and mobile widths.
- Links checked: document links open in new tabs, blog and social links correct, nav anchors scroll correctly.
- Reduced-motion and no-JS rendering show full content.

## Out of scope

Backend or hosted form service, CMS, analytics, comments, dark/light toggle (dark only), i18n, deployment configuration (deferred; only the `SITE_URL` placeholder is set).

## Update CLAUDE.md

After implementation, update `CLAUDE.md` (and keep `AGENTS.md` in sync) to describe the real architecture: content collections, `resume.ts`, `config.ts`, scripts, and the `SITE_URL` placeholder to replace at deployment.
