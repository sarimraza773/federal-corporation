import React from 'react';
import { displayAuthorName, formatDate } from '../lib/articles.js';

export default function ArticleByline({
  authorName,
  publishedDate,
  publishedAt,
  createdAt,
  className = '',
}) {
  const dateValue = publishedDate || publishedAt?.slice(0, 10) || createdAt?.slice(0, 10) || '';
  const formattedDate = formatDate(dateValue);

  return (
    <p className={`break-words text-sm text-ink-200/80 ${className}`}>
      <span>By {displayAuthorName(authorName)}</span>
      {formattedDate ? (
        <>
          <span className="mx-2" aria-hidden="true">·</span>
          <time dateTime={dateValue}>{formattedDate}</time>
        </>
      ) : null}
    </p>
  );
}
