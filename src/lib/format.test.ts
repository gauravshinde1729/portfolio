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
