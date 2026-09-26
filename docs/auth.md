# Auth setup

Email + password auth via Supabase. Only `@gatech.edu` addresses can sign up or sign in.

## 1. Env

Copy `.env.example` → `.env` and fill in:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY` (anon / publishable key)

## 2. Supabase Auth settings

In the Supabase dashboard:

1. **Authentication → Providers → Email** — enabled
2. **URL configuration** — add your site URL and redirect:
   - `http://localhost:5173/auth/callback`
   - production callback when you deploy
3. Optional for local demos: turn **off** “Confirm email” so signup signs you in immediately

## 3. Domain trigger (required)

Run `supabase/migrations/20260926000000_enforce_gatech_email.sql` in the SQL Editor.

This blocks non-`@gatech.edu` users at the database even if someone bypasses the form.

## 4. App checks

`src/lib/auth/email.js` + the `/login` form actions reject non-GT emails before calling Auth.
