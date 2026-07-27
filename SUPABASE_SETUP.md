# News publishing setup

The website remains a React/Vite single-page app hosted at `/rizvi-rizvi/`. Supabase supplies authentication, article data, and private thumbnail storage.

## 1. Create and configure Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `supabase/migrations/202607270001_news_articles.sql`. The migration is idempotent and creates the tables, indexes, update trigger, private `article-thumbnails` bucket, grants, RLS policies, and storage policies.
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

   - Production Site URL: `https://sarimraza773.github.io/rizvi-rizvi/`
   - Production redirect URL: `https://sarimraza773.github.io/rizvi-rizvi/**`
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

Open `http://localhost:5173/staff/login`. Sign in, choose **New Article**, complete **Title** and **Article**, and select **Save Draft** or **Publish Article**. A thumbnail is optional and may be JPG, PNG, WebP, or GIF up to 5 MB. Existing article slugs remain unchanged during title edits.

## 3. GitHub Pages configuration

In GitHub repository Settings > Secrets and variables > Actions > Variables, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The deployment workflow passes these public browser values to Vite without printing them and keeps `BASE_PATH: /rizvi-rizvi/`. The existing `404.html` redirect/restore scripts preserve direct-route refresh behavior.

The project URL and publishable key are designed for browser use. Security comes from grants, database RLS, and storage policies. Never add a password or Supabase `service_role` key to `.env` Vite variables, source code, documentation, GitHub Pages, or built assets: every `VITE_` value is shipped to visitors.

## Operational notes

- Public visitors can select only published articles. Drafts are protected by database policy, not merely hidden in React.
- Only users present in `approved_staff` can create, edit, publish, unpublish, delete, or manage thumbnails.
- Removing an article thumbnail is confirmed. Replacement uploads are deleted if the article save fails, and the old file is deleted only after the article update succeeds.
- The site is client-rendered. Page titles and descriptions update after JavaScript loads, but per-article search indexing and social link previews can be less reliable than with server rendering or prerendering.
