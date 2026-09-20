import { describe, it, expect } from 'vitest';
import { formatDate, formatYear, byDateDesc } from './format';

describe('formatDate', () => {
  it('formats as YYYY-MM-DD in UTC', () => {
    expect(formatDate(new Date('2026-03-14T00:00:00Z'))).toBe('2026-03-14');
  });
});

describe('formatYear', () => {
  it('returns the UTC year at the start of the year', () => {
    expect(formatYear(new Date('2023-01-01T00:00:00Z'))).toBe('2023');
  });
  it('uses UTC at the end of the year', () => {
    expect(formatYear(new Date('2023-12-31T23:59:59Z'))).toBe('2023');
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
