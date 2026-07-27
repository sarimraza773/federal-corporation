import React from 'react';
import { displayAuthorName, formatDate } from '../lib/articles.js';

export default function ArticleByline({ authorName, publishedAt, className = '' }) {
  const formattedDate = formatDate(publishedAt);

  return (
    <p className={`break-words text-sm text-ink-200/80 ${className}`}>
      <span>By {displayAuthorName(authorName)}</span>
      {formattedDate ? (
        <>
          <span className="mx-2" aria-hidden="true">·</span>
          <time dateTime={publishedAt}>{formattedDate}</time>
        </>
      ) : null}
    </p>
  );
}
