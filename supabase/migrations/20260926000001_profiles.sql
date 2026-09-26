-- Profiles for display names collected at signup.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles
  for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta_name text;
  fallback_name text;
  username_base text;
begin
  meta_name := nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '');
  fallback_name := split_part(coalesce(new.email, 'user'), '@', 1);
  username_base := lower(regexp_replace(fallback_name, '[^a-zA-Z0-9._-]', '', 'g'));

  if username_base = '' then
    username_base := 'user';
  end if;

  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(meta_name, fallback_name),
    username_base
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
