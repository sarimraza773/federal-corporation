import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_AUTHOR_NAME,
  createSlug,
  displayAuthorName,
  formatDate,
  needsAuthorNameMigration,
  withAuthorFallback,
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
});

test('createSlug creates a stable-shape URL slug for a new article', () => {
  const slug = createSlug('  A New Legal Update  ');
  assert.match(slug, /^a-new-legal-update-[a-f0-9]{8}$/);
});

test('legacy article reads receive the public author fallback', () => {
  assert.deepEqual(withAuthorFallback({ id: 'legacy-row' }), { id: 'legacy-row', author_name: null });
  assert.equal(needsAuthorNameMigration({ code: '42703', message: 'column articles.author_name does not exist' }), true);
});
