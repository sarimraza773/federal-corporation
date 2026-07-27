import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import Section from '../../components/Section.jsx';
import {
  ARTICLE_SELECT,
  LEGACY_ARTICLE_SELECT,
  displayAuthorName,
  formatDate,
  needsAuthorNameMigration,
  withAuthorFallback,
} from '../../lib/articles.js';
import { readableError, removeThumbnailIfUnreferenced, supabase } from '../../lib/supabase.js';

export default function StaffArticles() {
  const [state, setState] = useState({ loading: true, articles: [], error: '' });
  const [deleting, setDeleting] = useState('');

  const load = useCallback(async () => {
    setState((value) => ({ ...value, loading: true, error: '' }));
    const loadArticles = (select) => supabase.from('articles').select(select).order('updated_at', { ascending: false });
    let response = await loadArticles(ARTICLE_SELECT);
    if (needsAuthorNameMigration(response.error)) {
      response = await loadArticles(LEGACY_ARTICLE_SELECT);
    }
    setState({
      loading: false,
      articles: (response.data || []).map(withAuthorFallback),
      error: response.error ? readableError(response.error) : '',
    });
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(article) {
    if (deleting || !window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    setDeleting(article.id);
    setState((value) => ({ ...value, error: '' }));
    const { data: deletedArticle, error } = await supabase
      .from('articles')
      .delete()
      .eq('id', article.id)
      .select('id')
      .maybeSingle();

    if (error || !deletedArticle) {
      setDeleting('');
      setState((value) => ({
        ...value,
        error: error ? readableError(error) : 'The article could not be deleted. Your account may not have permission.',
      }));
      return;
    }

    setState((value) => ({
      ...value,
      articles: value.articles.filter((item) => item.id !== article.id),
    }));

    let cleanupError = null;
    if (article.thumbnail_path) {
      const cleanup = await removeThumbnailIfUnreferenced(article.thumbnail_path);
      cleanupError = cleanup.error;
    }
    setDeleting('');
    if (cleanupError) {
      setState((value) => ({
        ...value,
        error: `“${article.title}” was deleted, but its thumbnail could not be removed. ${readableError(cleanupError)}`,
      }));
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <>
      <Seo title="Staff Articles" />
      <Section eyebrow="Staff" title="News articles">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-200/80">Create, review, and publish website news.</p>
          <div className="flex gap-3">
            <Link to="/staff/articles/new" className="primary-button">New Article</Link>
            <button type="button" onClick={logout} className="secondary-button">Log Out</button>
          </div>
        </div>
        {state.error ? <p className="mt-6 rounded-xl border border-red-700/20 bg-red-50/50 p-4 text-sm text-red-700" role="alert">{state.error}</p> : null}
        {state.loading ? <p className="mt-10 text-center text-ink-200/80" role="status">Loading articles…</p> : null}
        {!state.loading && state.articles.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-navy-900/15 bg-white/40 p-8 text-center shadow-soft">
            <h2 className="font-serif text-2xl text-ink-100">No articles yet</h2>
            <p className="mt-3 text-ink-200/80">Start with a draft. You can publish it when it is ready.</p>
          </div>
        ) : null}
        <div className="mt-8 space-y-4">
          {state.articles.map((article) => (
            <article key={article.id} className="flex flex-col gap-5 rounded-2xl border border-navy-900/15 bg-white/45 p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${article.status === 'published' ? 'bg-navy-900 text-white' : 'bg-maroon-900/10 text-maroon-900'}`}>{article.status}</span>
                <h2 className="mt-3 font-serif text-xl text-ink-100">{article.title}</h2>
                <p className="mt-1 break-words text-sm text-ink-200/80">By {displayAuthorName(article.author_name)}</p>
                <p className="mt-1 text-sm text-ink-200/80">Updated {formatDate(article.updated_at)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/staff/articles/${article.id}/edit`} className="secondary-button">Edit</Link>
                <button disabled={Boolean(deleting)} onClick={() => remove(article)} className="danger-button disabled:cursor-not-allowed disabled:opacity-50">{deleting === article.id ? 'Deleting…' : 'Delete Article'}</button>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
