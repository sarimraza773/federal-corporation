export const DEFAULT_AUTHOR_NAME = 'Rizvi & Rizvi';

export const ARTICLE_SELECT =
  'id, slug, title, author_name, excerpt, body, thumbnail_path, status, author_id, created_at, updated_at, published_at, published_date, sort_order';

export const ARTICLE_CARD_SELECT =
  'id, slug, title, author_name, excerpt, thumbnail_path, created_at, published_at, published_date, sort_order';

export const LEGACY_ARTICLE_SELECT =
  'id, slug, title, excerpt, body, thumbnail_path, status, author_id, created_at, updated_at, published_at, published_date, sort_order';

export const LEGACY_ARTICLE_CARD_SELECT =
  'id, slug, title, excerpt, thumbnail_path, created_at, published_at, published_date, sort_order';

export function formatDate(value) {
  if (!value) return '';

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnlyMatch
    ? new Date(Date.UTC(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      ))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function todayDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function articleDate(article) {
  if (!article) return '';
  return article.published_date
    || article.published_at?.slice(0, 10)
    || article.created_at?.slice(0, 10)
    || '';
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

export function withoutAuthorName(article) {
  if (!article) return article;
  const { author_name: _authorName, ...legacyArticle } = article;
  return legacyArticle;
}

export function homepageArticles(articles) {
  return articles.slice(0, 3);
}

export function moveArticleInList(articles, index, direction) {
  const targetIndex = index + direction;
  if (index < 0 || index >= articles.length || targetIndex < 0 || targetIndex >= articles.length) {
    return articles;
  }

  const reordered = [...articles];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  return reordered;
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
