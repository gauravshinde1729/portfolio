export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatYear(d: Date): string {
  return String(d.getUTCFullYear());
}

export function byDateDesc<T extends { data: { date: Date } }>(a: T, b: T): number {
  return b.data.date.valueOf() - a.data.date.valueOf();
}
