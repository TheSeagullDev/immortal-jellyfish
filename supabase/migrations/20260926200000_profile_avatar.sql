-- Optional profile photo stored in the existing food-images bucket.

alter table public.profiles
  add column if not exists avatar_path text;
