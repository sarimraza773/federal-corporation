import test from 'node:test';
import assert from 'node:assert/strict';
import { managingPartners } from '../src/data/team.js';
import { featuredServices, services } from '../src/data/services.js';
import { safeStaffRedirect } from '../src/lib/navigation.js';
import { thumbnailExtension } from '../src/lib/uploads.js';

const REQUIRED_SERVICE_ORDER = ['real-estate-conveyance', 'taxation'];

test('canonical and featured service collections begin with property and taxation', () => {
  assert.deepEqual(services.slice(0, 2).map((service) => service.slug), REQUIRED_SERVICE_ORDER);
  assert.deepEqual(featuredServices.slice(0, 2), REQUIRED_SERVICE_ORDER);
  assert.equal(new Set(services.map((service) => service.slug)).size, services.length);
  const corporateService = services.find((service) => service.slug === 'corporate');
  assert.equal(corporateService.fullTitle, 'Corporate & Commercial');
  assert.equal(corporateService.aboutTitle, 'Corporate and Commercial');
});

test('all three leaders retain the Managing Partner role and approved profile metadata', () => {
  assert.deepEqual(
    managingPartners.map(({ name, role }) => ({ name, role })),
    [
      { name: 'Syed Faiq Raza', role: 'Managing Partner' },
      { name: 'Syed Wasim Raza', role: 'Managing Partner' },
      { name: 'Syed Atif Raza', role: 'Managing Partner' },
    ],
  );
  assert.deepEqual(managingPartners[0].credentials, ['Founding Partner', 'On sabbatical']);
  assert.deepEqual(managingPartners[1].credentials, ['Founding Partner']);
  assert.equal(managingPartners[0].biography.length, 2);
  assert.equal(managingPartners[1].biography.length, 2);
});

test('thumbnail paths derive safe extensions from the accepted MIME type', () => {
  assert.equal(thumbnailExtension('image/jpeg'), 'jpg');
  assert.equal(thumbnailExtension('image/webp'), 'webp');
  assert.equal(thumbnailExtension('image/svg+xml'), null);
  assert.equal(thumbnailExtension('text/html'), null);
});

test('post-login redirects stay within staff routes', () => {
  assert.equal(safeStaffRedirect('/staff/articles/new'), '/staff/articles/new');
  assert.equal(safeStaffRedirect('https://example.com'), '/staff/articles');
  assert.equal(safeStaffRedirect('//example.com/staff/articles'), '/staff/articles');
  assert.equal(safeStaffRedirect('/team'), '/staff/articles');
});
