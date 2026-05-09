create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,50}$'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_admins (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (workspace_id, user_id)
);

create table if not exists public.workspace_invites (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  accepted_at timestamptz,
  primary key (workspace_id, email)
);

create table if not exists public.workspace_state (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_access_codes (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  code_hash text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_workspace_admin(candidate_workspace uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_admins
    where workspace_id = candidate_workspace
      and user_id = auth.uid()
  );
$$;

create or replace function public.check_workspace_invite(candidate_slug text, candidate_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_invites wi
    join public.workspaces w on w.id = wi.workspace_id
    where w.slug = lower(trim(candidate_slug))
      and lower(wi.email) = lower(trim(candidate_email))
      and wi.accepted_at is null
  );
$$;

create or replace function public.claim_workspace_admin(candidate_slug text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  target_workspace_id uuid;
begin
  if current_user_id is null or current_email = '' then
    return false;
  end if;

  select id
  into target_workspace_id
  from public.workspaces
  where slug = lower(trim(candidate_slug));

  if target_workspace_id is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.workspace_invites
    where workspace_id = target_workspace_id
      and lower(email) = current_email
      and accepted_at is null
  ) then
    return false;
  end if;

  insert into public.workspace_admins (workspace_id, user_id, email, role)
  values (target_workspace_id, current_user_id, current_email, 'admin')
  on conflict (workspace_id, user_id) do update
    set email = excluded.email;

  update public.workspace_invites
  set accepted_at = coalesce(accepted_at, timezone('utc', now()))
  where workspace_id = target_workspace_id
    and lower(email) = current_email;

  return true;
end;
$$;

create or replace function public.create_workspace(
  workspace_name text,
  workspace_slug text,
  initial_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  new_workspace_id uuid;
begin
  if current_user_id is null or current_email = '' then
    raise exception 'not authenticated';
  end if;

  insert into public.workspaces (name, slug, created_by)
  values (
    trim(workspace_name),
    lower(trim(workspace_slug)),
    current_user_id
  )
  returning id into new_workspace_id;

  insert into public.workspace_admins (workspace_id, user_id, email, role)
  values (new_workspace_id, current_user_id, current_email, 'owner');

  insert into public.workspace_state (workspace_id, payload)
  values (new_workspace_id, coalesce(initial_payload, '{}'::jsonb));

  return new_workspace_id;
end;
$$;

create or replace function public.rotate_workspace_access_code(candidate_workspace uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  workspace_slug_value text;
  prefix_value text;
  suffix_value text := '';
  generated_code text;
  random_index integer;
  i integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not public.is_workspace_admin(candidate_workspace) then
    raise exception 'not allowed';
  end if;

  select slug
  into workspace_slug_value
  from public.workspaces
  where id = candidate_workspace;

  if workspace_slug_value is null then
    raise exception 'workspace not found';
  end if;

  prefix_value := upper(substr(regexp_replace(workspace_slug_value, '[^a-z0-9]', '', 'g'), 1, 4));
  prefix_value := rpad(prefix_value, 4, 'X');

  for i in 1..8 loop
    random_index := floor(random() * length(alphabet) + 1);
    suffix_value := suffix_value || substr(alphabet, random_index, 1);
  end loop;

  generated_code := prefix_value || suffix_value;

  insert into public.workspace_access_codes (
    workspace_id,
    code_hash,
    created_by,
    created_at,
    updated_at
  )
  values (
    candidate_workspace,
    crypt(generated_code, gen_salt('bf')),
    auth.uid(),
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (workspace_id) do update
    set code_hash = excluded.code_hash,
        created_by = excluded.created_by,
        updated_at = excluded.updated_at;

  return generated_code;
end;
$$;

create or replace function public.resolve_workspace_access_code(candidate_code text)
returns table (
  workspace_id uuid,
  workspace_name text,
  workspace_slug text,
  payload jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    w.id as workspace_id,
    w.name as workspace_name,
    w.slug as workspace_slug,
    ws.payload
  from public.workspace_access_codes ac
  join public.workspaces w on w.id = ac.workspace_id
  join public.workspace_state ws on ws.workspace_id = w.id
  where ac.code_hash = crypt(
    regexp_replace(upper(trim(candidate_code)), '[^A-Z0-9]', '', 'g'),
    ac.code_hash
  )
  limit 1;
$$;

grant execute on function public.is_workspace_admin(uuid) to authenticated;
grant execute on function public.check_workspace_invite(text, text) to authenticated;
grant execute on function public.claim_workspace_admin(text) to authenticated;
grant execute on function public.create_workspace(text, text, jsonb) to authenticated;
grant execute on function public.rotate_workspace_access_code(uuid) to authenticated;
grant execute on function public.resolve_workspace_access_code(text) to anon, authenticated;

alter table public.workspaces enable row level security;
alter table public.workspace_admins enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.workspace_state enable row level security;
alter table public.workspace_access_codes enable row level security;

drop policy if exists "workspace admins can read workspaces" on public.workspaces;
create policy "workspace admins can read workspaces"
on public.workspaces
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_admins
    where workspace_admins.workspace_id = workspaces.id
      and workspace_admins.user_id = auth.uid()
  )
);

drop policy if exists "workspace admins can read memberships" on public.workspace_admins;
create policy "workspace admins can read memberships"
on public.workspace_admins
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_workspace_admin(workspace_id)
);

drop policy if exists "workspace admins can read invites" on public.workspace_invites;
create policy "workspace admins can read invites"
on public.workspace_invites
for select
to authenticated
using (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace admins can insert invites" on public.workspace_invites;
create policy "workspace admins can insert invites"
on public.workspace_invites
for insert
to authenticated
with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace admins can update invites" on public.workspace_invites;
create policy "workspace admins can update invites"
on public.workspace_invites
for update
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace admins can delete invites" on public.workspace_invites;
create policy "workspace admins can delete invites"
on public.workspace_invites
for delete
to authenticated
using (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace admins can read state" on public.workspace_state;
create policy "workspace admins can read state"
on public.workspace_state
for select
to authenticated
using (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace admins can insert state" on public.workspace_state;
create policy "workspace admins can insert state"
on public.workspace_state
for insert
to authenticated
with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace admins can update state" on public.workspace_state;
create policy "workspace admins can update state"
on public.workspace_state
for update
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace admins manage access codes" on public.workspace_access_codes;
create policy "workspace admins manage access codes"
on public.workspace_access_codes
for all
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));
