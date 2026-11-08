-- Juntada V1 · API de invitaciones sin login
-- Ejecutar UNA vez en Supabase SQL Editor, después de crear juntadas/respuestas/invitaciones.
-- La clave del organizador es privada; el código de invitación se comparte con invitados.
create extension if not exists pgcrypto;

alter table public.juntadas
  add column if not exists organizer_token_hash text,
  add column if not exists fecha_texto text,
  add column if not exists hora text,
  add column if not exists modalidad_fecha text default 'fixed',
  add column if not exists opciones_fecha jsonb default '[]'::jsonb,
  add column if not exists gastos text;

create unique index if not exists juntadas_organizer_token_hash_idx
  on public.juntadas (organizer_token_hash)
  where organizer_token_hash is not null;

alter table public.juntadas enable row level security;
alter table public.invitaciones enable row level security;
alter table public.respuestas enable row level security;
revoke all on public.juntadas, public.invitaciones, public.respuestas from anon, authenticated;

-- Las funciones SECURITY DEFINER verifican códigos, no hay SELECT/INSERT público a tablas.
create or replace function public.juntada_crear(
  p_nombre text, p_descripcion text default '',
  p_fecha text default '', p_hora text default '',
  p_lugar text default '', p_modalidad_fecha text default 'fixed',
  p_opciones_fecha jsonb default '[]'::jsonb, p_gastos text default ''
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_codigo uuid := gen_random_uuid();
  v_admin uuid := gen_random_uuid();
begin
  if length(trim(coalesce(p_nombre,''))) not between 1 and 120
     or length(coalesce(p_descripcion,'')) > 2000
     or length(coalesce(p_lugar,'')) > 250
     or length(coalesce(p_fecha,'')) > 50
     or length(coalesce(p_hora,'')) > 50
     or p_modalidad_fecha not in ('fixed','vote','pending')
     or jsonb_typeof(p_opciones_fecha) is distinct from 'array'
     or length(coalesce(p_gastos,'')) > 100
  then raise exception 'Datos de juntada inválidos'; end if;

  insert into public.juntadas
    (nombre, descripcion, lugar, fecha_texto, hora, modalidad_fecha, opciones_fecha, gastos, organizer_token_hash)
  values
    (trim(p_nombre), p_descripcion, p_lugar, p_fecha, p_hora, p_modalidad_fecha, p_opciones_fecha, p_gastos,
     encode(extensions.digest(v_admin::text, 'sha256'),'hex'))
  returning id into v_id;

  insert into public.invitaciones(juntada_id,codigo) values(v_id,v_codigo);
  return jsonb_build_object('id',v_id,'codigo',v_codigo,'organizador',v_admin);
end;
$$;

create or replace function public.juntada_ver(p_codigo uuid)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare v_event public.juntadas%rowtype;
begin
  select j.* into v_event from public.juntadas j
  join public.invitaciones i on i.juntada_id=j.id
  where i.codigo=p_codigo and i.activa=true;
  if not found then raise exception 'Invitación no disponible'; end if;
  return jsonb_build_object(
    'id',v_event.id,'nombre',v_event.nombre,'descripcion',v_event.descripcion,
    'fecha',v_event.fecha_texto,'hora',v_event.hora,'lugar',v_event.lugar,
    'modalidad_fecha',v_event.modalidad_fecha,
    'opciones_fecha',v_event.opciones_fecha,'gastos',v_event.gastos);
end;
$$;

create or replace function public.juntada_responder(
  p_codigo uuid, p_nombre text, p_asistencia text
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare v_event_id uuid; v_response_id uuid;
begin
  if length(trim(coalesce(p_nombre,''))) not between 1 and 80
     or p_asistencia not in ('voy','tal_vez','no_puedo')
  then raise exception 'Respuesta inválida'; end if;
  select juntada_id into v_event_id from public.invitaciones
  where codigo=p_codigo and activa=true;
  if v_event_id is null then raise exception 'Invitación no disponible'; end if;
  insert into public.respuestas(juntada_id,nombre,asistencia)
  values(v_event_id,trim(p_nombre),p_asistencia)
  returning id into v_response_id;
  return jsonb_build_object('ok',true,'id',v_response_id);
end;
$$;

create or replace function public.juntada_respuestas_organizador(
  p_juntada uuid, p_organizador uuid
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare v_result jsonb;
begin
  if not exists (
    select 1 from public.juntadas
    where id=p_juntada and organizer_token_hash=encode(extensions.digest(p_organizador::text,'sha256'),'hex')
  ) then raise exception 'Acceso no autorizado'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',r.id,'nombre',r.nombre,'asistencia',r.asistencia,'created_at',r.created_at
  ) order by r.created_at desc),'[]'::jsonb)
  into v_result from public.respuestas r where r.juntada_id=p_juntada;
  return v_result;
end;
$$;

revoke all on function public.juntada_crear(text,text,text,text,text,text,jsonb,text) from public;
revoke all on function public.juntada_ver(uuid) from public;
revoke all on function public.juntada_responder(uuid,text,text) from public;
revoke all on function public.juntada_respuestas_organizador(uuid,uuid) from public;

grant execute on function public.juntada_crear(text,text,text,text,text,text,jsonb,text) to anon,authenticated;
grant execute on function public.juntada_ver(uuid) to anon,authenticated;
grant execute on function public.juntada_responder(uuid,text,text) to anon,authenticated;
grant execute on function public.juntada_respuestas_organizador(uuid,uuid) to anon,authenticated;
