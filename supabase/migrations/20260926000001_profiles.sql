-- Profiles for name + username collected at signup.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  username text not null unique,
  created_at timestamptz not null default now(),
  constraint profiles_username_length check (
    length(username) between 3 and 20
  )
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
  meta_username text;
  fallback_name text;
  username_value text;
begin
  meta_name := nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '');
  meta_username := nullif(lower(trim(coalesce(new.raw_user_meta_data->>'username', ''))), '');
  fallback_name := split_part(coalesce(new.email, 'user'), '@', 1);

  username_value := coalesce(
    meta_username,
    lower(regexp_replace(fallback_name, '[^a-zA-Z0-9._]', '', 'g'))
  );

  if username_value = '' or length(username_value) < 3 then
    username_value := 'user' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(meta_name, fallback_name),
    username_value
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
