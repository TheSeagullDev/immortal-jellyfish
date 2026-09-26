-- Run in Supabase SQL Editor (or via CLI migration).
-- Hard-blocks signups whose email domain is not @gatech.edu.

create or replace function public.enforce_gatech_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  email_domain text;
begin
  if new.email is null then
    raise exception 'Email is required';
  end if;

  email_domain := lower(split_part(new.email, '@', 2));

  if email_domain is distinct from 'gatech.edu' then
    raise exception 'Only @gatech.edu email addresses are allowed';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_gatech_email_on_signup on auth.users;

create trigger enforce_gatech_email_on_signup
  before insert on auth.users
  for each row
  execute function public.enforce_gatech_email();
