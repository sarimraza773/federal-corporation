# News publishing setup

The website remains a React/Vite single-page app hosted at `/federal-corporation/` until the custom domain is connected. Supabase supplies authentication, article data, and private thumbnail storage.

## 1. Create and configure Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run the migrations in filename order:

   - For a new project, run `supabase/migrations/202607270001_news_articles.sql`, `supabase/migrations/202607270002_add_article_author_name.sql`, `supabase/migrations/202607290001_harden_news_authorization.sql`, and `supabase/migrations/202607310001_add_article_dates_and_ordering.sql`.
   - For an existing project where the first migration has already been applied, apply each later migration that has not yet been run, in filename order.

   The second migration safely backfills existing rows with `Rizvi & Rizvi`, then requires every stored `author_name` to contain 1–120 non-whitespace characters. The third migration prevents callers from probing another account through the staff helper, makes `author_id` immutable after creation, restricts thumbnail paths to approved image extensions, prevents in-place replacement of referenced thumbnails, and prevents deletion of any thumbnail still referenced by an article. The fourth migration adds the date-only `published_date` and persistent `sort_order` columns, safely backfills existing articles, adds ordering indexes, assigns new articles to the beginning, and provides the approved-staff-only atomic reorder function.
3. In Authentication, create or invite the first staff user by email. Public self-registration is not used by this website.
4. Copy that user's UUID from Authentication > Users.
5. While signed in to the Supabase dashboard as the project owner, run this once in SQL Editor:

   ```sql
   insert into public.approved_staff (user_id)
   values ('THE-AUTH-USER-UUID')
   on conflict (user_id) do nothing;
   ```

   Repeat for each trusted staff account. An authenticated account that is not in this table cannot read drafts, administer articles, or manage thumbnails.

6. In Authentication > URL Configuration, set:

   - Production Site URL: `https://sarimraza773.github.io/federal-corporation/`
   - Production redirect URL: `https://sarimraza773.github.io/federal-corporation/**`
   - Local redirect URL: `http://localhost:5173/**`

The migration creates the private thumbnail bucket automatically. Images are delivered through short-lived signed URLs only after storage RLS permits access.

## 2. Local configuration

Copy `.env.example` to `.env.local` and replace both placeholders:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Then run:

```bash
npm ci
npm run dev
```

Open `http://localhost:5173/staff/login`. Sign in, choose **New Article**, complete **Title**, **Author Name**, **Article Date**, and **Article**, and select **Save Draft** or **Publish Article**. A thumbnail is optional and may be JPG, PNG, WebP, or GIF up to 5 MB. Existing article slugs remain unchanged during title edits. Use **Move Up** and **Move Down** on the staff article list to persist the shared homepage and News-page order.

## 3. GitHub Pages configuration

In GitHub repository Settings > Secrets and variables > Actions > Variables, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The deployment workflow passes these public browser values to Vite without printing them and keeps `BASE_PATH: /federal-corporation/` until the custom domain is connected. The existing `404.html` redirect/restore scripts preserve direct-route refresh behavior.

The project URL and publishable key are designed for browser use. Security comes from grants, database RLS, and storage policies. Never add a password or Supabase `service_role` key to `.env` Vite variables, source code, documentation, GitHub Pages, or built assets: every `VITE_` value is shipped to visitors.

## Operational notes

- Public visitors can select only published articles. Drafts are protected by database policy, not merely hidden in React.
- Only users present in `approved_staff` can create, edit, publish, unpublish, delete, or manage thumbnails.
- `author_id` remains the immutable authenticated staff-account UUID used for audit identity. `author_name` is the trimmed, human-readable public byline.
- Public and staff article collections use `sort_order` ascending, then `published_date` descending, then `created_at` descending. `published_date` is a PostgreSQL `date`, so the selected calendar day is displayed without timezone shifts.
- The homepage requests the ordered published collection and renders only its first three articles, followed by an **All Articles** card. The full `/news` page renders the complete ordered published collection. The homepage renders no News section when no published article exists or when its optional query fails.
- New rows receive a database-generated UUID and are inserted at the beginning of the saved order. Staff reordering swaps two stored `sort_order` values atomically through an approved-staff-only database function.
- Removing an article thumbnail is confirmed. Replacement uploads are deleted if the article save fails, and the old file is deleted only after the article update succeeds. Article deletion removes the database row first, then removes its former thumbnail only when no other article references that exact storage path.
- The site is client-rendered. Page titles and descriptions update after JavaScript loads, but per-article search indexing and social link previews can be less reliable than with server rendering or prerendering.

## Authorization verification

The migrations preserve these database-enforced rules:

| Session | Published articles and bylines | Drafts | Create/update/delete | Thumbnail management |
| --- | --- | --- | --- | --- |
| Signed out | Allowed | Denied | Denied | Published thumbnails are readable only through signed URLs |
| Authenticated, not approved | Allowed | Denied | Denied | Denied |
| Approved staff | Allowed | Allowed | Allowed | Allowed |

The homepage and `/news` queries also explicitly filter `status = 'published'`; RLS remains the final enforcement layer. Verify these cases against the live Supabase project after applying all migrations, because a local build cannot prove the deployed project's policies or staff allowlist.
