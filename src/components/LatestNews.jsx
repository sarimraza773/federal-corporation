import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ARTICLE_CARD_SELECT,
  LEGACY_ARTICLE_CARD_SELECT,
  needsAuthorNameMigration,
  withAuthorFallback,
} from '../lib/articles.js';
import { getThumbnailUrl, supabase } from '../lib/supabase.js';
import NewsCard from './NewsCard.jsx';
import Section from './Section.jsx';

export default function LatestNews() {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadLatestArticle() {
      if (!supabase) return;

      const queryLatest = (select) => supabase
        .from('articles')
        .select(select)
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      let response = await queryLatest(ARTICLE_CARD_SELECT);
      if (needsAuthorNameMigration(response.error)) {
        response = await queryLatest(LEGACY_ARTICLE_CARD_SELECT);
      }

      if (response.error) {
        console.error('Unable to load the latest published article.', response.error);
        return;
      }
      if (!active || !response.data) return;

      const data = withAuthorFallback(response.data);
      const thumbnailUrl = await getThumbnailUrl(data.thumbnail_path);
      if (active) setArticle({ ...data, thumbnail_url: thumbnailUrl });
    }

    loadLatestArticle();
    return () => { active = false; };
  }, []);

  if (!article) return null;

  return (
    <Section title="News" className="pt-2 sm:pt-4">
      <div className="mx-auto max-w-5xl">
        <NewsCard article={article} featured headingLevel={3} />
        <div className="mt-5 text-right">
          <Link
            to="/news"
            className="inline-flex rounded-sm text-sm font-semibold text-maroon-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
          >
            View all news <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
