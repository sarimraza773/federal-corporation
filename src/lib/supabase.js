import { createClient } from '@supabase/supabase-js';
import {
  ARTICLE_CARD_SELECT,
  ARTICLE_SELECT,
  LEGACY_ARTICLE_CARD_SELECT,
  LEGACY_ARTICLE_SELECT,
  needsAuthorNameMigration,
  withAuthorFallback,
} from './articles.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export async function getThumbnailUrl(path) {
  if (!path || !supabase) return null;
  const { data, error } = await supabase.storage.from('article-thumbnails').createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}

export async function getOrderedArticles({ publishedOnly = false, cardsOnly = false } = {}) {
  if (!supabase) return { data: [], error: null };

  const queryArticles = (select) => {
    let query = supabase
      .from('articles')
      .select(select);

    if (publishedOnly) {
      query = query
        .eq('status', 'published')
        .not('published_at', 'is', null);
    }

    return query
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('published_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false });
  };

  const modernSelect = cardsOnly ? ARTICLE_CARD_SELECT : ARTICLE_SELECT;
  const legacySelect = cardsOnly ? LEGACY_ARTICLE_CARD_SELECT : LEGACY_ARTICLE_SELECT;
  let response = await queryArticles(modernSelect);

  if (needsAuthorNameMigration(response.error)) {
    response = await queryArticles(legacySelect);
  }

  return {
    ...response,
    data: (response.data || []).map(withAuthorFallback),
  };
}

export async function addThumbnailUrls(articles) {
  return Promise.all(articles.map(async (article) => ({
    ...article,
    thumbnail_url: await getThumbnailUrl(article.thumbnail_path),
  })));
}

export async function removeThumbnailIfUnreferenced(path) {
  if (!path || !supabase) return { removed: false, inUse: false, error: null };

  const { data: references, error: referenceError } = await supabase
    .from('articles')
    .select('id')
    .eq('thumbnail_path', path)
    .limit(1);

  if (referenceError) return { removed: false, inUse: false, error: referenceError };
  if (references?.length) return { removed: false, inUse: true, error: null };

  const { error } = await supabase.storage.from('article-thumbnails').remove([path]);
  return { removed: !error, inUse: false, error };
}

export function readableError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (/failed to fetch/i.test(error.message || '')) return 'Unable to connect. Check your internet connection and try again.';
  if (/author_name/i.test(error.message || '') && /(column|schema cache)/i.test(error.message || '')) {
    return 'The author-name database migration must be applied before articles can be saved.';
  }
  if (/(published_date|sort_order|swap_article_order)/i.test(error.message || '')
    && /(column|function|schema cache|could not find)/i.test(error.message || '')) {
    return 'The article date and ordering database migration must be applied before this action can be saved.';
  }
  return error.message || fallback;
}

export function readableAuthError(error) {
  if (/failed to fetch/i.test(error?.message || '')) {
    return 'Unable to connect. Check your internet connection and try again.';
  }
  return 'Email or password was not accepted.';
}
