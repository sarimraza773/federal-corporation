import test from 'node:test';
import assert from 'node:assert/strict';
import { contactLimits, normalizeContactInput, validateContactInput } from '../src/lib/contact.js';

test('contact input is trimmed and email is normalized', () => {
  assert.deepEqual(
    normalizeContactInput({ name: '  John   Smith ', email: ' JOHN@Example.COM ', message: '  Hello there.\r\n ' }),
    { name: 'John Smith', email: 'john@example.com', message: 'Hello there.' },
  );
});

test('contact validation accepts a sensible inquiry', () => {
  const result = validateContactInput({
    name: 'John Smith',
    email: 'john@example.com',
    message: 'I would like to arrange a consultation.',
  });
  assert.deepEqual(result.errors, {});
});

test('contact validation rejects empty, malformed, short, and oversized values', () => {
  assert.deepEqual(Object.keys(validateContactInput({}).errors), ['name', 'email', 'message']);
  assert.equal(validateContactInput({ name: 'J', email: 'invalid', message: 'short' }).errors.email, 'Please enter a valid email address.');
  assert.ok(validateContactInput({
    name: 'A'.repeat(contactLimits.name.max + 1),
    email: 'john@example.com',
    message: 'M'.repeat(contactLimits.message.max + 1),
  }).errors.message);
});
