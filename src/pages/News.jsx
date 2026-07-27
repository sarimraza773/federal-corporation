import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import { ARTICLE_SELECT, formatDate } from '../lib/articles.js';
import { getThumbnailUrl, isSupabaseConfigured, readableError, supabase } from '../lib/supabase.js';

export default function News() {
  const [state, setState] = useState({ loading: true, articles: [], error: '' });

  useEffect(() => {
    let active = true;
    if (!supabase) {
      setState({ loading: false, articles: [], error: 'News is not connected yet. Please check back soon.' });
      return undefined;
    }
    supabase
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(async ({ data, error }) => {
        const articles = error ? [] : await Promise.all((data || []).map(async (article) => ({
          ...article,
          thumbnail_url: await getThumbnailUrl(article.thumbnail_path),
        })));
        if (active) setState({ loading: false, articles, error: error ? readableError(error) : '' });
      });
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
          {state.articles.map((article) => {
            const thumbnail = article.thumbnail_url;
            return (
              <article key={article.id} className="overflow-hidden rounded-2xl border border-navy-900/15 bg-white/45 shadow-soft backdrop-blur-sm">
                {thumbnail ? <img src={thumbnail} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" /> : (
                  <div className="grid aspect-[16/9] place-items-center bg-navy-900/5 font-serif text-lg text-navy-900/55">Federalcorporation</div>
                )}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-maroon-900">{formatDate(article.published_at)}</p>
                  <h2 className="mt-3 font-serif text-2xl leading-tight text-ink-100">
                    <Link className="rounded-sm hover:text-maroon-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900" to={`/news/${article.slug}`}>{article.title}</Link>
                  </h2>
                  {article.excerpt ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink-200/80">{article.excerpt}</p> : null}
                  <Link to={`/news/${article.slug}`} className="mt-5 inline-flex text-sm font-semibold text-maroon-900 hover:underline">Read article <span aria-hidden="true" className="ml-2">→</span></Link>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </>
  );
}
