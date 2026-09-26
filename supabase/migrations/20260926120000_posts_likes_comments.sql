-- Core social schema: halls, posts, likes, comments + RLS + private storage.

create table public.dining_halls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

insert into public.dining_halls (name, slug)
values
  ('North Ave', 'north-ave'),
  ('Brittain', 'brittain'),
  ('West Village', 'west-village');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  dining_hall_id uuid not null references public.dining_halls (id),
  -- Storage key (`{user_id}/{post_id}.ext`) or static path (`/demo/foo.jpg`)
  image_path text not null,
  caption text not null default '',
  rating int not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_hall_idx on public.posts (dining_hall_id);
create index posts_author_idx on public.posts (author_id);

create table public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comments_body_not_empty check (char_length(trim(body)) > 0)
);

create index comments_post_idx on public.comments (post_id, created_at);

alter table public.dining_halls enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

create policy "Halls are publicly readable"
  on public.dining_halls for select
  using (true);

create policy "Posts are publicly readable"
  on public.posts for select
  using (true);

create policy "Users can insert own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

create policy "Likes are publicly readable"
  on public.likes for select
  using (true);

create policy "Users can insert own likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

create policy "Comments are publicly readable"
  on public.comments for select
  using (true);

create policy "Users can insert own comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

insert into storage.buckets (id, name, public)
values ('food-images', 'food-images', false)
on conflict (id) do nothing;

create policy "Users upload food images to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'food-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own food images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'food-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own food images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'food-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Signed-in users can read food images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'food-images');
