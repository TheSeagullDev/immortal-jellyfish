-- Detected menu items from Nutrislice + Gemini (empty until classified).

alter table public.posts
  add column if not exists foods text[] not null default '{}';
