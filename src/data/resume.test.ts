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
