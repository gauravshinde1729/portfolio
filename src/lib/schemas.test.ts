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
