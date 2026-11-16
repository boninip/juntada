-- Planazo ID / invitaciones v1. Ejecutar manualmente en Supabase SQL Editor.
-- No modifica las tablas ni RPCs de gastos existentes.
create extension if not exists pgcrypto;

create table if not exists public.planazo_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '',
 created_at timestamptz not null default now()
);
create table if not exists public.planazo_groups (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 1 and 120),
 owner_id uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
create table if not exists public.planazo_group_members (
 group_id uuid not null references public.planazo_groups(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'member' check (role in ('owner','member')),
 joined_at timestamptz not null default now(),
 primary key(group_id,user_id)
);
create table if not exists public.planazo_group_invites (
 id uuid primary key default gen_random_uuid(),
 group_id uuid not null references public.planazo_groups(id) on delete cascade,
 token_hash text not null unique,
 created_by uuid not null references auth.users(id),
 expires_at timestamptz not null,
 max_uses integer not null default 20 check(max_uses between 1 and 100),
 uses integer not null default 0 check(uses >= 0),
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists planazo_invites_group_idx on public.planazo_group_invites(group_id);
create index if not exists planazo_members_user_idx on public.planazo_group_members(user_id);

alter table public.planazo_profiles enable row level security;
alter table public.planazo_groups enable row level security;
alter table public.planazo_group_members enable row level security;
alter table public.planazo_group_invites enable row level security;
revoke all on public.planazo_profiles, public.planazo_groups, public.planazo_group_members, public.planazo_group_invites from anon, authenticated;
grant select,insert,update on public.planazo_profiles to authenticated;
grant select on public.planazo_groups, public.planazo_group_members to authenticated;
create policy "profile self select" on public.planazo_profiles for select to authenticated using (user_id=auth.uid());
create policy "profile self insert" on public.planazo_profiles for insert to authenticated with check (user_id=auth.uid());
create policy "profile self update" on public.planazo_profiles for update to authenticated using (user_id=auth.uid()) with check(user_id=auth.uid());
create policy "group member read" on public.planazo_groups for select to authenticated using (
 exists(select 1 from public.planazo_group_members m where m.group_id=id and m.user_id=auth.uid())
);
create policy "member self read" on public.planazo_group_members for select to authenticated using (user_id=auth.uid());

create or replace function public.planazo_group_create(p_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_user uuid := auth.uid();
begin
 if v_user is null then raise exception 'Iniciá sesión'; end if;
 if length(trim(coalesce(p_name,''))) not between 1 and 120 then raise exception 'Nombre inválido'; end if;
 insert into public.planazo_groups(name,owner_id) values(trim(p_name),v_user) returning id into v_id;
 insert into public.planazo_group_members(group_id,user_id,role) values(v_id,v_user,'owner');
 return v_id;
end $$;

create or replace function public.planazo_invite_create(p_group_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v_token text;
begin
 if auth.uid() is null then raise exception 'Iniciá sesión'; end if;
 if not exists(select 1 from public.planazo_group_members where group_id=p_group_id and user_id=auth.uid() and role='owner') then
  raise exception 'No tenés permiso para invitar';
 end if;
 v_token := encode(extensions.gen_random_bytes(32),'hex');
 insert into public.planazo_group_invites(group_id,token_hash,created_by,expires_at)
 values(p_group_id,encode(extensions.digest(v_token,'sha256'),'hex'),auth.uid(),now()+interval '7 days');
 return v_token;
end $$;

create or replace function public.planazo_invite_preview(p_token text)
returns table(group_name text, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
 if p_token !~ '^[a-f0-9]{64}$' then return; end if;
 return query select g.name,i.expires_at from public.planazo_group_invites i
 join public.planazo_groups g on g.id=i.group_id
 where i.token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
 and i.revoked_at is null and i.expires_at>now() and i.uses<i.max_uses;
end $$;

create or replace function public.planazo_invite_accept(p_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_inv public.planazo_group_invites%rowtype; v_user uuid := auth.uid();
begin
 if v_user is null then raise exception 'Iniciá sesión para aceptar'; end if;
 if p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invitación inválida'; end if;
 select * into v_inv from public.planazo_group_invites
 where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') for update;
 if not found or v_inv.revoked_at is not null or v_inv.expires_at<=now() or v_inv.uses>=v_inv.max_uses then
  raise exception 'Invitación vencida o inválida';
 end if;
 if not exists(select 1 from public.planazo_group_members where group_id=v_inv.group_id and user_id=v_user) then
  insert into public.planazo_group_members(group_id,user_id,role) values(v_inv.group_id,v_user,'member');
  update public.planazo_group_invites set uses=uses+1 where id=v_inv.id;
 end if;
 return v_inv.group_id;
end $$;

revoke all on function public.planazo_group_create(text), public.planazo_invite_create(uuid),
 public.planazo_invite_preview(text), public.planazo_invite_accept(text) from public, anon, authenticated;
grant execute on function public.planazo_group_create(text),public.planazo_invite_create(uuid),
 public.planazo_invite_accept(text) to authenticated;
grant execute on function public.planazo_invite_preview(text) to anon, authenticated;
-- Nota: falta integrar Auth en frontend y migrar gastos al esquema por usuario/grupo.
-- El link solo es invitación; nunca inicia sesión ni concede permisos de escritura por sí mismo.
