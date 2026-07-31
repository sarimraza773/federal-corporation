import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_AUTHOR_NAME,
  articleDate,
  createSlug,
  displayAuthorName,
  formatDate,
  homepageArticles,
  moveArticleInList,
  needsAuthorNameMigration,
  todayDateValue,
  withAuthorFallback,
  withoutAuthorName,
} from '../src/lib/articles.js';

test('displayAuthorName trims a supplied byline', () => {
  assert.equal(displayAuthorName('  Syed Faiq Raza Rizvi  '), 'Syed Faiq Raza Rizvi');
});

test('displayAuthorName uses the restrained legacy fallback', () => {
  assert.equal(displayAuthorName(null), DEFAULT_AUTHOR_NAME);
  assert.equal(displayAuthorName('   '), DEFAULT_AUTHOR_NAME);
});

test('formatDate uses the public day-month-year format', () => {
  assert.equal(formatDate('2026-07-27T12:00:00.000Z'), '27 July 2026');
  assert.equal(formatDate('2026-07-31'), '31 July 2026');
  assert.equal(formatDate('not-a-date'), '');
});

test('date-only helpers preserve the selected calendar date', () => {
  assert.equal(todayDateValue(new Date(2026, 6, 31, 23, 59)), '2026-07-31');
  assert.equal(articleDate({ published_date: '2026-07-31', published_at: '2020-01-01T00:00:00Z' }), '2026-07-31');
  assert.equal(articleDate({ published_at: '2026-07-30T23:59:00Z' }), '2026-07-30');
});

test('createSlug creates a stable-shape URL slug for a new article', () => {
  const slug = createSlug('  A New Legal Update  ');
  assert.match(slug, /^a-new-legal-update-[a-f0-9]{8}$/);
});

test('legacy article reads receive the public author fallback', () => {
  assert.deepEqual(withAuthorFallback({ id: 'legacy-row' }), { id: 'legacy-row', author_name: null });
  assert.equal(needsAuthorNameMigration({ code: '42703', message: 'column articles.author_name does not exist' }), true);
  assert.deepEqual(
    withoutAuthorName({ id: 'legacy-row', author_name: 'Name', published_date: '2026-07-31' }),
    { id: 'legacy-row', published_date: '2026-07-31' },
  );
});

test('homepage selection shows at most the first three saved-order articles', () => {
  const articles = ['one', 'two', 'three', 'four'].map((id) => ({ id }));
  assert.deepEqual(homepageArticles([]), []);
  assert.deepEqual(homepageArticles(articles.slice(0, 1)).map(({ id }) => id), ['one']);
  assert.deepEqual(homepageArticles(articles.slice(0, 2)).map(({ id }) => id), ['one', 'two']);
  assert.deepEqual(homepageArticles(articles.slice(0, 3)).map(({ id }) => id), ['one', 'two', 'three']);
  assert.deepEqual(homepageArticles(articles).map(({ id }) => id), ['one', 'two', 'three']);
});

test('moveArticleInList swaps adjacent rows without mutating the saved list', () => {
  const articles = [{ id: 'one' }, { id: 'two' }, { id: 'three' }];
  const reordered = moveArticleInList(articles, 1, -1);
  assert.deepEqual(reordered.map(({ id }) => id), ['two', 'one', 'three']);
  assert.deepEqual(articles.map(({ id }) => id), ['one', 'two', 'three']);
  assert.equal(moveArticleInList(articles, 0, -1), articles);
});
