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
