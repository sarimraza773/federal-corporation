import React, { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard.jsx';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import {
  ARTICLE_CARD_SELECT,
  LEGACY_ARTICLE_CARD_SELECT,
  needsAuthorNameMigration,
  withAuthorFallback,
} from '../lib/articles.js';
import { getThumbnailUrl, isSupabaseConfigured, readableError, supabase } from '../lib/supabase.js';

export default function News() {
  const [state, setState] = useState({ loading: true, articles: [], error: '' });

  useEffect(() => {
    let active = true;
    if (!supabase) {
      setState({ loading: false, articles: [], error: 'News is not connected yet. Please check back soon.' });
      return undefined;
    }
    async function loadArticles(select) {
      return supabase
        .from('articles')
        .select(select)
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false, nullsFirst: false });
    }

    async function load() {
      let response = await loadArticles(ARTICLE_CARD_SELECT);
      if (needsAuthorNameMigration(response.error)) {
        response = await loadArticles(LEGACY_ARTICLE_CARD_SELECT);
      }
      const articles = response.error ? [] : await Promise.all((response.data || []).map(async (item) => {
        const article = withAuthorFallback(item);
        return { ...article, thumbnail_url: await getThumbnailUrl(article.thumbnail_path) };
      }));
      if (active) setState({ loading: false, articles, error: response.error ? readableError(response.error) : '' });
    }

    load();
    return () => { active = false; };
  }, []);

  return (
    <>
      <Seo title="News" description="News, legal updates, and articles from Federalcorporation." />
      <Section eyebrow="Insights" title="News">
        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-ink-200/80">
          Firm news, practical legal updates, and perspectives from our team.
        </p>

        {state.loading ? <p className="mt-12 text-center text-ink-200/80" role="status">Loading news…</p> : null}
        {state.error ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-maroon-900/20 bg-white/40 p-6 text-center text-maroon-900" role="alert">
            {state.error}
            {!isSupabaseConfigured ? <span className="sr-only"> Supabase environment variables are missing.</span> : null}
          </div>
        ) : null}
        {!state.loading && !state.error && state.articles.length === 0 ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-navy-900/15 bg-white/40 p-8 text-center shadow-soft">
            <h2 className="font-serif text-2xl text-ink-100">No articles yet</h2>
            <p className="mt-3 text-ink-200/80">Published updates will appear here.</p>
          </div>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {state.articles.map((article) => <NewsCard key={article.id} article={article} />)}
        </div>
      </Section>
    </>
  );
}
