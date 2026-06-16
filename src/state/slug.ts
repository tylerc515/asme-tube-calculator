export function displayName(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.length === 0 ? 'Untitled set' : trimmed;
}

export function slugify(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return 'untitled-set';
  const slug = trimmed
    .replace(/[^a-zA-Z0-9\- ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 60);
  return slug || 'untitled-set';
}
