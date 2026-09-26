# Auth setup

Email + password auth via Supabase. Only `@gatech.edu` addresses can sign up or sign in.

## 1. Env

Copy `.env.example` → `.env` and fill in:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 2. Supabase Auth settings

In the Supabase dashboard:

1. **Authentication → Providers → Email** — enabled
2. **URL configuration** — add your site URL and redirect:
   - `http://localhost:5173/auth/callback`
   - production callback when you deploy
3. Optional for local demos: turn **off** “Confirm email” so signup signs you in immediately

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
