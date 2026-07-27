export const ARTICLE_SELECT =
  'id, slug, title, excerpt, body, thumbnail_path, status, author_id, created_at, updated_at, published_at';

export function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function createSlug(title) {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) || 'article';
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export function bodyParagraphs(body) {
  return (body || '').split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}
