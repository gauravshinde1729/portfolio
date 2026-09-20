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
