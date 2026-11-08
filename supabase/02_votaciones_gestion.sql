-- Juntada V1 · migración 02: fechas, lugares, votos y gestión
-- Requiere supabase/01_api_v1.sql ejecutado previamente.
-- No habilita acceso directo a las tablas desde anon.
create table if not exists public.juntada_votos (
 id uuid primary key default gen_random_uuid(),
 juntada_id uuid not null references public.juntadas(id) on delete cascade,
 nombre text not null,
 tipo text not null check (tipo in ('fecha','lugar')),
 elecciones jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (juntada_id,nombre,tipo)
);
alter table public.juntada_votos enable row level security;
revoke all on public.juntada_votos from anon, authenticated;
alter table public.juntadas add column if not exists lugares jsonb not null default '[]'::jsonb;
alter table public.juntadas add column if not exists fecha_confirmada text;
alter table public.juntadas add column if not exists cancelada boolean not null default false;

-- El código compartido habilita lectura del evento y envío de votos.
create or replace function public.juntada_ver(p_codigo uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v public.juntadas%rowtype;
begin
 select j.* into v from public.juntadas j
 join public.invitaciones i on i.juntada_id=j.id
 where i.codigo=p_codigo and i.activa=true;
 if not found then raise exception 'Invitación no disponible'; end if;
 return jsonb_build_object('id',v.id,'nombre',v.nombre,'descripcion',v.descripcion,
 'fecha',v.fecha_texto,'hora',v.hora,'lugar',v.lugar,
 'modalidad_fecha',v.modalidad_fecha,'opciones_fecha',v.opciones_fecha,
 'gastos',v.gastos,'lugares',v.lugares,'fecha_confirmada',v.fecha_confirmada,
 'cancelada',v.cancelada);
end;$$;

create or replace function public.juntada_votar(
 p_codigo uuid,p_nombre text,p_tipo text,p_elecciones jsonb
)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v public.juntadas%rowtype; v_options jsonb;
begin
 select j.* into v from public.juntadas j
 join public.invitaciones i on i.juntada_id=j.id
 where i.codigo=p_codigo and i.activa=true;
 if not found or v.cancelada then raise exception 'Invitación no disponible'; end if;
 if length(trim(coalesce(p_nombre,''))) not between 1 and 80
 or p_tipo not in ('fecha','lugar')
 or jsonb_typeof(p_elecciones) is distinct from 'array'
 or jsonb_array_length(p_elecciones) not between 1 and 10
 or length(p_elecciones::text)>2000
 then raise exception 'Voto inválido'; end if;
 if p_tipo='fecha' then
   if v.modalidad_fecha<>'vote' then raise exception 'No hay votación de fechas'; end if;
   v_options:=v.opciones_fecha;
   if exists(select 1 from jsonb_array_elements(p_elecciones) e
     where jsonb_typeof(e.value)<>'object'
     or e.value->>'date' is null
     or e.value->>'choice' not in ('yes','maybe','no')
     or not exists(select 1 from jsonb_array_elements_text(v_options) d where d.value=e.value->>'date'))
   then raise exception 'Fecha u opción inválida'; end if;
 else
   v_options:=v.lugares;
   if exists(select 1 from jsonb_array_elements(p_elecciones) e
     where jsonb_typeof(e.value)<>'number'
     or not exists(select 1 from jsonb_array_elements(v_options) d where d.value->>'id'=e.value #>> '{}'))
   then raise exception 'Lugar inválido'; end if;
 end if;
 insert into public.juntada_votos(juntada_id,nombre,tipo,elecciones)
 values(v.id,trim(p_nombre),p_tipo,p_elecciones)
 on conflict(juntada_id,nombre,tipo)
 do update set elecciones=excluded.elecciones,updated_at=now();
 return jsonb_build_object('ok',true);
end;$$;

create or replace function public.juntada_actualizar(
 p_juntada uuid,p_organizador uuid,
 p_fecha text default null,p_hora text default null,p_lugar text default null,
 p_fecha_confirmada text default null,p_lugares jsonb default null,
 p_cancelada boolean default null
)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v public.juntadas%rowtype;
begin
 select * into v from public.juntadas where id=p_juntada
 and organizer_token_hash=encode(extensions.digest(p_organizador::text,'sha256'),'hex')
 for update;
 if not found then raise exception 'Acceso no autorizado'; end if;
 if length(coalesce(p_fecha,''))>50 or length(coalesce(p_hora,''))>50
 or length(coalesce(p_lugar,''))>250 or length(coalesce(p_fecha_confirmada,''))>50
 or (p_lugares is not null and
 (jsonb_typeof(p_lugares)<>'array' or length(p_lugares::text)>6000 or jsonb_array_length(p_lugares)>10))
 then raise exception 'Datos inválidos'; end if;
 update public.juntadas set
 fecha_texto=coalesce(p_fecha,fecha_texto),hora=coalesce(p_hora,hora),
 lugar=coalesce(p_lugar,lugar),
 fecha_confirmada=coalesce(p_fecha_confirmada,fecha_confirmada),
 lugares=coalesce(p_lugares,lugares),
 cancelada=coalesce(p_cancelada,cancelada)
 where id=p_juntada;
 if p_cancelada=true then update public.invitaciones set activa=false where juntada_id=p_juntada; end if;
 return jsonb_build_object('ok',true);
end;$$;

create or replace function public.juntada_votos_organizador(p_juntada uuid,p_organizador uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_result jsonb;
begin
 if not exists(select 1 from public.juntadas where id=p_juntada
 and organizer_token_hash=encode(extensions.digest(p_organizador::text,'sha256'),'hex'))
 then raise exception 'Acceso no autorizado'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('nombre',nombre,'tipo',tipo,
 'elecciones',elecciones,'updated_at',updated_at)),'[]'::jsonb)
 into v_result from public.juntada_votos where juntada_id=p_juntada;
 return v_result;
end;$$;

revoke all on function public.juntada_votar(uuid,text,text,jsonb) from public;
revoke all on function public.juntada_actualizar(uuid,uuid,text,text,text,text,jsonb,boolean) from public;
revoke all on function public.juntada_votos_organizador(uuid,uuid) from public;
grant execute on function public.juntada_votar(uuid,text,text,jsonb) to anon,authenticated;
grant execute on function public.juntada_actualizar(uuid,uuid,text,text,text,text,jsonb,boolean) to anon,authenticated;
grant execute on function public.juntada_votos_organizador(uuid,uuid) to anon,authenticated;
