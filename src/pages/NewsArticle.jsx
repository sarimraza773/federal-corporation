import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ArticleByline from '../components/ArticleByline.jsx';
import Seo from '../components/Seo.jsx';
import {
  ARTICLE_SELECT,
  LEGACY_ARTICLE_SELECT,
  bodyParagraphs,
  needsAuthorNameMigration,
  withAuthorFallback,
} from '../lib/articles.js';
import { getThumbnailUrl, readableError, supabase } from '../lib/supabase.js';

export default function NewsArticle() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, article: null, error: '', missing: false });

  useEffect(() => {
    let active = true;
    if (!supabase) {
      setState({ loading: false, article: null, error: 'News is not connected yet.', missing: false });
      return undefined;
    }
    async function loadArticle(select) {
      return supabase.from('articles').select(select).eq('slug', slug).eq('status', 'published').maybeSingle();
    }

    async function load() {
      let response = await loadArticle(ARTICLE_SELECT);
      if (needsAuthorNameMigration(response.error)) {
        response = await loadArticle(LEGACY_ARTICLE_SELECT);
      }
      const data = withAuthorFallback(response.data);
      const article = data ? { ...data, thumbnail_url: await getThumbnailUrl(data.thumbnail_path) } : null;
      if (active) setState({
        loading: false,
        article,
        error: response.error ? readableError(response.error) : '',
        missing: !response.error && !data,
      });
    }

    load();
    return () => { active = false; };
  }, [slug]);

  if (state.missing) return <Navigate to="/news" replace />;
  if (state.loading) return <div className="min-h-[45vh] px-4 py-16 text-center text-ink-200/80" role="status">Loading article…</div>;
  if (state.error) return <div className="mx-auto min-h-[45vh] max-w-3xl px-4 py-16 text-center text-maroon-900" role="alert">{state.error}</div>;

  const article = state.article;
  const thumbnail = article.thumbnail_url;
  return (
    <>
      <Seo title={article.title} description={article.excerpt || article.body.slice(0, 155)} />
      <article className="px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Link to="/news" className="text-sm font-semibold text-maroon-900 hover:underline">← Back to News</Link>
          <ArticleByline
            authorName={article.author_name}
            publishedDate={article.published_date}
            publishedAt={article.published_at}
            createdAt={article.created_at}
            className="mt-8"
          />
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tightish text-ink-100 sm:text-5xl">{article.title}</h1>
          {article.excerpt ? <p className="mt-5 text-xl leading-relaxed text-ink-200/80">{article.excerpt}</p> : null}
          {thumbnail ? <img src={thumbnail} alt="" className="mt-8 aspect-[16/9] w-full rounded-3xl border border-navy-900/15 object-cover shadow-soft" /> : null}
          <div className="mt-10 space-y-6 text-[1.05rem] leading-8 text-ink-200/80">
            {bodyParagraphs(article.body).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`} className="whitespace-pre-line">{paragraph}</p>)}
          </div>
        </div>
      </article>
    </>
  );
}
