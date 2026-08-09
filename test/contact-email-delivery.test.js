import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  buildInternalEmail,
  buildVisitorConfirmationEmail,
  deliverStoredInquiryEmails,
  visitorConfirmationEnabled,
} from '../supabase/functions/send-contact-email/email-delivery.js';

const inquiry = {
  name: 'Ayesha & Co',
  email: 'ayesha@example.com',
  message: '<script>alert("x")</script>\nSecond line & more',
};

const config = {
  resendApiKey: 'server-only-test-key',
  toEmail: 'firm@example.com',
  fromEmail: 'Rizvi & Rizvi <inquiries@example.com>',
};

function harness({ enabled = true, outcomes = [true, true] } = {}) {
  const emails = [];
  const notificationStatuses = [];
  const confirmationStatuses = [];
  let attempt = 0;

  return {
    emails,
    notificationStatuses,
    confirmationStatuses,
    run: () => deliverStoredInquiryEmails({
      inquiry,
      inquiryId: 'inquiry-123',
      config,
      confirmationEnabled: enabled,
      sendEmail: async (email) => {
        emails.push(email);
        const outcome = outcomes[attempt++];
        if (outcome instanceof Error) throw outcome;
        return outcome;
      },
      updateNotificationStatus: async (status) => notificationStatuses.push(status),
      updateConfirmationStatus: async (status) => confirmationStatuses.push(status),
      now: () => '2026-08-09T12:00:00.000Z',
      logger: { error() {} },
    }),
  };
}

test('visitor confirmation flag defaults safely to disabled', () => {
  assert.equal(visitorConfirmationEnabled(undefined), false);
  assert.equal(visitorConfirmationEnabled('false'), false);
  assert.equal(visitorConfirmationEnabled('TRUE'), false);
  assert.equal(visitorConfirmationEnabled('invalid'), false);
  assert.equal(visitorConfirmationEnabled(' true '), true);
});

test('confirmation disabled sends only the firm notification and leaves confirmation pending', async () => {
  const state = harness({ enabled: false });
  await state.run();

  assert.equal(state.emails.length, 1);
  assert.deepEqual(state.notificationStatuses, ['sent']);
  assert.deepEqual(state.confirmationStatuses, []);
});

test('confirmation enabled sends both emails with separate stable idempotency keys', async () => {
  const state = harness();
  await state.run();

  assert.equal(state.emails.length, 2);
  assert.equal(state.emails[0].idempotencyKey, 'contact-inquiry-inquiry-123');
  assert.equal(state.emails[1].idempotencyKey, 'contact-inquiry-confirmation-inquiry-123');
  assert.notEqual(state.emails[0].idempotencyKey, state.emails[1].idempotencyKey);
  assert.deepEqual(state.confirmationStatuses, [{ status: 'sent', sentAt: '2026-08-09T12:00:00.000Z' }]);
});

test('firm and visitor Reply-To behavior is correct', () => {
  const firmEmail = buildInternalEmail({
    inquiry,
    inquiryId: 'inquiry-123',
    fromEmail: config.fromEmail,
    toEmail: config.toEmail,
    submitted: '2026-08-09T12:00:00.000Z',
  });
  const visitorEmail = buildVisitorConfirmationEmail({
    inquiry,
    inquiryId: 'inquiry-123',
    fromEmail: config.fromEmail,
    toEmail: config.toEmail,
  });

  assert.equal(firmEmail.payload.from, config.fromEmail);
  assert.equal(firmEmail.payload.reply_to, inquiry.email);
  assert.equal(visitorEmail.payload.from, config.fromEmail);
  assert.deepEqual(visitorEmail.payload.to, [inquiry.email]);
  assert.equal(visitorEmail.payload.reply_to, config.toEmail);
  assert.equal(visitorEmail.payload.subject, 'We’ve received your message — Federal Corporation');
  assert.match(visitorEmail.payload.html, />FEDERAL CORPORATION<\/p>/);
  assert.match(visitorEmail.payload.html, /Thank you for contacting Federal Corporation\./);
  assert.match(visitorEmail.payload.html, /<strong>Federal Corporation<\/strong>/);
  assert.match(visitorEmail.payload.text, /Thank you for contacting Federal Corporation\./);
  assert.match(visitorEmail.payload.text, /Kind regards,\n\nFederal Corporation/);
  assert.doesNotMatch(visitorEmail.payload.html, /Rizvi &amp; Rizvi/);
  assert.doesNotMatch(visitorEmail.payload.text, /Rizvi & Rizvi/);
});

test('visitor message is present as text and HTML-escaped with line breaks preserved', () => {
  const email = buildVisitorConfirmationEmail({
    inquiry,
    inquiryId: 'inquiry-123',
    fromEmail: config.fromEmail,
    toEmail: config.toEmail,
  });

  assert.match(email.payload.text, /Your Message\n\n<script>alert\("x"\)<\/script>\nSecond line & more/);
  assert.doesNotMatch(email.payload.html, /<script>/);
  assert.match(email.payload.html, />Your Message<\/p>/);
  assert.match(email.payload.html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;<br>Second line &amp; more/);
});

test('visitor confirmation delivery failure is tracked without rejecting stored inquiry processing', async () => {
  let inquiryStored = true;
  const state = harness({ outcomes: [true, new Error('resend unavailable')] });

  await assert.doesNotReject(state.run());
  assert.equal(inquiryStored, true);
  assert.deepEqual(state.notificationStatuses, ['sent']);
  assert.deepEqual(state.confirmationStatuses, [{ status: 'failed', sentAt: null }]);
});

test('internal notification failure is independent and visitor confirmation still succeeds', async () => {
  const state = harness({ outcomes: [false, true] });

  await assert.doesNotReject(state.run());
  assert.equal(state.emails.length, 2);
  assert.deepEqual(state.notificationStatuses, ['failed']);
  assert.deepEqual(state.confirmationStatuses, [{ status: 'sent', sentAt: '2026-08-09T12:00:00.000Z' }]);
});

test('both delivery failures preserve the already-stored inquiry and record independent failures', async () => {
  const state = harness({ outcomes: [new Error('firm failed'), new Error('visitor failed')] });

  await assert.doesNotReject(state.run());
  assert.deepEqual(state.notificationStatuses, ['failed']);
  assert.deepEqual(state.confirmationStatuses, [{ status: 'failed', sentAt: null }]);
});

test('the Edge Function stores the inquiry before starting either email delivery', async () => {
  const source = await readFile(
    new URL('../supabase/functions/send-contact-email/index.ts', import.meta.url),
    'utf8',
  );

  assert.ok(source.indexOf("supabaseAdmin.rpc('accept_contact_inquiry'") >= 0);
  assert.ok(source.indexOf('await deliverStoredInquiryEmails({') > source.indexOf("supabaseAdmin.rpc('accept_contact_inquiry'"));
});
