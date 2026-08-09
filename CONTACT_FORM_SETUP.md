# Contact form setup

The static React site calls the public `send-contact-email` Supabase Edge Function. The function validates the request, stores it privately in PostgreSQL, then asks Resend to send the firm notification and, when enabled, a visitor confirmation. A stored inquiry is treated as received even if either email fails; check `notification_status` and `confirmation_status` for delivery results.

## 1. Apply the Supabase SQL

In the Supabase Dashboard, open **SQL Editor**, copy the entire contents of:

```text
supabase/migrations/202608090001_contact_inquiries.sql
```

and run it against the same project already used by the News system. The migration creates `contact_inquiries`, its constraints/indexes, RLS with no browser policies, and the service-role-only `accept_contact_inquiry` rate-limit/insert function. It does not change News or authentication tables.

Then run the separate visitor-confirmation tracking migration:

```text
supabase/migrations/202608090002_add_contact_confirmation_tracking.sql
```

It alters the existing table by adding `confirmation_status` (default `pending`) and `confirmation_sent_at`; it does not recreate the table.

If this repository is fully migration-managed and all earlier migrations are already applied remotely, the alternative is:

```bash
supabase db push
```

Review pending migrations before using `db push`; the SQL Editor method above applies only this contact migration.

## 2. Create Resend configuration

1. Create an account at [Resend](https://resend.com/), then create an API key with sending access.
2. Before the custom domain is ready, use Resend's testing sender (`onboarding@resend.dev`) and set `CONTACT_TO_EMAIL` to the email address belonging to the Resend account. Resend's test mode only delivers to that account address.
3. For production, add a domain you control in **Resend > Domains**. A dedicated sending subdomain is preferable for reputation isolation.
4. Add the exact DNS records Resend displays. These normally include the SPF return-path MX and TXT records plus a DKIM TXT record. Do not invent or copy example values; names, values, region, and priority must match the Resend dashboard. DMARC is optional but recommended after SPF and DKIM verify.
5. Once verified, set `CONTACT_FROM_EMAIL` to a sender at that verified domain, for example `Rizvi & Rizvi Website <website@YOUR_VERIFIED_DOMAIN>`.

The visitor's address is sent as `Reply-To`, not `From`. This protects SPF/DMARC alignment while making the firm's Reply button address the visitor directly.

## 3. Link Supabase and set hosted secrets

Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), then run from the application directory:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set RESEND_API_KEY=YOUR_RESEND_API_KEY
supabase secrets set CONTACT_TO_EMAIL=federalcorporation1@gmail.com
supabase secrets set CONTACT_FROM_EMAIL="Rizvi & Rizvi <inquiries@federalcorporation.com.pk>"
supabase secrets set ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,https://sarimraza773.github.io,https://federalcorporation.com.pk,https://www.federalcorporation.com.pk"
supabase secrets set RATE_LIMIT_SALT=YOUR_RANDOM_SECRET_AT_LEAST_32_BYTES
supabase secrets set ENABLE_VISITOR_CONFIRMATION=true
supabase functions deploy send-contact-email
```

Replace every uppercase placeholder. `ALLOWED_ORIGINS` is a comma-separated list of origins only (scheme + host + optional port), so the production entry has no path or trailing slash.

Generate `RATE_LIMIT_SALT` with a password manager or cryptographically secure random generator. Keep it stable: changing it resets the privacy-preserving client hashes used by the rate limiter.

Supabase automatically provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the hosted Edge Function. Never put the service-role key, Resend key, rate-limit salt, or mail configuration in a `VITE_*` variable.

The committed `supabase/config.toml` sets `verify_jwt = false` because unsigned public visitors must be able to submit. The function itself enforces the origin allowlist, POST-only requests, strict validation, a honeypot, body limits, and database-backed throttling. CORS is a browser boundary, not authentication; scripts can still call a public URL, which is why the other controls are required.

## 4. Local end-to-end testing

Install and start the frontend:

```bash
npm install
npm run dev
```

For a fully local Supabase stack (Docker required), in a second terminal run:

```bash
supabase start
supabase db reset
supabase functions serve send-contact-email --env-file supabase/functions/.env.local
```

Create the ignored file `supabase/functions/.env.local` locally; never commit it:

```dotenv
RESEND_API_KEY=YOUR_TEST_RESEND_KEY
CONTACT_TO_EMAIL=YOUR_RESEND_ACCOUNT_EMAIL
CONTACT_FROM_EMAIL=Rizvi & Rizvi Website <onboarding@resend.dev>
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
RATE_LIMIT_SALT=YOUR_LOCAL_RANDOM_SECRET_AT_LEAST_32_BYTES
ENABLE_VISITOR_CONFIRMATION=true
```

Set the root ignored `.env.local` to the local API URL and publishable/anon key printed by `supabase status`:

```dotenv
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_LOCAL_ANON_OR_PUBLISHABLE_KEY
```

Restart Vite after changing frontend environment variables. If you instead test against the linked hosted project, keep the existing hosted `VITE_SUPABASE_*` values and deploy the function/migration/secrets there first.

### Test checklist

- **Success:** submit valid name/email/message; confirm the inline success text, cleared fields, no navigation, one database row, the firm notification, and (when enabled) the visitor confirmation.
- **Invalid input:** try an invalid email, blank message, one-character name, and message under 10 characters; confirm inline field errors and no network submission.
- **Honeypot:** in browser developer tools set the hidden `companyWebsite` input to a value and submit; the response is intentionally successful but no row/email is created.
- **Rate limit/duplicates:** submit again within 60 seconds, or more than three accepted inquiries within 15 minutes from the same client; confirm a failed UI status and no duplicate row.
- **Resend failure:** temporarily use an invalid test API key or sender, submit once, then restore the secret. Confirm the row exists with failed email status and the visitor still sees success because the inquiry was received.
- **Confirmation flag:** set `ENABLE_VISITOR_CONFIRMATION=false`, redeploy, and submit once. Confirm the firm email is delivered while `confirmation_status` remains `pending`; restore the flag to `true` and redeploy.
- **Database failure:** test only in a disposable/local environment by stopping local Supabase or removing the migration; confirm the visitor sees the generic failure and no success is claimed.
- **CORS:** temporarily use an unlisted frontend origin; confirm the preflight/request is rejected, then restore the allowlist.
- **Mobile/accessibility:** test narrow and wide viewports, keyboard-only navigation, focus/error association, the disabled `Sending...` button, and screen-reader announcement of status.

Inspect stored rows in the Dashboard Table Editor or with SQL (service/admin context only):

```sql
select id, name, email, status, notification_status, confirmation_status, confirmation_sent_at, created_at
from public.contact_inquiries
order by created_at desc;
```

## 5. GitHub Pages

No persistent server and no new GitHub Pages setting are required. The deployed static site calls the hosted Edge Function over HTTPS. Keep the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` available to the existing GitHub Pages build exactly as they are today. Do not add Resend, service-role, contact-email, or rate-limit secrets to the frontend build or any `VITE_*` GitHub secret.

If the current workflow already supplies the two browser-safe Supabase values, no GitHub repository-secret change is needed. Supabase Edge Function secrets are configured only with `supabase secrets set` (or the Supabase Dashboard).

## Spam-protection boundary

The implementation combines a hidden honeypot, strict types/lengths, a 12 KB request cap, an origin allowlist, a 60-second cooldown, and at most three accepted inquiries per 15 minutes for a salted hash of the best client address supplied by the Edge gateway. No raw IP address is stored. Distributed attackers can rotate addresses and headers, so this is a practical baseline rather than a CAPTCHA-grade guarantee. The request shape reserves an optional `turnstileToken` field so Cloudflare Turnstile verification can be added later without changing the core payload.
