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

export function readableError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (/failed to fetch/i.test(error.message || '')) return 'Unable to connect. Check your internet connection and try again.';
  return error.message || fallback;
}
