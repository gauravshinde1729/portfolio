export function buildMailto(to: string, subject: string, body: string): string {
  const query: string[] = [];
  if (subject) query.push(`subject=${encodeURIComponent(subject)}`);
  if (body) query.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${to}${query.length ? `?${query.join('&')}` : ''}`;
}
