import React from 'react';
import { normalizeArticleBody } from '../lib/richText.js';

export default function RichTextContent({ body, className = '' }) {
  if (!body) return null;

  return (
    <div
      className={`article-rich-text ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: normalizeArticleBody(body) }}
    />
  );
}
