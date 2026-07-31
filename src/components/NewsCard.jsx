import React from 'react';
import { Link } from 'react-router-dom';
import ArticleByline from './ArticleByline.jsx';

export default function NewsCard({ article, featured = false, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  const href = `/news/${article.slug}`;
  const cardClassName = featured
    ? `group overflow-hidden rounded-2xl border border-navy-900/15 bg-white/40 shadow-soft backdrop-blur-sm transition-all
       hover:-translate-y-1 hover:bg-white/50 hover:shadow-[0_18px_44px_rgba(4,30,66,0.18)]
       ${article.thumbnail_url ? 'md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]' : ''}`
    : 'group h-full overflow-hidden rounded-2xl border border-navy-900/15 bg-white/45 shadow-soft backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/55 hover:shadow-[0_18px_44px_rgba(4,30,66,0.18)]';

  return (
    <article className={cardClassName}>
      {article.thumbnail_url ? (
        <img
          src={article.thumbnail_url}
          alt=""
          className={featured ? 'h-full min-h-[220px] w-full object-cover' : 'aspect-[16/9] w-full object-cover'}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <div className={featured ? 'flex flex-col justify-center p-6 sm:p-8' : 'p-6'}>
        <ArticleByline
          authorName={article.author_name}
          publishedDate={article.published_date}
          publishedAt={article.published_at}
          createdAt={article.created_at}
        />
        <Heading className={`${featured ? 'text-3xl sm:text-4xl' : 'text-2xl'} mt-3 break-words font-serif leading-tight text-ink-100`}>
          <Link
            className="rounded-sm transition-colors hover:text-maroon-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
            to={href}
          >
            {article.title}
          </Link>
        </Heading>
        {article.excerpt ? (
          <p className={`${featured ? 'text-base' : 'text-sm'} mt-4 line-clamp-3 break-words leading-6 text-ink-200/80`}>
            {article.excerpt}
          </p>
        ) : null}
        <Link
          to={href}
          className="mt-5 inline-flex w-fit rounded-sm text-sm font-semibold text-maroon-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
        >
          Read article <span aria-hidden="true" className="ml-2">→</span>
        </Link>
      </div>
    </article>
  );
}
