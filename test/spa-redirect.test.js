import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const redirectSource = await readFile(new URL('../public/redirect-to-root.js', import.meta.url), 'utf8');
const restoreSource = await readFile(new URL('../public/restore-redirect.js', import.meta.url), 'utf8');

test('GitHub Pages fallback stores the complete requested URL and redirects to the domain root', () => {
  const stored = new Map();
  let replacement;
  const location = {
    href: 'https://federalcorporation.com.pk/news/article-slug?preview=1#details',
    replace(value) { replacement = value; },
  };

  vm.runInNewContext(redirectSource, {
    location,
    sessionStorage: { setItem: (key, value) => stored.set(key, value) },
  });

  assert.equal(stored.get('redirect'), location.href);
  assert.equal(replacement, '/');
});

test('root deployment restores direct routes with query parameters and hashes', () => {
  const requestedUrl = 'https://federalcorporation.com.pk/news/article-slug?preview=1#details';
  const stored = new Map([['redirect', requestedUrl]]);
  let restoredPath;

  vm.runInNewContext(restoreSource, {
    URL,
    location: { href: 'https://federalcorporation.com.pk/', origin: 'https://federalcorporation.com.pk' },
    history: { replaceState: (_state, _title, value) => { restoredPath = value; } },
    sessionStorage: {
      getItem: (key) => stored.get(key) || null,
      removeItem: (key) => stored.delete(key),
    },
  });

  assert.equal(restoredPath, '/news/article-slug?preview=1#details');
  assert.equal(stored.has('redirect'), false);
});

test('redirect restoration rejects a URL from another origin', () => {
  const stored = new Map([['redirect', 'https://example.com/staff/login?token=secret']]);
  let restoredPath;

  vm.runInNewContext(restoreSource, {
    URL,
    location: { href: 'https://federalcorporation.com.pk/', origin: 'https://federalcorporation.com.pk' },
    history: { replaceState: (_state, _title, value) => { restoredPath = value; } },
    sessionStorage: {
      getItem: (key) => stored.get(key) || null,
      removeItem: (key) => stored.delete(key),
    },
  });

  assert.equal(restoredPath, undefined);
});
