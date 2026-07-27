import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ARTICLE_SELECT,
  DEFAULT_AUTHOR_NAME,
  LEGACY_ARTICLE_SELECT,
  bodyParagraphs,
  createSlug,
  needsAuthorNameMigration,
  withAuthorFallback,
} from '../../lib/articles.js';
import { getThumbnailUrl, readableError, removeThumbnailIfUnreferenced, supabase } from '../../lib/supabase.js';

const emptyArticle = { title: '', author_name: '', excerpt: '', body: '', slug: '', status: 'draft', thumbnail_path: null };
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function StaffArticleEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const authorInputRef = useRef(null);
  const [article, setArticle] = useState(emptyArticle);
  const [initialThumbnail, setInitialThumbnail] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [authorError, setAuthorError] = useState('');
  const [state, setState] = useState({ loading: Boolean(id), pending: false, error: '', success: '', missing: false });

  useEffect(() => {
    if (!id) return;
    let active = true;
    async function loadArticle(select) {
      return supabase.from('articles').select(select).eq('id', id).maybeSingle();
    }
    async function load() {
      let response = await loadArticle(ARTICLE_SELECT);
      if (needsAuthorNameMigration(response.error)) {
        response = await loadArticle(LEGACY_ARTICLE_SELECT);
      }
      if (!active) return;
      if (response.error) setState((value) => ({ ...value, loading: false, error: readableError(response.error) }));
      else if (!response.data) setState((value) => ({ ...value, loading: false, missing: true }));
      else {
        const data = withAuthorFallback(response.data);
        setArticle({ ...data, author_name: data.author_name?.trim() || DEFAULT_AUTHOR_NAME });
        setInitialThumbnail(data.thumbnail_path);
        setPreview(await getThumbnailUrl(data.thumbnail_path) || '');
        setState((value) => ({ ...value, loading: false }));
      }
    }
    load();
    return () => { active = false; };
  }, [id]);

  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);
  if (state.missing) return <Navigate to="/staff/articles" replace />;
  if (state.loading) return <div className="min-h-[45vh] px-4 py-16 text-center text-ink-200/80" role="status">Loading article…</div>;

  function chooseFile(event) {
    const file = event.target.files?.[0];
    setState((value) => ({ ...value, error: '', success: '' }));
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setState((value) => ({ ...value, error: 'Choose a JPG, PNG, WebP, or GIF image.' }));
      event.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setState((value) => ({ ...value, error: 'The thumbnail must be 5 MB or smaller.' }));
      event.target.value = '';
      return;
    }
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setNewFile(file);
    setRemoveThumbnail(false);
    setPreview(URL.createObjectURL(file));
  }

  function clearThumbnail() {
    if (!preview || !window.confirm('Remove this thumbnail when the article is next saved?')) return;
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setNewFile(null);
    setPreview('');
    setRemoveThumbnail(Boolean(initialThumbnail));
    if (inputRef.current) inputRef.current.value = '';
  }

  async function save(targetStatus) {
    if (state.pending) return;
    const title = article.title.trim();
    const authorName = article.author_name.trim();
    const body = article.body.trim();
    if (!authorName) {
      setAuthorError('Enter the author name that readers should see.');
      setState((value) => ({ ...value, error: 'Please add an author name before saving.', success: '' }));
      authorInputRef.current?.focus();
      return;
    }
    setAuthorError('');
    if (!title || !body) {
      setState((value) => ({ ...value, error: 'Add a title and article text before saving.', success: '' }));
      return;
    }
    setState((value) => ({ ...value, pending: true, error: '', success: '' }));
    let uploadedPath = null;
    if (newFile) {
      const extension = newFile.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from('article-thumbnails').upload(uploadedPath, newFile, { contentType: newFile.type, upsert: false });
      if (error) {
        setState((value) => ({ ...value, pending: false, error: `Thumbnail upload failed. ${readableError(error)}` }));
        return;
      }
    }

    const now = new Date().toISOString();
    const thumbnailPath = uploadedPath || (removeThumbnail ? null : initialThumbnail);
    const values = {
      title,
      author_name: authorName,
      excerpt: article.excerpt.trim() || null,
      body,
      status: targetStatus,
      thumbnail_path: thumbnailPath,
      published_at: targetStatus === 'published' ? (article.published_at || now) : null,
    };
    let result;
    if (id) result = await supabase.from('articles').update(values).eq('id', id).select(ARTICLE_SELECT).single();
    else result = await supabase.from('articles').insert({ ...values, slug: createSlug(title), author_id: user.id }).select(ARTICLE_SELECT).single();

    if (result.error) {
      if (uploadedPath) await removeThumbnailIfUnreferenced(uploadedPath);
      setState((value) => ({ ...value, pending: false, error: readableError(result.error) }));
      return;
    }
    let thumbnailCleanupError = null;
    if (initialThumbnail && initialThumbnail !== thumbnailPath) {
      const cleanup = await removeThumbnailIfUnreferenced(initialThumbnail);
      thumbnailCleanupError = cleanup.error;
    }
    const wasPublished = article.status === 'published';
    setArticle(result.data);
    setInitialThumbnail(result.data.thumbnail_path);
    setNewFile(null);
    setRemoveThumbnail(false);
    setPreview(await getThumbnailUrl(result.data.thumbnail_path) || '');
    const success = targetStatus === 'published'
      ? (wasPublished ? 'Published article updated.' : 'Article published.')
      : (wasPublished ? 'Article unpublished and saved as a draft.' : 'Draft saved.');
    setState((value) => ({
      ...value,
      pending: false,
      success,
      error: thumbnailCleanupError ? `The article was saved, but the previous thumbnail could not be removed. ${readableError(thumbnailCleanupError)}` : '',
    }));
    if (!id) navigate(`/staff/articles/${result.data.id}/edit`, { replace: true });
  }

  async function unpublish() {
    await save('draft');
  }

  return (
    <>
      <Seo title={id ? 'Edit Article' : 'New Article'} />
      <div className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link to="/staff/articles" className="text-sm font-semibold text-maroon-900 hover:underline">← Back to articles</Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <form onSubmit={(event) => { event.preventDefault(); save(article.status === 'published' ? 'published' : 'draft'); }} className="rounded-3xl border border-navy-900/15 bg-white/45 p-6 shadow-soft sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon-900">Staff editor</p>
              <h1 className="mt-3 font-serif text-3xl text-ink-100">{id ? 'Edit article' : 'New article'}</h1>
              <label className="mt-7 block"><span className="form-label">Title</span><input className="form-control" maxLength="180" required value={article.title} onChange={(e) => setArticle({ ...article, title: e.target.value })} /></label>
              <label className="mt-5 block">
                <span className="form-label">Author Name</span>
                <input
                  ref={authorInputRef}
                  className="form-control"
                  maxLength="120"
                  required
                  value={article.author_name}
                  aria-invalid={Boolean(authorError)}
                  aria-describedby={authorError ? 'author-name-error' : 'author-name-help'}
                  onChange={(event) => {
                    setArticle({ ...article, author_name: event.target.value });
                    if (authorError) setAuthorError('');
                  }}
                />
                <span id="author-name-help" className="mt-2 block text-xs text-ink-200/70">This name appears publicly in the article byline.</span>
                {authorError ? <span id="author-name-error" className="mt-2 block text-sm text-red-700" role="alert">{authorError}</span> : null}
              </label>
              <label className="mt-5 block"><span className="form-label">Short Summary <span className="font-normal normal-case tracking-normal text-ink-200/70">(optional)</span></span><textarea className="form-control" rows="3" maxLength="500" value={article.excerpt || ''} onChange={(e) => setArticle({ ...article, excerpt: e.target.value })} /></label>
              <label className="mt-5 block"><span className="form-label">Article</span><textarea className="form-control min-h-[320px]" required value={article.body} onChange={(e) => setArticle({ ...article, body: e.target.value })} placeholder="Separate paragraphs with a blank line." /></label>
              <fieldset className="mt-6 rounded-2xl border border-navy-900/15 p-5">
                <legend className="px-2 text-sm font-semibold text-ink-100">Thumbnail <span className="font-normal text-ink-200/70">(optional)</span></legend>
                <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" onChange={chooseFile} className="mt-2 block w-full text-sm text-ink-200/80 file:mr-4 file:rounded-xl file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:font-semibold file:text-white" />
                <p className="mt-2 text-xs text-ink-200/70">JPG, PNG, WebP, or GIF; maximum 5 MB.</p>
                {preview ? <div className="mt-4"><img src={preview} alt="Thumbnail preview" className="aspect-[16/9] w-full rounded-xl border border-navy-900/15 object-cover" /><button type="button" onClick={clearThumbnail} className="danger-button mt-3">Remove Thumbnail</button></div> : null}
              </fieldset>
              {state.error ? <p className="mt-5 text-sm text-red-700" role="alert">{state.error}</p> : null}
              {state.success ? <p className="mt-5 text-sm font-semibold text-green-800" role="status">{state.success}</p> : null}
              <div className="mt-7 flex flex-wrap gap-3">
                {article.status === 'published' ? (
                  <>
                    <button type="submit" disabled={state.pending} className="primary-button disabled:cursor-not-allowed disabled:opacity-50">{state.pending ? 'Updating…' : 'Update Published Article'}</button>
                    <button type="button" disabled={state.pending} onClick={unpublish} className="secondary-button disabled:cursor-not-allowed disabled:opacity-50">Unpublish</button>
                  </>
                ) : (
                  <>
                    <button type="submit" disabled={state.pending} className="secondary-button disabled:cursor-not-allowed disabled:opacity-50">{state.pending ? 'Saving…' : 'Save Draft'}</button>
                    <button type="button" disabled={state.pending} onClick={() => save('published')} className="primary-button disabled:cursor-not-allowed disabled:opacity-50">{state.pending ? 'Working…' : 'Publish Article'}</button>
                  </>
                )}
              </div>
            </form>
            <aside className="self-start rounded-3xl border border-navy-900/15 bg-white/35 p-6 shadow-soft lg:sticky lg:top-40">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon-900">Formatted preview</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-ink-100">{article.title || 'Your article title'}</h2>
              <p className="mt-3 break-words text-sm text-ink-200/80">By {article.author_name.trim() || 'Author name'}</p>
              {article.excerpt ? <p className="mt-4 text-lg leading-relaxed text-ink-200/80">{article.excerpt}</p> : null}
              {preview ? <img src={preview} alt="" className="mt-5 aspect-[16/9] w-full rounded-xl object-cover" /> : null}
              <div className="mt-6 space-y-5 leading-7 text-ink-200/80">
                {bodyParagraphs(article.body).length ? bodyParagraphs(article.body).map((paragraph, index) => <p className="whitespace-pre-line" key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>) : <p className="italic text-ink-200/60">Your formatted article will appear here.</p>}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
