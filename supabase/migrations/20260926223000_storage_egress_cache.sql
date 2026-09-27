-- Reuse one signed URL per object so repeat views hit Storage's CDN
-- (cached egress) instead of downloading the file again.
create table public.storage_url_cache (
  path text primary key,
  signed_url text not null,
  expires_at timestamptz not null
);

alter table public.storage_url_cache enable row level security;

revoke all on public.storage_url_cache from anon, public;

grant select, insert, update on public.storage_url_cache to authenticated;

create policy "Signed-in users can read cached storage urls"
  on public.storage_url_cache for select
  to authenticated
  using (true);

create policy "Signed-in users can insert cached storage urls"
  on public.storage_url_cache for insert
  to authenticated
  with check (true);

create policy "Signed-in users can update cached storage urls"
  on public.storage_url_cache for update
  to authenticated
  using (true)
  with check (true);

-- Uploads used the Storage default (max-age=3600). A shared signed URL only
-- stays a CDN hit for as long as this header allows.
update storage.objects
set metadata = jsonb_set(
  coalesce(metadata, '{}'::jsonb),
  '{cacheControl}',
  to_jsonb('max-age=604800'::text)
)
where bucket_id = 'food-images';
