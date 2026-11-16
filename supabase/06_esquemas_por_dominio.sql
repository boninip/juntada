-- 06: migración a esquemas por dominio (aplicada en el Supabase de DESARROLLO el 13/11/2026).
-- Se ejecuta DESPUÉS de 01..05. Reúne las migraciones 0002, 0003 y 0004 del proyecto Pinto, en ese orden.
-- 01..05 conservan su texto original (referencian public.<tabla>); este archivo las mueve.
-- Reversas: ver 0003_REVERSA.sql y 0004_REVERSA.sql en el Proyecto Pinto (no incluidas acá a propósito).

-- ===== 0002: esquemas de dominio vacíos =====
create schema if not exists core;
create schema if not exists juntada;
create schema if not exists escapada;
create schema if not exists cuentas;
comment on schema core is 'Pinto Core: identidad, grupos generales, invitaciones, vinculos, auditoria';
comment on schema juntada is 'Juntada: eventos';
comment on schema escapada is 'Escapada: viajes';
comment on schema cuentas is 'Cuentas: unica autoridad financiera (reservado, vacio)';

-- ===== 0003: tablas del Core a core =====
alter table public.planazo_profiles set schema core;
alter table public.planazo_groups set schema core;
alter table public.planazo_group_members set schema core;
alter table public.planazo_group_invites set schema core;

CREATE OR REPLACE FUNCTION public.planazo_group_create(p_name text)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
declare v_id uuid; v_user uuid := auth.uid();
begin
 if v_user is null then raise exception 'Iniciá sesión'; end if;
 if length(trim(coalesce(p_name,''))) not between 1 and 120 then raise exception 'Nombre inválido'; end if;
 insert into core.planazo_groups(name,owner_id) values(trim(p_name),v_user) returning id into v_id;
 insert into core.planazo_group_members(group_id,user_id,role) values(v_id,v_user,'owner');
 return v_id;
end $function$;

CREATE OR REPLACE FUNCTION public.planazo_invite_accept(p_token text)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
declare v_inv core.planazo_group_invites%rowtype; v_user uuid := auth.uid();
begin
 if v_user is null then raise exception 'Iniciá sesión para aceptar'; end if;
 if p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invitación inválida'; end if;
 select * into v_inv from core.planazo_group_invites
 where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') for update;
 if not found or v_inv.revoked_at is not null or v_inv.expires_at<=now() or v_inv.uses>=v_inv.max_uses then
  raise exception 'Invitación vencida o inválida';
 end if;
 if not exists(select 1 from core.planazo_group_members where group_id=v_inv.group_id and user_id=v_user) then
  insert into core.planazo_group_members(group_id,user_id,role) values(v_inv.group_id,v_user,'member');
  update core.planazo_group_invites set uses=uses+1 where id=v_inv.id;
 end if;
 return v_inv.group_id;
end $function$;

CREATE OR REPLACE FUNCTION public.planazo_invite_create(p_group_id uuid)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
declare v_token text;
begin
 if auth.uid() is null then raise exception 'Iniciá sesión'; end if;
 if not exists(select 1 from core.planazo_group_members where group_id=p_group_id and user_id=auth.uid() and role='owner') then
  raise exception 'No tenés permiso para invitar';
 end if;
 v_token := encode(extensions.gen_random_bytes(32),'hex');
 insert into core.planazo_group_invites(group_id,token_hash,created_by,expires_at)
 values(p_group_id,encode(extensions.digest(v_token,'sha256'),'hex'),auth.uid(),now()+interval '7 days');
 return v_token;
end $function$;

CREATE OR REPLACE FUNCTION public.planazo_invite_preview(p_token text)
 RETURNS TABLE(group_name text, expires_at timestamp with time zone)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
begin
 if p_token !~ '^[a-f0-9]{64}$' then return; end if;
 return query select g.name,i.expires_at from core.planazo_group_invites i
 join core.planazo_groups g on g.id=i.group_id
 where i.token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
 and i.revoked_at is null and i.expires_at>now() and i.uses<i.max_uses;
end $function$;

-- ===== 0004: tablas de Juntada a juntada =====
alter table public.juntadas set schema juntada;
alter table public.invitaciones set schema juntada;
alter table public.respuestas set schema juntada;
alter table public.juntada_votos set schema juntada;
alter table public.juntada_expense_sync set schema juntada;

do $mig$
declare f record; d text;
begin
 for f in select p.oid from pg_proc p where p.pronamespace='public'::regnamespace and p.proname like 'juntada\_%' loop
  d:=pg_get_functiondef(f.oid);
  d:=regexp_replace(d,'public\.(juntadas|invitaciones|respuestas|juntada_votos|juntada_expense_sync)\y','juntada.\1','g');
  execute d;
 end loop;
end $mig$;
