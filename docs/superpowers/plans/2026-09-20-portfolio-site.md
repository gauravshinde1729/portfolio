# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Gaurav Shinde's terminal-themed, single-page portfolio (with Scribbles and Blog detail pages) as a production-ready static Astro site.

**Architecture:** Static Astro 7 site. Section components read typed resume data (`src/data/resume.ts`) or content collections (`scribbles`, `research`, `blog`) at build time. Terminal effects (boot, typing, reveal, nav, mailto form) are small vanilla TS modules that only enhance HTML that is already complete without JS. Pure logic (schemas, formatting, mailto) lives in `src/lib/` and is unit tested with Vitest; everything else is verified with `astro build`, `astro check`, and browser checks.

**Tech Stack:** Astro 7.3.3, `@astrojs/mdx` 8, `@astrojs/sitemap`, `@astrojs/markdown-remark` (`unified()` processor), `remark-math`, `rehype-katex`, `katex`, Shiki (built in), TypeScript 6, Vitest, sharp (dev only, brand asset generation). Node >= 22.12 (Node 24 installed).

**Spec:** `docs/superpowers/specs/2026-09-20-portfolio-design.md`

## Global Constraints

- Astro `^7.3.3`, Node `>=22.12.0`. Vanilla CSS and vanilla TS only: **no React/Vue islands, no Tailwind.**
- Palette tokens: background `#0d1117`, green `#00ff41`, amber `#f0c040`, gray `#8b949e`. Body text uses derived `--text: #e6edf3`.
- Font: JetBrains Mono from Google Fonts, monospace everywhere.
- `SITE_URL` placeholder is `https://gauravshinde.example`, defined only in `src/config.ts`. Nothing else may hardcode the site URL.
- Contact is a terminal-styled form that opens `mailto:gauravshinde1816@gmail.com`. No backend, no form service.
- Links: GitHub `https://github.com/gauravshinde1729`, LinkedIn `https://www.linkedin.com/in/gauravshinde18/`, LeetCode `https://leetcode.com/u/gauravshinde1816/`, Email `gauravshinde1816@gmail.com`.
- Document links open in a new tab (`target="_blank" rel="noopener"`): `/docs/resume.pdf`, `/docs/admission-letter.pdf`, `/docs/papers/crowdfunding-paper.pdf`, and the LinkedIn blog post `https://www.linkedin.com/pulse/inside-llms-building-transformers-from-ground-up-gaurav-shinde-4rfvf/`.
- Experience, education, skills, achievements, and about text come **only** from the resume PDF. Sample Scribbles and Blog posts must be visibly marked as samples in their body.
- All content must be present in the served HTML; scripts only enhance. Respect `prefers-reduced-motion`. Mobile-first; no page-level horizontal scroll at 375px.
- Drafts (`draft: true`) are excluded from production builds.
- `src/data/resume.ts` and anything imported by `scripts/*.mjs` must use only erasable TypeScript syntax (interfaces/types; no enums, no parameter properties) because Node strips types natively.
- Tests: Vitest, colocated as `src/**/*.test.ts`. Commit after every task. Commit messages end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Shell is Git Bash (POSIX syntax). Dev server, when needed: `astro dev --background` (per `CLAUDE.md`).

## File Structure

```
astro.config.mjs               site, integrations, markdown processor (KaTeX + Shiki)
vitest.config.ts
scripts/verify-assets.mjs      checks the 4 downloaded files are real JPEG/PDF
scripts/generate-brand.mjs     writes public/og.png and public/favicon.ico
src/config.ts                  SITE_URL, SITE, LINKS, NAV
src/content.config.ts          three collections (glob loaders)
src/data/resume.ts             typed resume data (from resume.pdf)
src/lib/schemas.ts             zod schemas for collections (unit tested)
src/lib/format.ts              formatDate, byDateDesc (unit tested)
src/lib/mailto.ts              buildMailto (unit tested)
src/lib/icons.ts               inline SVG bodies for social icons
src/lib/boot-lines.ts          boot log text
src/lib/collections.ts         getScribbles / getResearch / getBlogPosts
src/styles/global.css          tokens, base, utilities, prose, timeline
src/layouts/Base.astro         head/SEO/OG, skip link, Nav, Footer, reveal script
src/layouts/Article.astro      detail-page wrapper (scribbles + blog)
src/components/                Icon, SocialLinks, Nav, Footer, Terminal, Section, Boot, ScribbleList, PostList
src/components/sections/       Intro, Experience, Education, Scribbles, Research, Achievements, Blog, Contact
src/scripts/                   nav.ts, reveal.ts, boot.ts, typed.ts, contact.ts
src/pages/index.astro
src/pages/robots.txt.ts
src/pages/scribbles/index.astro, [slug].astro
src/pages/blog/index.astro, [slug].astro
src/content/{scribbles,research,blog}/*.md(x)
public/images/photo.jpg, public/docs/..., public/favicon.svg, favicon.ico, og.png
```

---

### Task 1: Assets, dependencies, and tooling

**Files:**
- Create: `scripts/verify-assets.mjs`, `vitest.config.ts`
- Create (downloaded): `public/images/photo.jpg`, `public/docs/resume.pdf`, `public/docs/admission-letter.pdf`, `public/docs/papers/crowdfunding-paper.pdf`
- Modify: `package.json`

**Interfaces:**
- Produces: the four asset files at those exact paths; npm scripts `test`, `check`, `verify:assets`, `brand`; installed dependencies listed in Step 5.

- [ ] **Step 1: Create directories and download the files**

```bash
cd /c/Projects/portfolio
mkdir -p public/images public/docs public/docs/papers
curl -fL "https://drive.google.com/uc?export=download&id=1QhvswvbKd5yxOMxVcIFjV45w6eJbTlyZ" -o public/images/photo.jpg
curl -fL "https://drive.google.com/uc?export=download&id=1O-C-iWeTH0bywT54jbtyuIhHlL3vwoBi" -o public/docs/resume.pdf
curl -fL "https://drive.google.com/uc?export=download&id=1HuFtA9mwiIy2BpIIrdimT0jxRwoBp6aA" -o public/docs/admission-letter.pdf
curl -fL "https://drive.google.com/uc?export=download&id=1bS3KNgSIjh8lfYMmsF8GS0bK0EZ0YzKL" -o public/docs/papers/crowdfunding-paper.pdf
```

- [ ] **Step 2: Write the verification script**

`scripts/verify-assets.mjs`:

```js
import { readFileSync, statSync } from 'node:fs';

const checks = [
  ['public/images/photo.jpg', Buffer.from([0xff, 0xd8, 0xff])],
  ['public/docs/resume.pdf', Buffer.from('%PDF-')],
  ['public/docs/admission-letter.pdf', Buffer.from('%PDF-')],
  ['public/docs/papers/crowdfunding-paper.pdf', Buffer.from('%PDF-')],
];

let failed = false;
for (const [path, magic] of checks) {
  let buf;
  try {
    buf = readFileSync(path);
  } catch {
    console.error(`MISSING ${path}`);
    failed = true;
    continue;
  }
  const ok = buf.subarray(0, magic.length).equals(magic);
  console.log(`${ok ? 'OK     ' : 'INVALID'} ${path} (${statSync(path).size} bytes)`);
  if (!ok) failed = true;
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 3: Run it**

Run: `node scripts/verify-assets.mjs`
Expected: four `OK` lines, exit code 0.

If any line says `INVALID`, Google Drive returned an HTML page (large-file confirmation or a permission page). Retry that file with the direct endpoint, replacing `ID` and `OUT`:

```bash
curl -fL "https://drive.usercontent.google.com/download?id=ID&export=download&confirm=t" -o OUT
```

Re-run the script. If it is still `INVALID` (file not shared publicly), stop and ask the user to fix sharing or supply the file. Do not continue with a bad file.

- [ ] **Step 4: Confirm the photo is usable**

Read `public/images/photo.jpg` with the Read tool and confirm it is a portrait photo.

- [ ] **Step 5: Install dependencies**

```bash
npm install @astrojs/mdx @astrojs/sitemap @astrojs/markdown-remark remark-math rehype-katex katex
npm install -D typescript@^6 @astrojs/check vitest sharp
```

Expected: exits 0 with no `ERESOLVE` errors. If npm reports a peer conflict, report the exact message; do not use `--force` or `--legacy-peer-deps` without asking.

- [ ] **Step 6: Add scripts and Vitest config**

In `package.json` set `scripts` to:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "check": "astro check",
  "test": "vitest run",
  "verify:assets": "node scripts/verify-assets.mjs",
  "brand": "node scripts/generate-brand.mjs"
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 7: Verify tooling runs**

Run: `npx vitest run --passWithNoTests`
Expected: exits 0 ("No test files found" is fine).

- [ ] **Step 8: Commit**

```bash
git add scripts package.json package-lock.json vitest.config.ts public
git commit -m "chore: add assets, dependencies, and test tooling

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Resume data

**Files:**
- Create: `src/data/resume.ts`, `src/data/resume.test.ts`

**Interfaces:**
- Produces (exact exports later tasks import from `../data/resume` / `../../data/resume`):

```ts
export interface ExperienceEntry { role: string; company: string; location?: string; start: string; end: string; bullets: string[]; }
export interface EducationEntry { institution: string; degree: string; location?: string; start: string; end: string; grade?: string; details?: string[]; }
export interface SkillGroup { label: string; items: string[]; }
export interface Achievement { date?: string; text: string; }
export interface Resume {
  name: string;          // "Gaurav Shinde"
  headline: string;      // one-line title from the resume
  summary: string;       // <= 160 chars, used as meta description
  about: string[];       // paragraphs for the intro
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillGroup[];
  achievements: Achievement[];
}
export const resume: Resume;
```

`start`/`end` are display strings exactly as the resume writes them (for example `"Jun 2023"`, `"Present"`). `Achievement.date` is the resume's own date text if it gives one, otherwise omitted.

- [ ] **Step 1: Read the resume**

Read `public/docs/resume.pdf` with the Read tool (use the `pages` parameter if it has more than 10 pages). Note every experience entry, education entry, skill group, and achievement/award/certification/position of responsibility.

- [ ] **Step 2: Write the failing test**

`src/data/resume.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resume } from './resume';

const filled = (s: unknown): boolean => typeof s === 'string' && s.trim().length > 0;

describe('resume data', () => {
  it('has identity fields', () => {
    expect(resume.name).toBe('Gaurav Shinde');
    expect(filled(resume.headline)).toBe(true);
    expect(filled(resume.summary)).toBe(true);
    expect(resume.summary.length).toBeLessThanOrEqual(160);
    expect(resume.about.length).toBeGreaterThan(0);
    resume.about.forEach((p) => expect(filled(p)).toBe(true));
  });

  it('has complete experience entries', () => {
    expect(resume.experience.length).toBeGreaterThan(0);
    for (const e of resume.experience) {
      expect([e.role, e.company, e.start, e.end].every(filled)).toBe(true);
      expect(e.bullets.length).toBeGreaterThan(0);
      e.bullets.forEach((b) => expect(filled(b)).toBe(true));
    }
  });

  it('has complete education entries', () => {
    expect(resume.education.length).toBeGreaterThan(0);
    for (const e of resume.education) {
      expect([e.institution, e.degree, e.start, e.end].every(filled)).toBe(true);
    }
  });

  it('has skills and achievements', () => {
    expect(resume.skills.length).toBeGreaterThan(0);
    for (const g of resume.skills) {
      expect(filled(g.label)).toBe(true);
      expect(g.items.length).toBeGreaterThan(0);
    }
    expect(resume.achievements.length).toBeGreaterThan(0);
    resume.achievements.forEach((a) => expect(filled(a.text)).toBe(true));
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/data/resume.test.ts`
Expected: FAIL (cannot resolve `./resume`).

- [ ] **Step 4: Write `src/data/resume.ts`**

Export the interfaces above and `export const resume: Resume = { ... }`, filled by transcribing the resume verbatim (fix only obvious typographic artifacts from PDF extraction such as broken ligatures or hyphenation; do not paraphrase, embellish, or invent). `headline` is the resume's own title/role line; `summary` is one factual sentence of at most 160 characters built from resume facts; `about` is the resume's summary/objective text split into paragraphs, or, if the resume has none, two or three short factual sentences composed only from resume content. If a whole category (experience, achievements) is genuinely absent from the resume, stop and tell the user instead of weakening the test.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/data/resume.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Show the user what was extracted**

Print a compact summary in the chat (counts per category, plus role/company/dates for each experience and institution/degree for each education entry, and the `about` text) and say explicitly which fields were composed rather than copied (`summary`, and `about` if the resume had no summary). Continue without waiting unless something in the resume was ambiguous.

- [ ] **Step 7: Commit**

```bash
git add src/data
git commit -m "feat: add typed resume data extracted from resume.pdf

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Config, schemas, collections, Astro config

**Files:**
- Create: `src/config.ts`, `src/lib/schemas.ts`, `src/lib/schemas.test.ts`, `src/lib/format.ts`, `src/lib/format.test.ts`, `src/lib/collections.ts`, `src/content.config.ts`
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `src/config.ts`: `SITE_URL: string`; `SITE = { name: 'Gaurav Shinde', handle: 'gaurav', email: 'gauravshinde1816@gmail.com' }`; `LINKS = { github, linkedin, leetcode, email, resume, admissionLetter }` (all strings); `NAV: { id: string; label: string }[]`.
  - `src/lib/schemas.ts`: `scribbleSchema`, `researchSchema`, `blogSchema` (zod objects).
  - `src/lib/format.ts`: `formatDate(d: Date): string` (`YYYY-MM-DD`), `byDateDesc<T extends { data: { date: Date } }>(a: T, b: T): number`.
  - `src/lib/collections.ts`: `getScribbles()`, `getResearch()`, `getBlogPosts()`, each returns entries sorted newest first; `getBlogPosts()` drops drafts when `import.meta.env.PROD`.
  - Collections named `scribbles`, `research`, `blog`.

- [ ] **Step 1: Write the failing schema tests**

`src/lib/schemas.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { scribbleSchema, researchSchema, blogSchema } from './schemas';

const scribble = {
  title: 'URL Shortener',
  description: 'A tiny URL shortener.',
  tags: ['backend'],
  status: 'POC',
  hasSystemDesign: true,
  date: '2026-03-01',
  githubUrl: 'https://github.com/gauravshinde1729',
};

describe('scribbleSchema', () => {
  it('accepts a valid entry and coerces the date', () => {
    const r = scribbleSchema.parse(scribble);
    expect(r.date).toBeInstanceOf(Date);
    expect(r.status).toBe('POC');
  });
  it('rejects an unknown status', () => {
    expect(scribbleSchema.safeParse({ ...scribble, status: 'Later' }).success).toBe(false);
  });
  it('defaults tags to [] and hasSystemDesign to false', () => {
    const { tags, hasSystemDesign, ...rest } = scribble;
    const r = scribbleSchema.parse(rest);
    expect(r.tags).toEqual([]);
    expect(r.hasSystemDesign).toBe(false);
  });
  it('allows githubUrl to be omitted but rejects a non-URL', () => {
    const { githubUrl, ...rest } = scribble;
    expect(scribbleSchema.safeParse(rest).success).toBe(true);
    expect(scribbleSchema.safeParse({ ...scribble, githubUrl: 'nope' }).success).toBe(false);
  });
});

describe('researchSchema', () => {
  const paper = { title: 'T', abstract: 'A', date: '2024-05-01', paperUrl: '/docs/papers/x.pdf', tags: ['blockchain'] };
  it('accepts a site-relative paper path', () => {
    expect(researchSchema.safeParse(paper).success).toBe(true);
  });
  it('accepts an https paper URL', () => {
    expect(researchSchema.safeParse({ ...paper, paperUrl: 'https://example.org/p.pdf' }).success).toBe(true);
  });
  it('rejects a paperUrl that is neither', () => {
    expect(researchSchema.safeParse({ ...paper, paperUrl: 'x.pdf' }).success).toBe(false);
  });
});

describe('blogSchema', () => {
  const post = { title: 'T', description: 'D', date: '2026-01-02' };
  it('defaults tags and draft', () => {
    const r = blogSchema.parse(post);
    expect(r.tags).toEqual([]);
    expect(r.draft).toBe(false);
  });
  it('accepts an external URL and rejects a malformed one', () => {
    expect(blogSchema.safeParse({ ...post, externalUrl: 'https://www.linkedin.com/pulse/x/' }).success).toBe(true);
    expect(blogSchema.safeParse({ ...post, externalUrl: 'linkedin' }).success).toBe(false);
  });
});
```

`src/lib/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatDate, byDateDesc } from './format';

describe('formatDate', () => {
  it('formats as YYYY-MM-DD in UTC', () => {
    expect(formatDate(new Date('2026-03-14T00:00:00Z'))).toBe('2026-03-14');
  });
});

describe('byDateDesc', () => {
  it('sorts newest first', () => {
    const items = [
      { data: { date: new Date('2025-01-01') } },
      { data: { date: new Date('2026-06-01') } },
      { data: { date: new Date('2025-09-01') } },
    ];
    const sorted = [...items].sort(byDateDesc).map((i) => i.data.date.getUTCFullYear() + '-' + (i.data.date.getUTCMonth() + 1));
    expect(sorted).toEqual(['2026-6', '2025-9', '2025-1']);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run`
Expected: FAIL (cannot resolve `./schemas` and `./format`); the resume tests still pass.

- [ ] **Step 3: Implement `src/lib/schemas.ts` and `src/lib/format.ts`**

`src/lib/schemas.ts`:

```ts
import { z } from 'astro/zod';

const url = z.string().url();
const siteOrAbsoluteUrl = z.string().regex(/^(\/|https?:\/\/)/, 'must start with "/" or "http(s)://"');

export const scribbleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
  status: z.enum(['POC', 'WIP', 'Done']),
  hasSystemDesign: z.boolean().default(false),
  date: z.coerce.date(),
  githubUrl: url.optional(),
});

export const researchSchema = z.object({
  title: z.string().min(1),
  abstract: z.string().min(1),
  date: z.coerce.date(),
  paperUrl: siteOrAbsoluteUrl,
  tags: z.array(z.string()).default([]),
});

export const blogSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  /** When set, the post lives elsewhere (e.g. LinkedIn): listings link out and no detail page is generated. */
  externalUrl: url.optional(),
});
```

`src/lib/format.ts`:

```ts
export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function byDateDesc<T extends { data: { date: Date } }>(a: T, b: T): number {
  return b.data.date.valueOf() - a.data.date.valueOf();
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run`
Expected: PASS for resume, schemas, and format tests.

If `astro/zod` cannot be resolved by Vitest, report the exact error and stop; do not switch to a different zod import without checking `node_modules/astro/package.json` `exports["./zod"]`.

- [ ] **Step 5: Write `src/config.ts`**

```ts
/** Placeholder until deployment is decided. This is the only place the site URL is defined. */
export const SITE_URL = 'https://gauravshinde.example';

export const SITE = {
  name: 'Gaurav Shinde',
  handle: 'gaurav',
  email: 'gauravshinde1816@gmail.com',
} as const;

export const LINKS = {
  github: 'https://github.com/gauravshinde1729',
  linkedin: 'https://www.linkedin.com/in/gauravshinde18/',
  leetcode: 'https://leetcode.com/u/gauravshinde1816/',
  email: `mailto:${SITE.email}`,
  resume: '/docs/resume.pdf',
  admissionLetter: '/docs/admission-letter.pdf',
} as const;

export const NAV = [
  { id: 'intro', label: 'intro' },
  { id: 'experience', label: 'exp' },
  { id: 'education', label: 'edu' },
  { id: 'scribbles', label: 'scribbles' },
  { id: 'research', label: 'research' },
  { id: 'achievements', label: 'awards' },
  { id: 'blog', label: 'blog' },
  { id: 'contact', label: 'contact' },
] as const;
```

- [ ] **Step 6: Write `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { SITE_URL } from './src/config.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
      smartypants: false,
    }),
    syntaxHighlight: { type: 'shiki', excludeLangs: ['math'] },
    shikiConfig: { theme: 'github-dark-default' },
  },
});
```

- [ ] **Step 7: Write `src/content.config.ts` and `src/lib/collections.ts`**

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { scribbleSchema, researchSchema, blogSchema } from './lib/schemas';

const loader = (dir: string) => glob({ pattern: '**/*.{md,mdx}', base: `./src/content/${dir}` });

export const collections = {
  scribbles: defineCollection({ loader: loader('scribbles'), schema: scribbleSchema }),
  research: defineCollection({ loader: loader('research'), schema: researchSchema }),
  blog: defineCollection({ loader: loader('blog'), schema: blogSchema }),
};
```

`src/lib/collections.ts`:

```ts
import { getCollection } from 'astro:content';
import { byDateDesc } from './format';

export async function getScribbles() {
  return (await getCollection('scribbles')).sort(byDateDesc);
}

export async function getResearch() {
  return (await getCollection('research')).sort(byDateDesc);
}

export async function getBlogPosts() {
  const posts = await getCollection('blog', ({ data }) => !import.meta.env.PROD || !data.draft);
  return posts.sort(byDateDesc);
}
```

- [ ] **Step 8: Verify the config loads**

Run: `npx astro sync`
Expected: exits 0. It may warn that the collections are empty (no content files yet); that is fine at this point. Any error mentioning `markdown.processor`, `unified`, or `astro/zod` must be reported and fixed before continuing.

- [ ] **Step 9: Commit**

```bash
git add astro.config.mjs src
git commit -m "feat: add site config, content collection schemas, and Astro config

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Design system and layout shell

**Files:**
- Create: `src/styles/global.css`, `src/lib/icons.ts`, `src/components/Icon.astro`, `src/components/SocialLinks.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/Terminal.astro`, `src/components/Section.astro`, `src/layouts/Base.astro`, `src/scripts/nav.ts`, `src/scripts/reveal.ts`, `src/pages/robots.txt.ts`
- Modify: `src/pages/index.astro` (temporary shell, replaced progressively by later tasks)

**Interfaces:**
- Consumes: `SITE`, `LINKS`, `NAV` from `src/config.ts`; `resume` from `src/data/resume.ts`.
- Produces:
  - `Base.astro` props: `{ title?: string; description?: string; image?: string; type?: 'website' | 'article' }`; named slot `boot` (placed first in `<body>`); default slot inside `<main id="main">`.
  - `Terminal.astro` props: `{ title: string }`; default slot.
  - `Section.astro` props: `{ id: string; command: string }`; default slot. Renders `<section id class="section reveal">` with an `<h2 class="cmd"><span class="ps1">$</span> {command}</h2>`.
  - `Icon.astro` props: `{ name: 'github' | 'linkedin' | 'leetcode' | 'email'; size?: number }`.
  - `SocialLinks.astro`: no props; renders the four links.
  - Global CSS classes used everywhere: `.container`, `.cmd`, `.ps1`, `.cursor`, `.btn`, `.btn-ghost`, `.badge` (+ `.badge-poc|wip|done|sd`), `.tags`, `.meta`, `.prose`, `.timeline`, `.entry`, `.reveal`, `.sr-only`, `.skip`.
  - `html.js` class set by an inline head script; `.js .reveal` starts hidden and `.is-visible` reveals.

- [ ] **Step 1: Write `src/styles/global.css`**

```css
:root {
  --bg: #0d1117;
  --bg-elev: #161b22;
  --border: #30363d;
  --green: #00ff41;
  --green-dim: #00b32d;
  --amber: #f0c040;
  --gray: #8b949e;
  --text: #e6edf3;
  --font: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  --nav-h: 56px;
  --maxw: 960px;
  --gutter: 1rem;
  color-scheme: dark;
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
html[data-boot='pending'] { overflow: hidden; }
[id] { scroll-margin-top: calc(var(--nav-h) + 12px); }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 15px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}
img { max-width: 100%; height: auto; display: block; }
a { color: var(--green); text-decoration: none; }
a:hover { text-decoration: underline; text-underline-offset: 3px; }
:focus-visible { outline: 2px solid var(--green); outline-offset: 3px; border-radius: 2px; }
h1, h2, h3, h4 { line-height: 1.25; margin: 0 0 .5em; }
p { margin: 0 0 1em; }
ul, ol { margin: 0; padding: 0; }
::selection { background: var(--green); color: var(--bg); }

.container { width: 100%; max-width: var(--maxw); margin-inline: auto; padding-inline: var(--gutter); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.skip { position: absolute; left: -999px; top: 0; background: var(--green); color: var(--bg); padding: .5rem 1rem; z-index: 200; }
.skip:focus { left: 0; }

.ps1 { color: var(--green); margin-right: .6ch; user-select: none; }
.cmd { color: var(--text); font-weight: 500; font-size: 1.05rem; margin: 0 0 1.25rem; }
.cursor { display: inline-block; width: .6ch; height: 1.1em; background: var(--green); margin-left: 2px; vertical-align: text-bottom; animation: blink 1.05s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }

.btn {
  display: inline-flex; align-items: center; justify-content: center; min-height: 44px;
  padding: .55rem 1rem; border: 1px solid var(--green); border-radius: 4px;
  background: transparent; color: var(--green); font: inherit; font-weight: 500; cursor: pointer;
  transition: background .15s, color .15s, box-shadow .15s;
}
.btn:hover { background: var(--green); color: var(--bg); text-decoration: none; box-shadow: 0 0 16px rgba(0, 255, 65, .35); }
.btn-ghost { border-color: var(--border); color: var(--gray); }
.btn-ghost:hover { border-color: var(--green); }

.badge { display: inline-block; padding: 0 .5ch; border: 1px solid currentColor; border-radius: 3px; font-size: .75rem; line-height: 1.5; }
.badge-poc { color: var(--amber); }
.badge-wip { color: #58a6ff; }
.badge-done { color: var(--green); }
.badge-sd { color: var(--gray); }

.tags { display: flex; flex-wrap: wrap; gap: .25rem 1ch; list-style: none; color: var(--gray); font-size: .85rem; }
.meta { color: var(--gray); font-size: .85rem; margin-bottom: .75rem; }

/* Timeline (experience / education) */
.timeline { list-style: none; }
.entry { position: relative; margin-left: .6ch; padding: 0 0 1.75rem 4.5ch; border-left: 1px solid var(--border); }
.entry:last-child { border-left-color: transparent; padding-bottom: 0; }
.entry::before { content: '├──'; position: absolute; left: -.6ch; top: 0; line-height: 1.65; color: var(--green); background: var(--bg); }
.entry:last-child::before { content: '└──'; }
.entry h3 { font-size: 1rem; margin-bottom: .15rem; }
.entry .at { color: var(--gray); }
.entry .company { color: var(--amber); }
.entry ul { list-style: none; }
.entry li { position: relative; padding-left: 2ch; margin-bottom: .35rem; }
.entry li::before { content: '>'; position: absolute; left: 0; color: var(--green-dim); }

/* Long-form content (scribbles + blog) */
.prose { font-size: 1rem; }
.prose h2 { font-size: 1.3rem; margin-top: 2rem; color: var(--green); }
.prose h3 { font-size: 1.1rem; margin-top: 1.5rem; color: var(--amber); }
.prose ul, .prose ol { padding-left: 2.5ch; margin-bottom: 1em; }
.prose li { margin-bottom: .3rem; }
.prose code { background: var(--bg-elev); border: 1px solid var(--border); padding: .05em .4ch; border-radius: 3px; font-size: .9em; }
.prose pre { background: var(--bg-elev) !important; border: 1px solid var(--border); border-radius: 6px; padding: 1rem; overflow-x: auto; font-size: .875rem; line-height: 1.5; }
.prose pre code { background: none; border: 0; padding: 0; }
.prose blockquote { margin: 0 0 1em; padding: .6rem 1rem; border-left: 3px solid var(--amber); background: var(--bg-elev); color: var(--gray); }
.prose blockquote p:last-child { margin: 0; }
.prose table { border-collapse: collapse; display: block; overflow-x: auto; margin-bottom: 1em; }
.prose th, .prose td { border: 1px solid var(--border); padding: .35rem .8ch; text-align: left; }
.prose .katex-display { overflow-x: auto; overflow-y: hidden; padding: .25rem 0; }
.prose .katex { font-size: 1.05em; }

/* Section reveal (only when JS is available) */
.js .reveal { opacity: 0; transform: translateY(16px); transition: opacity .5s ease, transform .5s ease; }
.js .reveal.is-visible { opacity: 1; transform: none; }

@media (min-width: 768px) {
  :root { --gutter: 1.5rem; }
  body { font-size: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .js .reveal { opacity: 1; transform: none; transition: none; }
  .cursor { animation: none; }
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

- [ ] **Step 2: Write the icons**

`src/lib/icons.ts`:

```ts
export const ICONS = {
  github: '<path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
  linkedin: '<path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037c-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.06 2.06 0 0 1-2.063-2.065a2.064 2.064 0 1 1 2.063 2.065m1.782 13.019H3.555V9h3.564zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>',
  leetcode: '<path fill="currentColor" d="M13.483 0a1.37 1.37 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.3 5.3 0 0 0-1.209 2.104a5 5 0 0 0-.125.513a5.5 5.5 0 0 0 .062 2.362a6 6 0 0 0 .349 1.017a5.9 5.9 0 0 0 1.271 1.818l4.277 4.193l.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.38 1.38 0 0 0-1.951-.003l-2.396 2.392a3.02 3.02 0 0 1-4.205.038l-.02-.019l-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.7 2.7 0 0 1 .066-.523a2.55 2.55 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0m-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382a1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382a1.38 1.38 0 0 0-1.38-1.382z"/>',
  email: '<path fill="currentColor" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zm-2 0l-8 5l-8-5zm0 12H4V8l8 5l8-5z"/>',
} as const;

export type IconName = keyof typeof ICONS;
```

`src/components/Icon.astro`:

```astro
---
import { ICONS, type IconName } from '../lib/icons';

interface Props {
  name: IconName;
  size?: number;
}
const { name, size = 20 } = Astro.props;
---

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" set:html={ICONS[name]} />
```

`src/components/SocialLinks.astro`:

```astro
---
import Icon from './Icon.astro';
import { LINKS } from '../config';

const items = [
  { name: 'github', label: 'GitHub', href: LINKS.github, external: true },
  { name: 'linkedin', label: 'LinkedIn', href: LINKS.linkedin, external: true },
  { name: 'leetcode', label: 'LeetCode', href: LINKS.leetcode, external: true },
  { name: 'email', label: 'Email', href: LINKS.email, external: false },
] as const;
---

<ul class="social">
  {
    items.map((i) => (
      <li>
        <a href={i.href} aria-label={i.label} title={i.label} target={i.external ? '_blank' : undefined} rel={i.external ? 'noopener' : undefined}>
          <Icon name={i.name} size={22} />
        </a>
      </li>
    ))
  }
</ul>

<style>
  .social { display: flex; gap: .5rem; list-style: none; }
  a { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 1px solid var(--border); border-radius: 6px; color: var(--gray); transition: color .15s, border-color .15s, box-shadow .15s; }
  a:hover { color: var(--green); border-color: var(--green); box-shadow: 0 0 12px rgba(0, 255, 65, .25); text-decoration: none; }
</style>
```

- [ ] **Step 3: Write Terminal and Section components**

`src/components/Terminal.astro`:

```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<div class="term">
  <div class="bar">
    <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="title">{title}</span>
  </div>
  <div class="body"><slot /></div>
</div>

<style>
  .term { border: 1px solid var(--border); border-radius: 8px; background: var(--bg-elev); overflow: hidden; }
  .bar { display: flex; align-items: center; gap: 1rem; padding: .5rem .9rem; border-bottom: 1px solid var(--border); background: #0f141b; }
  .dots { display: flex; gap: 6px; }
  .dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--border); }
  .dots i:nth-child(1) { background: #ff5f56; }
  .dots i:nth-child(2) { background: var(--amber); }
  .dots i:nth-child(3) { background: #27c93f; }
  .title { color: var(--gray); font-size: .8rem; }
  .body { padding: 1rem; overflow-x: auto; }
</style>
```

`src/components/Section.astro`:

```astro
---
interface Props {
  id: string;
  command: string;
}
const { id, command } = Astro.props;
---

<section id={id} class="section reveal">
  <div class="container">
    <h2 class="cmd"><span class="ps1">$</span>{command}</h2>
    <slot />
  </div>
</section>

<style>
  .section { padding-block: 3rem; }
  @media (min-width: 768px) { .section { padding-block: 4.5rem; } }
</style>
```

- [ ] **Step 4: Write Nav, nav script, Footer**

`src/components/Nav.astro`:

```astro
---
import { NAV, LINKS, SITE } from '../config';
---

<header class="nav">
  <div class="bar container">
    <a class="brand" href="/#intro" aria-label="Home">{SITE.handle}@portfolio:~<span class="cursor" aria-hidden="true"></span></a>
    <nav id="site-nav" class="tabs" aria-label="Primary">
      {NAV.map((n) => <a href={`/#${n.id}`} data-nav={n.id}>{n.label}</a>)}
    </nav>
    <a class="btn dl" href={LINKS.resume} target="_blank" rel="noopener" download>$ download resume</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<script>
  import '../scripts/nav.ts';
</script>

<style>
  .nav { position: sticky; top: 0; z-index: 50; background: rgba(13, 17, 23, .92); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); }
  .bar { position: relative; display: flex; align-items: center; gap: .75rem; min-height: var(--nav-h); }
  .brand { color: var(--green); font-weight: 700; white-space: nowrap; margin-right: auto; }
  .brand:hover { text-decoration: none; }
  .tabs { display: none; }
  .dl { min-height: 36px; padding: .25rem .75rem; font-size: .8rem; white-space: nowrap; }
  .burger { display: inline-flex; flex-direction: column; justify-content: center; gap: 5px; width: 44px; height: 44px; padding: 0 11px; background: none; border: 1px solid var(--border); border-radius: 6px; cursor: pointer; }
  .burger span { height: 2px; background: var(--green); transition: transform .2s, opacity .2s; }
  .nav[data-open] .burger span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .nav[data-open] .burger span:nth-child(2) { opacity: 0; }
  .nav[data-open] .burger span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .nav[data-open] .tabs { display: flex; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg); border-bottom: 1px solid var(--border); padding: .5rem var(--gutter) 1rem; }
  .tabs a { color: var(--gray); padding: .65rem .5rem; min-height: 44px; display: flex; align-items: center; }
  .tabs a::before { content: '~/'; color: var(--green-dim); margin-right: 0; }
  .tabs a:hover, .tabs a[aria-current='true'] { color: var(--green); text-decoration: none; }

  @media (min-width: 900px) {
    .burger { display: none; }
    .tabs { display: flex; gap: .1rem; }
    .tabs a { padding: .25rem .6rem; min-height: 0; font-size: .85rem; border-radius: 4px; }
    .tabs a[aria-current='true'] { background: rgba(0, 255, 65, .08); }
    .brand { margin-right: 0; }
    .dl { margin-left: auto; }
  }
</style>
```

`src/scripts/nav.ts`:

```ts
const nav = document.querySelector<HTMLElement>('.nav');
const burger = nav?.querySelector<HTMLButtonElement>('.burger');

function setOpen(open: boolean) {
  if (!nav || !burger) return;
  nav.toggleAttribute('data-open', open);
  burger.setAttribute('aria-expanded', String(open));
}

burger?.addEventListener('click', () => setOpen(!nav?.hasAttribute('data-open')));
nav?.querySelectorAll('.tabs a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setOpen(false);
});

// Highlight the tab of the section currently in view (home page only).
const links = new Map<string, HTMLElement>();
nav?.querySelectorAll<HTMLElement>('.tabs a[data-nav]').forEach((a) => links.set(a.dataset.nav!, a));
const sections = document.querySelectorAll<HTMLElement>('main section[id]');

if (sections.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a, id) => {
          if (id === entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}
```

`src/components/Footer.astro`:

```astro
---
import SocialLinks from './SocialLinks.astro';
import { SITE } from '../config';
---

<footer class="footer">
  <div class="container inner">
    <p class="line"><span class="ps1">$</span>echo "© {new Date().getFullYear()} {SITE.name}"</p>
    <SocialLinks />
  </div>
</footer>

<style>
  .footer { border-top: 1px solid var(--border); padding-block: 2rem; margin-top: 2rem; }
  .inner { display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }
  .line { margin: 0; color: var(--gray); font-size: .85rem; }
  @media (min-width: 768px) { .inner { flex-direction: row; justify-content: space-between; align-items: center; } }
</style>
```

- [ ] **Step 5: Write the reveal script**

`src/scripts/reveal.ts`:

```ts
const items = document.querySelectorAll<HTMLElement>('.reveal');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduced || !('IntersectionObserver' in window)) {
  items.forEach((el) => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
}
```

- [ ] **Step 6: Write the Base layout**

`src/layouts/Base.astro`:

```astro
---
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import { SITE } from '../config';
import { resume } from '../data/resume';

interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

const { title, description = resume.summary, image = '/og.png', type = 'website' } = Astro.props;
const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} | ${resume.headline}`;
const canonical = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL(image, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script is:inline>document.documentElement.classList.add('js');</script>
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta name="generator" content={Astro.generator} />
    <meta name="theme-color" content="#0d1117" />

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <link rel="sitemap" href="/sitemap-index.xml" />

    <meta property="og:type" content={type} />
    <meta property="og:site_name" content={SITE.name} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <slot name="boot" />
    <a class="skip" href="#main">Skip to content</a>
    <Nav />
    <main id="main"><slot /></main>
    <Footer />
    <script>
      import '../scripts/reveal.ts';
    </script>
  </body>
</html>
```

- [ ] **Step 7: Write robots.txt and a temporary index page**

`src/pages/robots.txt.ts`:

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
```

`src/pages/index.astro` (temporary; later tasks extend it):

```astro
---
import Base from '../layouts/Base.astro';
import Section from '../components/Section.astro';
import Terminal from '../components/Terminal.astro';
---

<Base>
  <Section id="intro" command="shell check">
    <Terminal title="shell">
      <p>layout shell ok</p>
    </Terminal>
  </Section>
</Base>
```

- [ ] **Step 8: Verify build and types**

Run: `npm run build && npx astro check`
Expected: build succeeds, `dist/index.html` and `dist/robots.txt` exist, `astro check` reports 0 errors. (Warnings about empty collections are acceptable until Task 8.)

Run: `grep -c 'rel="canonical"' dist/index.html && grep -o 'og:image" content="[^"]*"' dist/index.html && cat dist/robots.txt`
Expected: `1`, an absolute `https://gauravshinde.example/og.png` URL, and a `Sitemap:` line with `https://gauravshinde.example/sitemap-index.xml`.

Run: `ls dist | grep sitemap`
Expected: `sitemap-0.xml` and `sitemap-index.xml`.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat: add design system, layout shell, nav, footer, and SEO base

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Brand assets (favicon and OG image)

**Files:**
- Create: `public/favicon.svg` (replace), `scripts/generate-brand.mjs`, `public/favicon.ico` (replace), `public/og.png`

**Interfaces:**
- Consumes: `public/images/photo.jpg` (Task 1); `resume.headline` from `src/data/resume.ts` (Task 2, imported directly by Node 24 type stripping).
- Produces: `/favicon.svg`, `/favicon.ico`, `/og.png` (1200x630), referenced by `Base.astro`.

- [ ] **Step 1: Write the favicon SVG**

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0d1117"/>
  <path d="M8 10l7 6-7 6" fill="none" stroke="#00ff41" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 23h8" stroke="#f0c040" stroke-width="3" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 2: Write the generator script**

`scripts/generate-brand.mjs`:

```js
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { resume } from '../src/data/resume.ts';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// favicon.ico: a single 32x32 PNG wrapped in an ICO container.
const svg = readFileSync('public/favicon.svg');
const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header[6] = 32; // width
header[7] = 32; // height
header.writeUInt16LE(1, 10); // planes
header.writeUInt16LE(32, 12); // bit depth
header.writeUInt32LE(png32.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
writeFileSync('public/favicon.ico', Buffer.concat([header, png32]));

// og.png: 1200x630, terminal-styled card with the circular photo.
const W = 1200;
const H = 630;
const D = 360;
const cx = 900;
const cy = 315;

const photo = await sharp('public/images/photo.jpg')
  .resize(D, D, { fit: 'cover', position: sharp.strategy.attention })
  .png()
  .toBuffer();
const mask = Buffer.from(`<svg width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#fff"/></svg>`);
const circle = await sharp(photo).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

const card = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <circle cx="${cx}" cy="${cy}" r="${D / 2 + 12}" fill="none" stroke="#00ff41" stroke-width="4" opacity="0.85"/>
  <text x="80" y="235" font-family="monospace" font-size="34" fill="#8b949e">$ whoami</text>
  <text x="80" y="315" font-family="monospace" font-size="64" font-weight="700" fill="#00ff41">${esc(resume.name)}</text>
  <text x="80" y="375" font-family="monospace" font-size="30" fill="#f0c040">${esc(resume.headline)}</text>
  <rect x="80" y="405" width="22" height="40" fill="#00ff41"/>
</svg>`);

await sharp(card)
  .composite([{ input: circle, left: cx - D / 2, top: cy - D / 2 }])
  .png()
  .toFile('public/og.png');

console.log('wrote public/favicon.ico and public/og.png');
```

- [ ] **Step 3: Run it**

Run: `npm run brand`
Expected: prints `wrote public/favicon.ico and public/og.png`, exit 0.

If the headline is long enough to run off the card (over about 45 characters at 30px), shorten `font-size` to 24 in the script. Do not change `resume.headline`.

- [ ] **Step 4: Inspect the output**

Read `public/og.png` and confirm: dark background, green name, amber headline, circular photo with a green ring on the right, nothing clipped. Run `file public/og.png public/favicon.ico` and confirm `1200 x 630` PNG and an `MS Windows icon resource`.

- [ ] **Step 5: Commit**

```bash
git add public scripts
git commit -m "feat: add favicon and Open Graph image generation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Boot sequence and Intro section

**Files:**
- Create: `src/lib/boot-lines.ts`, `src/components/Boot.astro`, `src/scripts/boot.ts`, `src/scripts/typed.ts`, `src/components/sections/Intro.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Base.astro` (`boot` slot), `resume` (`name`, `headline`, `about`, `skills`), `LINKS.resume`.
- Produces: `Boot.astro` (no props; renders the overlay and its inline pre-paint script); `Intro.astro` (no props); the `boot:done` window event (fired when the overlay is gone, or never fired if the boot is skipped); `document.documentElement.dataset.boot === 'pending'` while the overlay is active.

- [ ] **Step 1: Write the boot log text**

`src/lib/boot-lines.ts`:

```ts
export const BOOT_LINES: readonly string[] = [
  '[  OK  ] Reached target Portfolio System',
  '[  OK  ] Mounted /dev/resume',
  '[  OK  ] Started Profile Loader',
  '[  OK  ] Loaded skills, experience, education',
  '[  OK  ] Started Shell Session',
  '',
  'login: gaurav',
];
```

- [ ] **Step 2: Write the Boot component**

`src/components/Boot.astro`:

```astro
---
---

<script is:inline>
  try {
    if (
      !matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !sessionStorage.getItem('booted') &&
      !location.hash
    ) {
      document.documentElement.dataset.boot = 'pending';
    }
  } catch (e) {}
</script>

<div id="boot" class="boot" hidden aria-hidden="true">
  <pre id="boot-log" class="log"></pre>
  <p class="skip-hint">press any key or tap to skip</p>
</div>

<script>
  import '../scripts/boot.ts';
</script>

<style is:global>
  .boot { position: fixed; inset: 0; z-index: 100; background: var(--bg); padding: 1.25rem var(--gutter); overflow: hidden; transition: opacity .25s ease; }
  html[data-boot='pending'] .boot { display: block; }
  .boot.boot-out { opacity: 0; }
  .boot .log { margin: 0; font: inherit; font-size: .85rem; line-height: 1.7; color: var(--green); white-space: pre-wrap; }
  .boot .skip-hint { position: absolute; bottom: 1.25rem; left: var(--gutter); margin: 0; color: var(--gray); font-size: .75rem; }
</style>
```

- [ ] **Step 3: Write the boot and typing scripts**

`src/scripts/boot.ts`:

```ts
import { BOOT_LINES } from '../lib/boot-lines';

const root = document.documentElement;
const overlay = document.getElementById('boot');
const log = document.getElementById('boot-log');

if (root.dataset.boot === 'pending' && overlay && log) {
  let finishing = false;
  let index = 0;

  const finish = () => {
    if (finishing) return;
    finishing = true;
    try {
      sessionStorage.setItem('booted', '1');
    } catch {
      /* storage unavailable: boot may replay next visit */
    }
    overlay.classList.add('boot-out');
    window.setTimeout(() => {
      delete root.dataset.boot;
      overlay.remove();
      window.dispatchEvent(new Event('boot:done'));
    }, 250);
  };

  window.addEventListener('keydown', finish, { once: true });
  overlay.addEventListener('pointerdown', finish, { once: true });

  const tick = () => {
    if (finishing) return;
    if (index >= BOOT_LINES.length) {
      window.setTimeout(finish, 350);
      return;
    }
    log.textContent += BOOT_LINES[index++] + '\n';
    window.setTimeout(tick, 140);
  };
  tick();
}
```

`src/scripts/typed.ts`:

```ts
// Types out [data-typed] elements after the boot overlay closes.
// The text is real HTML; it is only cleared/retyped when a boot sequence is about to play.
const els = [...document.querySelectorAll<HTMLElement>('[data-typed]')];

if (els.length && document.documentElement.dataset.boot === 'pending') {
  const texts = els.map((el) => el.textContent ?? '');
  els.forEach((el) => (el.textContent = ''));

  window.addEventListener(
    'boot:done',
    async () => {
      for (let i = 0; i < els.length; i++) {
        for (const ch of texts[i]) {
          els[i].textContent += ch;
          await new Promise((r) => setTimeout(r, 65));
        }
      }
    },
    { once: true },
  );
}
```

- [ ] **Step 4: Write the Intro section**

`src/components/sections/Intro.astro`:

```astro
---
import { resume } from '../../data/resume';
import { LINKS } from '../../config';
---

<section id="intro" class="intro">
  <div class="container grid">
    <div class="text">
      <p class="cmd"><span class="ps1">$</span>whoami</p>
      <h1><span class="typed" data-typed>{resume.name}</span><span class="cursor" aria-hidden="true"></span></h1>
      <p class="headline">{resume.headline}</p>

      <p class="cmd"><span class="ps1">$</span>cat about.txt</p>
      {resume.about.map((p) => <p class="about">{p}</p>)}

      <p class="cmd"><span class="ps1">$</span>ls skills/</p>
      <dl class="skills">
        {
          resume.skills.map((g) => (
            <>
              <dt>{g.label}</dt>
              <dd>{g.items.join(', ')}</dd>
            </>
          ))
        }
      </dl>

      <a class="btn" href={LINKS.resume} target="_blank" rel="noopener" download>$ download resume</a>
    </div>
    <div class="photo">
      <img src="/images/photo.jpg" alt={`Portrait of ${resume.name}`} width="320" height="320" fetchpriority="high" />
    </div>
  </div>
</section>

<script>
  import '../../scripts/typed.ts';
</script>

<style>
  .intro { padding-block: 2.5rem 3rem; }
  .grid { display: grid; gap: 2rem; align-items: center; }
  h1 { font-size: clamp(2rem, 8vw, 3.25rem); color: var(--green); margin-bottom: .25rem; }
  .headline { color: var(--amber); font-size: 1.05rem; margin-bottom: 2rem; }
  .about { max-width: 62ch; }
  .skills { margin: 0 0 1.75rem; display: grid; grid-template-columns: max-content 1fr; gap: .25rem 2ch; font-size: .9rem; }
  .skills dt { color: var(--amber); }
  .skills dd { margin: 0; color: var(--gray); }
  .photo img { width: min(70vw, 320px); aspect-ratio: 1; object-fit: cover; border-radius: 50%; border: 2px solid var(--green); box-shadow: 0 0 0 6px rgba(0, 255, 65, .08), 0 0 48px rgba(0, 255, 65, .4); margin-inline: auto; }
  @media (min-width: 768px) {
    .intro { padding-block: 4rem 5rem; }
    .grid { grid-template-columns: 1.6fr 1fr; gap: 3rem; }
    .photo img { width: 320px; margin-inline: 0 auto; }
  }
</style>
```

- [ ] **Step 5: Wire it into the home page**

Replace `src/pages/index.astro` with:

```astro
---
import Base from '../layouts/Base.astro';
import Boot from '../components/Boot.astro';
import Intro from '../components/sections/Intro.astro';
---

<Base>
  <Boot slot="boot" />
  <Intro />
</Base>
```

- [ ] **Step 6: Verify build and types**

Run: `npm run build && npx astro check`
Expected: success, 0 errors.

Run: `grep -c 'id="intro"' dist/index.html && grep -c 'download resume' dist/index.html && grep -c 'Portrait of Gaurav Shinde' dist/index.html`
Expected: each prints `1` or more. Confirms content is in the static HTML.

- [ ] **Step 7: Verify behavior in a browser**

Start the dev server: `astro dev --background`, then use the `run` skill or the browser tools to open `http://localhost:4321/` in a fresh session. Confirm: the boot log prints and the overlay fades; then the name types out with a blinking cursor; clicking or pressing a key during the boot skips it; reloading in the same tab does not replay the boot and shows the name immediately. Then emulate `prefers-reduced-motion: reduce` (or disable JS) and confirm the name and all content show with no overlay. Check the console for errors. Stop the server with `astro dev stop`.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat: add boot sequence, typing animation, and intro section

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Experience, Education, Achievements

**Files:**
- Create: `src/components/sections/Experience.astro`, `src/components/sections/Education.astro`, `src/components/sections/Achievements.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Section`, `Terminal`, `resume.experience|education|achievements`, `LINKS.admissionLetter`; global `.timeline`, `.entry`, `.meta`.
- Produces: three no-prop section components with ids `experience`, `education`, `achievements`.

- [ ] **Step 1: Write Experience**

`src/components/sections/Experience.astro`:

```astro
---
import Section from '../Section.astro';
import { resume } from '../../data/resume';
---

<Section id="experience" command="cat experience.log">
  <ol class="timeline">
    {
      resume.experience.map((e) => (
        <li class="entry">
          <h3>
            {e.role} <span class="at">@</span> <span class="company">{e.company}</span>
          </h3>
          <p class="meta">
            {e.start} – {e.end}
            {e.location && ` · ${e.location}`}
          </p>
          <ul>{e.bullets.map((b) => <li>{b}</li>)}</ul>
        </li>
      ))
    }
  </ol>
</Section>
```

- [ ] **Step 2: Write Education**

`src/components/sections/Education.astro`:

```astro
---
import Section from '../Section.astro';
import { resume } from '../../data/resume';
import { LINKS } from '../../config';
---

<Section id="education" command="cat education.log">
  <ol class="timeline">
    {
      resume.education.map((e) => (
        <li class="entry">
          <h3>
            {e.degree} <span class="at">@</span> <span class="company">{e.institution}</span>
          </h3>
          <p class="meta">
            {e.start} – {e.end}
            {e.location && ` · ${e.location}`}
            {e.grade && ` · ${e.grade}`}
          </p>
          {e.details && e.details.length > 0 && <ul>{e.details.map((d) => <li>{d}</li>)}</ul>}
        </li>
      ))
    }
  </ol>
  <p class="open">
    <a class="btn btn-ghost" href={LINKS.admissionLetter} target="_blank" rel="noopener">$ open admission-letter.pdf</a>
  </p>
</Section>

<style>
  .open { margin: 2rem 0 0; }
</style>
```

- [ ] **Step 3: Write Achievements**

`src/components/sections/Achievements.astro`:

```astro
---
import Section from '../Section.astro';
import Terminal from '../Terminal.astro';
import { resume } from '../../data/resume';
---

<Section id="achievements" command="cat achievements.log">
  <Terminal title="/var/log/achievements.log">
    <ul class="syslog">
      {
        resume.achievements.map((a) => (
          <li>
            <span class="ts">[{a.date ?? '----'}]</span> <span class="lvl">INFO</span> <span class="msg">{a.text}</span>
          </li>
        ))
      }
    </ul>
  </Terminal>
</Section>

<style>
  .syslog { list-style: none; font-size: .9rem; }
  .syslog li { padding: .35rem 0; display: grid; grid-template-columns: 1fr; gap: 0 1ch; }
  .ts { color: var(--gray); }
  .lvl { color: var(--green); font-weight: 700; }
  @media (min-width: 768px) {
    .syslog li { display: block; }
  }
</style>
```

- [ ] **Step 4: Add them to the home page**

Edit `src/pages/index.astro` so the frontmatter imports the three new components and the body renders, in this order after `<Intro />`: `<Experience />`, `<Education />`. Leave `<Achievements />` for now placed after `<Education />`; Task 9 will insert Scribbles and Research between them. Final order for the whole site (keep it when later tasks insert): Intro, Experience, Education, Scribbles, Research, Achievements, Blog, Contact.

```astro
import Experience from '../components/sections/Experience.astro';
import Education from '../components/sections/Education.astro';
import Achievements from '../components/sections/Achievements.astro';
```

- [ ] **Step 5: Verify**

Run: `npm run build && npx astro check`
Expected: success, 0 errors.

Run: `grep -o 'id="experience"\|id="education"\|id="achievements"' dist/index.html | sort | uniq -c`
Expected: each id appears once.

Run: `grep -c 'admission-letter.pdf' dist/index.html`
Expected: `1` or more.

Spot check (Read `dist/index.html` or the dev server): the first experience role and company, and the first achievement, match `resume.ts` verbatim.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat: add experience, education, and achievements sections

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Scribbles (collection, list, section, pages)

**Files:**
- Create: `src/content/scribbles/url-shortener.mdx`, `src/content/scribbles/lru-cache.mdx`, `src/content/scribbles/tiny-transformer.mdx`, `src/components/ScribbleList.astro`, `src/components/sections/Scribbles.astro`, `src/layouts/Article.astro`, `src/pages/scribbles/index.astro`, `src/pages/scribbles/[slug].astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getScribbles()` (Task 3), `formatDate`, `Base`, `Section`, `Terminal`, global `.badge*`, `.tags`, `.prose`.
- Produces:
  - `ScribbleList.astro` props: `{ items: CollectionEntry<'scribbles'>[] }`.
  - `Scribbles.astro` (no props), section id `scribbles`.
  - `Article.astro` props: `{ title: string; description: string; date: Date; tags: string[]; backHref: string; backLabel: string }`; default slot = body; named slot `meta` = extra inline metadata after the date. Reused by Task 10.
  - Routes `/scribbles/` and `/scribbles/<id>/`.

- [ ] **Step 1: Write the three sample entries**

All three carry a visible "Sample entry" callout in the body and use the user's GitHub profile URL (no invented repository URLs).

`src/content/scribbles/url-shortener.mdx`:

````mdx
---
title: "URL Shortener"
description: "Base62-encoded short links with a write-through cache."
date: 2026-02-10
tags: [system-design, backend]
status: POC
hasSystemDesign: true
githubUrl: https://github.com/gauravshinde1729
---

> **Sample entry.** This is placeholder content that shows how a Scribble renders. Replace it with your own project.

A short link service maps a long URL to a compact code and redirects on lookup.

## Design sketch

- **Write path:** generate a unique id, encode it as base62, store `code -> url`.
- **Read path:** cache lookup first, database on a miss, then `301` to the target.
- **Scale:** the read path dominates, so cache aggressively and shard by code.

```ts
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function encodeBase62(n: number): string {
  if (n === 0) return ALPHABET[0];
  let out = '';
  while (n > 0) {
    out = ALPHABET[n % 62] + out;
    n = Math.floor(n / 62);
  }
  return out;
}
```
````

`src/content/scribbles/lru-cache.mdx`:

````mdx
---
title: "LRU Cache from Scratch"
description: "A hash map plus a doubly linked list gives O(1) get and put."
date: 2026-01-20
tags: [data-structures, python]
status: Done
hasSystemDesign: false
githubUrl: https://github.com/gauravshinde1729
---

> **Sample entry.** This is placeholder content that shows how a Scribble renders. Replace it with your own project.

The classic trick: keep entries in recency order in a linked list and index them with a dictionary.

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.data: OrderedDict[str, int] = OrderedDict()

    def get(self, key: str) -> int | None:
        if key not in self.data:
            return None
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key: str, value: int) -> None:
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)
```
````

`src/content/scribbles/tiny-transformer.mdx`:

````mdx
---
title: "Tiny Transformer"
description: "A character-level transformer trained on a small text corpus."
date: 2026-03-05
tags: [ml, transformers]
status: WIP
hasSystemDesign: false
githubUrl: https://github.com/gauravshinde1729
---

> **Sample entry.** This is placeholder content that shows how a Scribble renders. Replace it with your own project.

Goal: a minimal decoder-only transformer, small enough to train on a laptop.

## Plan

1. Tokenize at the character level.
2. Implement causal self-attention.
3. Stack blocks with residual connections and layer norm.
4. Train, sample, and compare against a bigram baseline.

```python
import torch
import torch.nn.functional as F

def causal_attention(q, k, v):
    scores = q @ k.transpose(-2, -1) / q.size(-1) ** 0.5
    mask = torch.tril(torch.ones_like(scores)).bool()
    scores = scores.masked_fill(~mask, float("-inf"))
    return F.softmax(scores, dim=-1) @ v
```
````

- [ ] **Step 2: Write ScribbleList**

`src/components/ScribbleList.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import { formatDate } from '../lib/format';

interface Props {
  items: CollectionEntry<'scribbles'>[];
}
const { items } = Astro.props;
---

<ul class="ls">
  {
    items.map((s) => (
      <li class="row">
        <span class="date">{formatDate(s.data.date)}</span>
        <span class={`badge badge-${s.data.status.toLowerCase()}`}>{s.data.status}</span>
        <span class="main">
          <a class="name" href={`/scribbles/${s.id}/`}>{s.data.title}</a>
          {s.data.hasSystemDesign && <span class="badge badge-sd">sys-design</span>}
          <span class="desc">{s.data.description}</span>
          {s.data.tags.length > 0 && <span class="tagline">{s.data.tags.map((t) => `#${t}`).join(' ')}</span>}
        </span>
        {s.data.githubUrl && (
          <a class="gh" href={s.data.githubUrl} target="_blank" rel="noopener">[github]</a>
        )}
      </li>
    ))
  }
</ul>

<style>
  .ls { list-style: none; }
  .row { display: grid; grid-template-columns: auto 1fr; gap: .25rem 1.5ch; padding: .9rem 0; border-bottom: 1px dashed var(--border); align-items: start; }
  .row:last-child { border-bottom: 0; }
  .date { color: var(--gray); font-size: .85rem; }
  .main { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: .25rem 1.5ch; align-items: baseline; }
  .name { font-weight: 700; }
  .desc { flex-basis: 100%; color: var(--gray); font-size: .9rem; }
  .tagline { flex-basis: 100%; color: var(--gray); font-size: .8rem; }
  .gh { grid-column: 1 / -1; font-size: .85rem; color: var(--amber); }
  @media (min-width: 768px) {
    .row { grid-template-columns: 11ch 7ch 1fr auto; gap: 0 2ch; }
    .main { grid-column: auto; }
    .gh { grid-column: auto; }
  }
</style>
```

- [ ] **Step 3: Write the Scribbles section, Article layout, and pages**

`src/components/sections/Scribbles.astro`:

```astro
---
import Section from '../Section.astro';
import Terminal from '../Terminal.astro';
import ScribbleList from '../ScribbleList.astro';
import { getScribbles } from '../../lib/collections';

const items = await getScribbles();
---

<Section id="scribbles" command="ls -l scribbles/">
  <Terminal title="~/scribbles">
    <ScribbleList items={items} />
  </Terminal>
</Section>
```

`src/layouts/Article.astro`:

```astro
---
import Base from './Base.astro';
import { formatDate } from '../lib/format';

interface Props {
  title: string;
  description: string;
  date: Date;
  tags: string[];
  backHref: string;
  backLabel: string;
}
const { title, description, date, tags, backHref, backLabel } = Astro.props;
---

<Base title={title} description={description} type="article">
  <div class="container article">
    <p class="cmd"><a href={backHref}><span class="ps1">$</span>cd ../{backLabel}</a></p>
    <header>
      <h1>{title}</h1>
      <p class="meta">
        <time datetime={date.toISOString()}>{formatDate(date)}</time>
        <slot name="meta" />
      </p>
      {tags.length > 0 && <ul class="tags">{tags.map((t) => <li>#{t}</li>)}</ul>}
    </header>
    <div class="prose"><slot /></div>
  </div>
</Base>

<style>
  .article { padding-block: 2rem 3rem; }
  h1 { color: var(--green); font-size: clamp(1.6rem, 6vw, 2.25rem); margin-bottom: .5rem; }
  header { margin-bottom: 2rem; border-bottom: 1px dashed var(--border); padding-bottom: 1rem; }
</style>
```

`src/pages/scribbles/index.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Terminal from '../../components/Terminal.astro';
import ScribbleList from '../../components/ScribbleList.astro';
import { getScribbles } from '../../lib/collections';

const items = await getScribbles();
---

<Base title="Scribbles" description="Projects, experiments, and system design notes.">
  <div class="container" style="padding-block: 2rem 3rem;">
    <p class="cmd"><a href="/#intro"><span class="ps1">$</span>cd ..</a></p>
    <h1 class="cmd"><span class="ps1">$</span>ls -l scribbles/</h1>
    <Terminal title="~/scribbles">
      <ScribbleList items={items} />
    </Terminal>
  </div>
</Base>
```

`src/pages/scribbles/[slug].astro`:

```astro
---
import { render } from 'astro:content';
import Article from '../../layouts/Article.astro';
import { getScribbles } from '../../lib/collections';

export async function getStaticPaths() {
  const items = await getScribbles();
  return items.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { data } = entry;
---

<Article title={data.title} description={data.description} date={data.date} tags={data.tags} backHref="/#scribbles" backLabel="scribbles">
  <Fragment slot="meta">
    <span class={`badge badge-${data.status.toLowerCase()}`}>{data.status}</span>
    {data.hasSystemDesign && <span class="badge badge-sd">sys-design</span>}
    {data.githubUrl && <a href={data.githubUrl} target="_blank" rel="noopener">[github]</a>}
  </Fragment>
  <Content />
</Article>
```

- [ ] **Step 4: Add the section to the home page**

In `src/pages/index.astro` import `Scribbles` from `../components/sections/Scribbles.astro` and render `<Scribbles />` immediately after `<Education />` (before `<Achievements />`).

- [ ] **Step 5: Verify**

Run: `npm run build && npx astro check`
Expected: success, 0 errors; the build lists `/scribbles/`, `/scribbles/url-shortener/`, `/scribbles/lru-cache/`, `/scribbles/tiny-transformer/`.

Run: `grep -c 'astro-code' dist/scribbles/url-shortener/index.html`
Expected: `1` or more (Shiki highlighting applied).

Run: `grep -o 'badge-poc\|badge-wip\|badge-done\|sys-design' dist/index.html | sort | uniq -c`
Expected: all four appear.

If `astro check` complains about the `slot` attribute on `Fragment`, keep `<Fragment slot="meta">` (it is the documented form); report the exact message if it persists.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat: add scribbles collection, listing, and detail pages

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Research section

**Files:**
- Create: `src/content/research/crowdfunding-fraud-detection.md`, `src/components/sections/Research.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getResearch()`, `Section`, `Terminal`, `formatDate`, `researchSchema` fields (`title`, `abstract`, `date`, `paperUrl`, `tags`).
- Produces: `Research.astro` (no props), section id `research`. No standalone research routes (per spec).

- [ ] **Step 1: Read the paper**

Read `public/docs/papers/crowdfunding-paper.pdf` with the Read tool (use `pages` if long). Find the exact title, the abstract, the publication or submission date (or the year if that is all it gives), and the author-provided keywords.

- [ ] **Step 2: Write the entry**

`src/content/research/crowdfunding-fraud-detection.md`, using the abstract **copied verbatim** from the paper, keywords as `tags` (lowercase, hyphenated), and `date` as `YYYY-MM-DD` (use `YYYY-01-01` and say so in the report if the paper only gives a year):

```md
---
title: "Decentralized Transaction System for Detection and Prevention of Fraud in Crowdfunding Platforms"
abstract: "<abstract text from the paper>"
date: <publication date from the paper>
paperUrl: /docs/papers/crowdfunding-paper.pdf
tags: [<keywords from the paper>]
---
```

The title must be exactly the title in the user's brief. The angle-bracket items above are instructions for this step: after writing the file, confirm no `<` characters remain in it.

- [ ] **Step 3: Write the Research section**

`src/components/sections/Research.astro`:

```astro
---
import Section from '../Section.astro';
import Terminal from '../Terminal.astro';
import { getResearch } from '../../lib/collections';
import { formatDate } from '../../lib/format';

const papers = await getResearch();
---

<Section id="research" command="ls research/">
  <div class="papers">
    {
      papers.map((p) => (
        <Terminal title={`${p.id}.pdf`}>
          <h3>{p.data.title}</h3>
          <p class="meta">{formatDate(p.data.date)}</p>
          <p class="abstract">{p.data.abstract}</p>
          {p.data.tags.length > 0 && <ul class="tags">{p.data.tags.map((t) => <li>#{t}</li>)}</ul>}
          <p class="actions">
            <a class="btn" href={p.data.paperUrl} target="_blank" rel="noopener">$ view paper</a>
            <a class="btn btn-ghost" href={p.data.paperUrl} download>$ download</a>
          </p>
        </Terminal>
      ))
    }
  </div>
</Section>

<style>
  .papers { display: grid; gap: 1.5rem; }
  h3 { color: var(--green); font-size: 1.1rem; }
  .abstract { color: var(--text); max-width: 75ch; }
  .actions { display: flex; flex-wrap: wrap; gap: .75rem; margin: 1.25rem 0 0; }
</style>
```

- [ ] **Step 4: Add it to the home page**

In `src/pages/index.astro` import `Research` and render `<Research />` immediately after `<Scribbles />` (before `<Achievements />`).

- [ ] **Step 5: Verify**

Run: `npm run build && npx astro check`
Expected: success, 0 errors.

Run: `grep -c 'crowdfunding-paper.pdf' dist/index.html && grep -c 'Decentralized Transaction System for Detection and Prevention of Fraud in Crowdfunding Platforms' dist/index.html && grep -c '<' src/content/research/crowdfunding-fraud-detection.md`
Expected: first two `1` or more; the last should be `0` unless the abstract legitimately contains `<`.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat: add research section with crowdfunding paper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Blog (MDX, KaTeX, highlighting, listing, pages)

**Files:**
- Create: `src/content/blog/scaled-dot-product-attention.mdx`, `src/content/blog/recurrences-and-the-master-theorem.mdx`, `src/content/blog/bayes-for-engineers.mdx`, `src/content/blog/inside-llms-linkedin.mdx`, `src/components/PostList.astro`, `src/components/sections/Blog.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getBlogPosts()`, `formatDate`, `Article`, `Base`, `Section`, `Terminal`, `blogSchema` (`externalUrl` optional).
- Produces:
  - `PostList.astro` props: `{ posts: CollectionEntry<'blog'>[] }`; external posts (with `data.externalUrl`) link out in a new tab with a `↗` marker and get no detail page.
  - `Blog.astro` (no props), section id `blog`.
  - Routes `/blog/` and `/blog/<id>/` (only for posts without `externalUrl`).

- [ ] **Step 1: Find the LinkedIn post date**

Try to read the publication date of `https://www.linkedin.com/pulse/inside-llms-building-transformers-from-ground-up-gaurav-shinde-4rfvf/` with WebFetch. LinkedIn often blocks this. If the date cannot be found, ask the user for it with AskUserQuestion. Do not guess a date.

- [ ] **Step 2: Write the LinkedIn entry**

`src/content/blog/inside-llms-linkedin.mdx` (replace `YYYY-MM-DD` with the real date from Step 1):

```mdx
---
title: "Inside LLMs: Building Transformers from Ground Up"
description: "A ground-up walkthrough of how transformer language models work."
date: YYYY-MM-DD
tags: [llm, transformers]
draft: false
externalUrl: https://www.linkedin.com/pulse/inside-llms-building-transformers-from-ground-up-gaurav-shinde-4rfvf/
---
```

Confirm no literal `YYYY-MM-DD` remains in the file.

- [ ] **Step 3: Write the three sample posts**

Each starts with a "Sample post" callout. Do not use a bare `<` or `{` outside math and code fences (MDX treats them as JSX/expressions).

`src/content/blog/scaled-dot-product-attention.mdx`:

````mdx
---
title: "Scaled Dot-Product Attention, Step by Step"
description: "Deriving the attention formula and why the 1/√d scaling matters."
date: 2026-03-14
tags: [transformers, math, ml]
draft: false
---

> **Sample post.** Placeholder content that shows math and code rendering. Replace it with your own writing.

Attention scores a query against a set of keys and returns a weighted sum of values:

$$
\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V
$$

Inline math works too: with $d_k = 64$ the scale factor is $1/\sqrt{64} = 0.125$.

## Why scale by the square root of d

If the entries of $q$ and $k$ are independent with zero mean and unit variance, then $q \cdot k = \sum_{i=1}^{d_k} q_i k_i$ has variance $d_k$. Dividing by $\sqrt{d_k}$ restores unit variance and keeps the softmax out of its saturated regime.

```python
import numpy as np

def attention(Q, K, V):
    d_k = Q.shape[-1]
    scores = Q @ K.swapaxes(-1, -2) / np.sqrt(d_k)
    weights = np.exp(scores - scores.max(-1, keepdims=True))
    weights /= weights.sum(-1, keepdims=True)
    return weights @ V
```
````

`src/content/blog/recurrences-and-the-master-theorem.mdx`:

````mdx
---
title: "Recurrences and the Master Theorem"
description: "Solving divide-and-conquer recurrences without unrolling them."
date: 2026-02-22
tags: [algorithms, math]
draft: false
---

> **Sample post.** Placeholder content that shows math and code rendering. Replace it with your own writing.

Divide-and-conquer algorithms usually satisfy a recurrence of the form

$$
T(n) = a\,T\!\left(\frac{n}{b}\right) + f(n)
$$

where $a \ge 1$ subproblems of size $n/b$ are solved and $f(n)$ is the cost of splitting and merging.

## Merge sort

Here $a = 2$, $b = 2$ and $f(n) = \Theta(n)$. Since $n^{\log_b a} = n^{\log_2 2} = n$ matches $f(n)$, the middle case of the master theorem gives

$$
T(n) = \Theta(n \log n).
$$

```python
def merge_sort(xs):
    if len(xs) <= 1:
        return xs
    mid = len(xs) // 2
    left, right = merge_sort(xs[:mid]), merge_sort(xs[mid:])
    out = []
    while left and right:
        out.append(left.pop(0) if left[0] <= right[0] else right.pop(0))
    return out + left + right
```
````

`src/content/blog/bayes-for-engineers.mdx`:

````mdx
---
title: "Bayes' Rule for Engineers"
description: "A practical look at updating beliefs, with a spam-filter example."
date: 2026-01-30
tags: [probability, math]
draft: false
---

> **Sample post.** Placeholder content that shows math and code rendering. Replace it with your own writing.

Bayes' rule tells you how to update a belief after seeing evidence:

$$
P(H \mid E) = \frac{P(E \mid H)\,P(H)}{P(E)}
$$

Suppose $P(\text{spam}) = 0.3$, and the word "winner" appears in $60\%$ of spam and $2\%$ of legitimate mail. Then

$$
P(\text{spam} \mid \text{winner}) = \frac{0.6 \cdot 0.3}{0.6 \cdot 0.3 + 0.02 \cdot 0.7} \approx 0.93.
$$

```python
def posterior(prior, p_e_given_h, p_e_given_not_h):
    num = p_e_given_h * prior
    return num / (num + p_e_given_not_h * (1 - prior))

print(round(posterior(0.3, 0.6, 0.02), 2))  # 0.93
```
````

- [ ] **Step 4: Write PostList and the Blog section**

`src/components/PostList.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import { formatDate } from '../lib/format';

interface Props {
  posts: CollectionEntry<'blog'>[];
}
const { posts } = Astro.props;
---

<ul class="posts">
  {
    posts.map((p) => {
      const external = p.data.externalUrl;
      return (
        <li class="post">
          <span class="date">{formatDate(p.data.date)}</span>
          <div class="main">
            <a class="name" href={external ?? `/blog/${p.id}/`} target={external ? '_blank' : undefined} rel={external ? 'noopener' : undefined}>
              {p.data.title}{external && ' ↗'}
            </a>
            <p class="desc">{p.data.description}</p>
            {p.data.tags.length > 0 && <ul class="tags">{p.data.tags.map((t) => <li>#{t}</li>)}</ul>}
          </div>
        </li>
      );
    })
  }
</ul>

<style>
  .posts { list-style: none; }
  .post { display: grid; gap: .15rem 2ch; padding: .9rem 0; border-bottom: 1px dashed var(--border); }
  .post:last-child { border-bottom: 0; }
  .date { color: var(--gray); font-size: .85rem; }
  .name { font-weight: 700; }
  .desc { margin: .15rem 0 .35rem; color: var(--gray); font-size: .9rem; }
  @media (min-width: 768px) { .post { grid-template-columns: 11ch 1fr; } }
</style>
```

`src/components/sections/Blog.astro`:

```astro
---
import Section from '../Section.astro';
import Terminal from '../Terminal.astro';
import PostList from '../PostList.astro';
import { getBlogPosts } from '../../lib/collections';

const posts = await getBlogPosts();
---

<Section id="blog" command="ls blog/">
  <Terminal title="~/blog">
    <PostList posts={posts} />
  </Terminal>
  <p class="all"><a href="/blog/">$ ls blog/ --all</a></p>
</Section>

<style>
  .all { margin: 1rem 0 0; }
</style>
```

- [ ] **Step 5: Write the blog pages**

`src/pages/blog/index.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Terminal from '../../components/Terminal.astro';
import PostList from '../../components/PostList.astro';
import { getBlogPosts } from '../../lib/collections';

const posts = await getBlogPosts();
---

<Base title="Blog" description="Writing on machine learning, algorithms, and systems.">
  <div class="container" style="padding-block: 2rem 3rem;">
    <p class="cmd"><a href="/#intro"><span class="ps1">$</span>cd ..</a></p>
    <h1 class="cmd"><span class="ps1">$</span>ls blog/</h1>
    <Terminal title="~/blog">
      <PostList posts={posts} />
    </Terminal>
  </div>
</Base>
```

`src/pages/blog/[slug].astro`:

```astro
---
import 'katex/dist/katex.min.css';
import { render } from 'astro:content';
import Article from '../../layouts/Article.astro';
import { getBlogPosts } from '../../lib/collections';

export async function getStaticPaths() {
  const posts = await getBlogPosts();
  return posts
    .filter((p) => !p.data.externalUrl)
    .map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { data } = entry;
---

<Article title={data.title} description={data.description} date={data.date} tags={data.tags} backHref="/#blog" backLabel="blog">
  <Content />
</Article>
```

- [ ] **Step 6: Add the section to the home page**

In `src/pages/index.astro` import `Blog` and render `<Blog />` immediately after `<Achievements />`.

- [ ] **Step 7: Verify math, highlighting, and the external entry**

Run: `npm run build && npx astro check`
Expected: success, 0 errors; the build lists `/blog/`, `/blog/scaled-dot-product-attention/`, `/blog/recurrences-and-the-master-theorem/`, `/blog/bayes-for-engineers/` and **no** page for `inside-llms-linkedin`.

Run: `grep -c 'class="katex' dist/blog/scaled-dot-product-attention/index.html`
Expected: `1` or more. **If this is `0`,** KaTeX is not being applied by the MDX pipeline: check the build output for MDX errors first. If the plugins are silently ignored, pass them to the MDX integration directly (`mdx({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] })` in `astro.config.mjs`), rebuild, and re-run this check. If MDX errors mention `{` or `<` in math, convert the affected sample posts from `.mdx` to `.md` (the glob loader already accepts both) and note it in the report.

Run: `grep -c 'astro-code' dist/blog/scaled-dot-product-attention/index.html`
Expected: `1` or more.

Run: `grep -o 'inside-llms-building-transformers-from-ground-up-gaurav-shinde-4rfvf' dist/index.html | head -1 && grep -c 'target="_blank"' dist/blog/index.html`
Expected: the slug prints; the count is `1` or more.

Confirm katex CSS is on blog pages only: `grep -c 'katex' dist/index.html` should print `0` for stylesheet links (a `class="katex"` match cannot appear on the home page).

- [ ] **Step 8: Commit**

```bash
git add src astro.config.mjs
git commit -m "feat: add blog with MDX, KaTeX math, and syntax highlighting

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Contact section

**Files:**
- Create: `src/lib/mailto.ts`, `src/lib/mailto.test.ts`, `src/scripts/contact.ts`, `src/components/sections/Contact.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `SITE.email`, `Section`, `Terminal`, `SocialLinks`.
- Produces: `buildMailto(to: string, subject: string, body: string): string`; `Contact.astro` (no props), section id `contact`, form id `contact-form`.

- [ ] **Step 1: Write the failing test**

`src/lib/mailto.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildMailto } from './mailto';

describe('buildMailto', () => {
  const to = 'gauravshinde1816@gmail.com';

  it('returns a bare mailto when subject and body are empty', () => {
    expect(buildMailto(to, '', '')).toBe(`mailto:${to}`);
  });

  it('encodes spaces as %20, not +', () => {
    expect(buildMailto(to, 'Hello there', 'hi')).toBe(`mailto:${to}?subject=Hello%20there&body=hi`);
  });

  it('encodes newlines and reserved characters', () => {
    const url = buildMailto(to, 'a&b', 'line1\nline2 = ok?');
    expect(url).toContain('subject=a%26b');
    expect(url).toContain('body=line1%0Aline2%20%3D%20ok%3F');
  });

  it('omits an empty subject but keeps the body', () => {
    expect(buildMailto(to, '', 'x')).toBe(`mailto:${to}?body=x`);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/mailto.test.ts`
Expected: FAIL (cannot resolve `./mailto`).

- [ ] **Step 3: Implement**

`src/lib/mailto.ts`:

```ts
export function buildMailto(to: string, subject: string, body: string): string {
  const query: string[] = [];
  if (subject) query.push(`subject=${encodeURIComponent(subject)}`);
  if (body) query.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${to}${query.length ? `?${query.join('&')}` : ''}`;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/mailto.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the contact script and section**

`src/scripts/contact.ts`:

```ts
import { buildMailto } from '../lib/mailto';

const form = document.getElementById('contact-form') as HTMLFormElement | null;
const status = document.getElementById('contact-status');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const subject = String(data.get('subject') ?? '').trim();
  const body = String(data.get('body') ?? '').trim();

  if (!body) {
    if (status) status.textContent = 'error: message is empty';
    form.querySelector<HTMLTextAreaElement>('textarea')?.focus();
    return;
  }

  if (status) status.textContent = 'opening your mail client...';
  window.location.href = buildMailto(form.dataset.to ?? '', subject, body);
});
```

`src/components/sections/Contact.astro`:

```astro
---
import Section from '../Section.astro';
import Terminal from '../Terminal.astro';
import SocialLinks from '../SocialLinks.astro';
import { SITE, LINKS } from '../../config';
---

<Section id="contact" command={`mail -s 'Hello' ${SITE.email}`}>
  <Terminal title="mail">
    <!-- Works without JS as a GET form to mailto:; contact.ts upgrades it with correct encoding. -->
    <form id="contact-form" class="mail" action={LINKS.email} method="get" data-to={SITE.email}>
      <p class="row"><span class="label">to:</span> <span class="fixed">{SITE.email}</span></p>
      <div class="row">
        <label class="label" for="subject">subject:</label>
        <input id="subject" name="subject" type="text" value="Hello" autocomplete="off" />
      </div>
      <div class="col">
        <label class="label" for="body">message:</label>
        <textarea id="body" name="body" rows="6" required></textarea>
      </div>
      <div class="actions">
        <button class="btn" type="submit">$ send</button>
        <span id="contact-status" role="status" aria-live="polite"></span>
      </div>
    </form>
  </Terminal>

  <p class="fallback">
    or write directly: <a href={LINKS.email}>{SITE.email}</a>
  </p>
  <SocialLinks />
</Section>

<script>
  import '../../scripts/contact.ts';
</script>

<style>
  .mail { display: grid; gap: .9rem; }
  .row { display: flex; flex-wrap: wrap; align-items: baseline; gap: .25rem 1.5ch; margin: 0; }
  .col { display: grid; gap: .35rem; }
  .label { color: var(--green); min-width: 9ch; }
  .fixed { color: var(--amber); }
  input, textarea { flex: 1 1 16ch; width: 100%; background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px; padding: .6rem .75rem; font: inherit; }
  input:focus, textarea:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 2px rgba(0, 255, 65, .2); }
  textarea { resize: vertical; min-height: 8rem; }
  .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; }
  #contact-status { color: var(--amber); font-size: .85rem; }
  .fallback { margin: 1.25rem 0 1rem; color: var(--gray); font-size: .9rem; }
</style>
```

- [ ] **Step 6: Add it to the home page**

In `src/pages/index.astro` import `Contact` and render `<Contact />` last, after `<Blog />`. The final `<Base>` body order must now be: `Boot` (slot), `Intro`, `Experience`, `Education`, `Scribbles`, `Research`, `Achievements`, `Blog`, `Contact`.

- [ ] **Step 7: Verify**

Run: `npm run build && npx astro check && npx vitest run`
Expected: build succeeds, 0 check errors, all tests pass.

Run: `grep -c 'id="contact-form"' dist/index.html && grep -c 'mailto:gauravshinde1816@gmail.com' dist/index.html`
Expected: both `1` or more.

In the dev server, fill the form, submit, and confirm the browser is asked to open a mail client with the right recipient, `Hello` subject, and the message with spaces intact; submit with an empty message and confirm `error: message is empty` appears and the textarea gets focus.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat: add terminal-style contact form using mailto

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 12: Final verification and documentation

**Files:**
- Modify: `CLAUDE.md`, `AGENTS.md`
- Fix-forward: any file where verification finds a problem

**Interfaces:**
- Consumes: everything above.
- Produces: a verified production build and updated project docs.

- [ ] **Step 1: Full automated check**

Run: `npm run verify:assets && npx vitest run && npx astro check && npm run build`
Expected: all four exit 0; `astro check` reports 0 errors and 0 warnings that are attributable to this project's code.

- [ ] **Step 2: Static-output audit**

Run each and check the expectation:

```bash
# sitemap includes home + detail pages
grep -o '<loc>[^<]*</loc>' dist/sitemap-0.xml
# every external link opens safely
grep -o '<a [^>]*target="_blank"[^>]*>' dist/index.html | grep -vc 'rel="noopener"'
# no leftover template text
grep -rIl 'Astro Starter\|<title>Astro</title>\|TODO\|YYYY-MM-DD\|lorem' dist src docs/superpowers/specs || true
# drafts absent
grep -rl 'draft: true' src/content || true
```

Expected: sitemap lists `/`, `/blog/`, `/scribbles/`, three `/blog/<slug>/` and three `/scribbles/<slug>/` URLs on `https://gauravshinde.example`; the `noopener` audit prints `0`; the leftover-text and draft greps print nothing.

- [ ] **Step 3: Browser verification at desktop and mobile widths**

Start the server with `astro dev --background`. Use the `run` skill or the browser tools. At **1280px** and **375px** wide, on `/`:

1. Boot plays once, skip works, reload does not replay.
2. Name types; blinking cursor visible; photo is circular with green glow, on the right at 1280px and stacked below the text at 375px.
3. Each nav tab scrolls to its section with the sticky nav not covering the heading; the active tab highlights; at 375px the hamburger opens and closes, and closes after choosing a tab; `$ download resume` is visible in the bar at both widths.
4. Run in the page console: `document.documentElement.scrollWidth <= window.innerWidth` and expect `true` at 375px (no page-level horizontal scroll), on `/`, `/scribbles/url-shortener/`, and `/blog/scaled-dot-product-attention/`.
5. All document links open a new tab: resume, admission letter, paper (view), LinkedIn blog post; the paper PDF actually renders and the resume downloads.
6. `/blog/scaled-dot-product-attention/`: math renders (not raw `$...$`), code is highlighted, math does not overflow the viewport at 375px.
7. Contact form behaves as in Task 11; footer icons link to the correct GitHub, LinkedIn, LeetCode, and email.
8. Console shows no errors or failed requests other than the Google Fonts request if offline.
9. Emulate reduced motion, and separately disable JavaScript: all content is visible, no overlay, nothing hidden.

Fix anything found, re-run Step 1, and commit fixes with a message describing them. Stop the server with `astro dev stop`.

- [ ] **Step 4: Update project docs**

Rewrite `CLAUDE.md` (keep the required header and the existing dev-server and documentation sections) so it accurately reflects the built project, and copy the dev-server and documentation sections unchanged into `AGENTS.md` as before. The "Project state" section must now say the site is built, and the Commands section must add `npm test` (Vitest), `npx vitest run <file>` for a single test file, `npm run check`, `npm run verify:assets`, and `npm run brand`. Add an Architecture section covering only what needs several files to understand:

- Data sources: `src/data/resume.ts` (typed resume data, sole source for experience/education/skills/achievements/about) and three content collections (`scribbles`, `research`, `blog`) whose schemas live in `src/lib/schemas.ts` (unit tested) and are wired in `src/content.config.ts`.
- Home page is composed in `src/pages/index.astro` from `src/components/sections/*`; section order and the `NAV` list in `src/config.ts` must stay in sync; detail pages for Scribbles and Blog use `src/layouts/Article.astro`.
- Progressive enhancement: content is complete HTML; `src/scripts/*` only enhance (boot overlay gated by an inline script in `Boot.astro` that sets `data-boot="pending"`; `typed.ts` only retypes when a boot is playing).
- Astro 7 specifics: `z` from `astro/zod`; Markdown/MDX plugins go through `markdown.processor: unified({...})` in `astro.config.mjs` (KaTeX = `remark-math` + `rehype-katex`); `trailingSlash: 'always'`, so internal links need trailing slashes.
- `SITE_URL` in `src/config.ts` is a placeholder (`https://gauravshinde.example`) to replace at deployment; it feeds canonical URLs, OG tags, sitemap, and `robots.txt`.
- Sample content (3 scribbles, 3 blog posts) is marked "Sample" in the body and should be replaced.
- `npm run brand` regenerates `public/og.png` and `public/favicon.ico` from `photo.jpg` and `resume.ts`.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md AGENTS.md
git commit -m "docs: update CLAUDE.md and AGENTS.md for the built portfolio

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Report to the user**

Report plainly: what was built; the verification commands run and their actual results; anything skipped or not verified (for example the LinkedIn post date if the user supplied it, or Google Fonts if verified offline); the deviations from the spec (nav collapses below 900px rather than 768px because eight tabs plus the download button do not fit at 768px; blog posts converted to `.md` only if that fallback was used); the placeholder `SITE_URL` and the sample content the user needs to replace.
