import { createClient } from '@supabase/supabase-js';

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
  return error.message || fallback;
}

export function readableAuthError(error) {
  if (/failed to fetch/i.test(error?.message || '')) {
    return 'Unable to connect. Check your internet connection and try again.';
  }
  return 'Email or password was not accepted.';
}
