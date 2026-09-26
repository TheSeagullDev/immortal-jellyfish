-- Favorite dining hall on profiles.

alter table public.profiles
  add column if not exists favorite_hall_id uuid references public.dining_halls (id) on delete set null;

create index if not exists profiles_favorite_hall_idx on public.profiles (favorite_hall_id);
