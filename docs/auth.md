# Auth setup

Email + password auth via Supabase. Only `@gatech.edu` addresses can sign up or sign in.

## 1. Env

Copy `.env.example` → `.env` and fill in:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 2. Supabase Auth settings

In the Supabase dashboard:

1. **Authentication → Providers → Email** — enabled
2. **URL configuration**
   - Site URL: the app origin (`http://localhost:5173` or the Vercel URL)
   - Redirect URLs (include query strings via `**`):
     - `http://localhost:5173/auth/callback**`
     - `https://YOUR_PRODUCTION_HOST/auth/callback**`
3. Email templates can keep `{{ .ConfirmationURL }}`. Magic/confirm emails are requested with the implicit flow so the link works from Gmail/Outlook (PKCE links only work in the same browser that asked for the email).
   To skip the hash entirely, use:
   `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type={{ .Type }}`
4. Optional for local demos: turn **off** “Confirm email” so signup signs you in immediately

## 3. Migrations

```bash
npx supabase db push
```

Includes:

- `@gatech.edu` email enforcement on `auth.users`
- `public.profiles` + trigger that copies name/username from signup metadata
- `dining_halls`, `posts`, `likes`, `comments` + RLS
- private Storage bucket `food-images` (upload only under `{user_id}/`)

## 4. App checks

`src/lib/auth/email.js` plus the `/login` and `/signup` form actions reject non-GT emails before calling Auth.
Signup also collects **name** + **username**, stored in `user_metadata` and `public.profiles`.
