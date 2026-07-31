import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { homepageArticles } from '../lib/articles.js';
import { addThumbnailUrls, getOrderedArticles, supabase } from '../lib/supabase.js';
import NewsCard from './NewsCard.jsx';
import Section from './Section.jsx';

export default function LatestNews() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadHomepageArticles() {
      if (!supabase) return;

      const response = await getOrderedArticles({ publishedOnly: true, cardsOnly: true });
      if (response.error || !active) return;

      const visibleArticles = homepageArticles(response.data);
      const articlesWithThumbnails = await addThumbnailUrls(visibleArticles);
      if (active) setArticles(articlesWithThumbnails);
    }

    loadHomepageArticles();
    return () => { active = false; };
  }, []);

  if (articles.length === 0) return null;

  return (
    <Section title="News" className="pt-2 sm:pt-4">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} headingLevel={3} />
        ))}
        <article className="group h-full min-h-[250px] overflow-hidden rounded-2xl border border-navy-900/15 bg-white/45 shadow-soft backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/55 hover:shadow-[0_18px_44px_rgba(4,30,66,0.18)]">
          <Link
            to="/news"
            className="flex h-full min-h-[250px] flex-col justify-between rounded-2xl p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon-900">News archive</span>
            <span className="font-serif text-3xl leading-tight text-ink-100 transition-colors group-hover:text-maroon-900">
              All Articles
            </span>
            <span className="text-sm font-semibold text-maroon-900">
              View every article <span aria-hidden="true" className="ml-2">→</span>
            </span>
          </Link>
        </article>
      </div>
    </Section>
  );
}
