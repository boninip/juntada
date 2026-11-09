-- Juntada · Sincronización de gastos por clave compartida (capability token).
-- Aplicar en Supabase SQL Editor. Quien tenga la clave puede leer y modificar el grupo.
create extension if not exists pgcrypto;
create table if not exists public.juntada_expense_sync (
 id uuid primary key default gen_random_uuid(),
 secret_hash text not null unique,
 revision bigint not null default 0,
 payload jsonb not null default '{"expenses":[],"groups":[],"settlements":[]}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.juntada_expense_sync enable row level security;
revoke all on public.juntada_expense_sync from public, anon, authenticated;

create or replace function public.juntada_gastos_crear(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_key uuid:=gen_random_uuid();v_id uuid;begin
 if jsonb_typeof(p_payload) is distinct from 'object'
 or jsonb_typeof(p_payload->'expenses') is distinct from 'array'
 or jsonb_typeof(p_payload->'groups') is distinct from 'array'
 or jsonb_typeof(p_payload->'settlements') is distinct from 'array'
 or length(p_payload::text)>200000 then raise exception 'Datos inválidos';end if;
 insert into public.juntada_expense_sync(secret_hash,payload)
 values(encode(extensions.digest(v_key::text,'sha256'),'hex'),p_payload) returning id into v_id;
 return jsonb_build_object('id',v_id,'key',v_key,'revision',0);
end;$$;

create or replace function public.juntada_gastos_leer(p_key uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.juntada_expense_sync%rowtype;begin
 select * into v from public.juntada_expense_sync
 where secret_hash=encode(extensions.digest(p_key::text,'sha256'),'hex');
 if not found then raise exception 'Clave de grupo inválida';end if;
 return jsonb_build_object('id',v.id,'revision',v.revision,'payload',v.payload);
end;$$;

create or replace function public.juntada_gastos_guardar(p_key uuid,p_revision bigint,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_revision bigint;begin
 if jsonb_typeof(p_payload) is distinct from 'object'
 or jsonb_typeof(p_payload->'expenses') is distinct from 'array'
 or jsonb_typeof(p_payload->'groups') is distinct from 'array'
 or jsonb_typeof(p_payload->'settlements') is distinct from 'array'
 or length(p_payload::text)>200000 then raise exception 'Datos inválidos';end if;
 update public.juntada_expense_sync
 set payload=p_payload,revision=revision+1,updated_at=now()
 where secret_hash=encode(extensions.digest(p_key::text,'sha256'),'hex') and revision=p_revision
 returning revision into v_revision;
 if v_revision is null then raise exception 'Conflicto: el grupo cambió en otro dispositivo. Actualizá antes de guardar';end if;
 return jsonb_build_object('revision',v_revision);
end;$$;
revoke all on function public.juntada_gastos_crear(jsonb) from public;
revoke all on function public.juntada_gastos_leer(uuid) from public;
revoke all on function public.juntada_gastos_guardar(uuid,bigint,jsonb) from public;
grant execute on function public.juntada_gastos_crear(jsonb) to anon,authenticated;
grant execute on function public.juntada_gastos_leer(uuid) to anon,authenticated;
grant execute on function public.juntada_gastos_guardar(uuid,bigint,jsonb) to anon,authenticated;
