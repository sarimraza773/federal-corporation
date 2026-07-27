export const DEFAULT_AUTHOR_NAME = 'Rizvi & Rizvi';

export const ARTICLE_SELECT =
  'id, slug, title, author_name, excerpt, body, thumbnail_path, status, author_id, created_at, updated_at, published_at';

export const ARTICLE_CARD_SELECT =
  'id, slug, title, author_name, excerpt, thumbnail_path, published_at';

export const LEGACY_ARTICLE_SELECT =
  'id, slug, title, excerpt, body, thumbnail_path, status, author_id, created_at, updated_at, published_at';

export const LEGACY_ARTICLE_CARD_SELECT =
  'id, slug, title, excerpt, thumbnail_path, published_at';

export function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function displayAuthorName(value) {
  return value?.trim() || DEFAULT_AUTHOR_NAME;
}

export function needsAuthorNameMigration(error) {
  return Boolean(
    error
    && /author_name/i.test(error.message || '')
    && (error.code === '42703' || error.code === 'PGRST204' || /(column|schema cache)/i.test(error.message || '')),
  );
}

export function withAuthorFallback(article) {
  return article ? { ...article, author_name: article.author_name || null } : article;
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
