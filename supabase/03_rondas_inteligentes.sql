-- Juntada · Migración 03: rondas inteligentes de votación.
-- Ejecutar después de 01 y 02 en Supabase SQL Editor.
alter table public.juntadas add column if not exists ronda integer not null default 1;
alter table public.juntadas add column if not exists finalistas jsonb not null default '[]'::jsonb;
alter table public.juntada_votos add column if not exists ronda_revisada integer not null default 1;

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
 'cancelada',v.cancelada,'ronda',v.ronda,'finalistas',v.finalistas);
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
   if v.fecha_confirmada is not null and v.fecha_confirmada<>'' then raise exception 'La votación ya terminó'; end if;
   v_options:=case when jsonb_array_length(v.finalistas)>0 then v.finalistas else v.opciones_fecha end;
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
 insert into public.juntada_votos(juntada_id,nombre,tipo,elecciones,ronda_revisada)
 values(v.id,trim(p_nombre),p_tipo,p_elecciones,case when p_tipo='fecha' then v.ronda else 1 end)
 on conflict(juntada_id,nombre,tipo)
 do update set elecciones=case when excluded.tipo='fecha' then
   (select coalesce(jsonb_agg(value),'[]'::jsonb) from (
      select value from jsonb_array_elements(public.juntada_votos.elecciones) old_vote
      where not exists (select 1 from jsonb_array_elements(excluded.elecciones) new_vote where new_vote->>'date'=old_vote.value->>'date')
      union all select value from jsonb_array_elements(excluded.elecciones)
   ) combined)
   else excluded.elecciones end,
   ronda_revisada=case when excluded.tipo='fecha' then v.ronda else public.juntada_votos.ronda_revisada end,
   updated_at=now();
 return jsonb_build_object('ok',true);
end;$$;


create or replace function public.juntada_abrir_ronda(p_juntada uuid,p_organizador uuid,p_finalistas jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v public.juntadas%rowtype;
begin
 select * into v from public.juntadas where id=p_juntada
 and organizer_token_hash=encode(extensions.digest(p_organizador::text,'sha256'),'hex') for update;
 if not found then raise exception 'Acceso no autorizado'; end if;
 if v.modalidad_fecha<>'vote' or coalesce(v.fecha_confirmada,'')<>'' then raise exception 'La votación está cerrada'; end if;
 if jsonb_typeof(p_finalistas) is distinct from 'array' or jsonb_array_length(p_finalistas) not between 2 and 8 then raise exception 'Elegí entre 2 y 8 finalistas'; end if;
 if (select count(distinct value) from jsonb_array_elements_text(p_finalistas))<>jsonb_array_length(p_finalistas) then raise exception 'Fechas repetidas'; end if;
 if exists(select 1 from jsonb_array_elements_text(p_finalistas) f
 where not exists(select 1 from jsonb_array_elements_text(
 case when jsonb_array_length(v.finalistas)>0 then v.finalistas else v.opciones_fecha end) original
 where original.value=f.value)) then raise exception 'Las finalistas deben pertenecer a la ronda actual'; end if;
 if jsonb_array_length(p_finalistas)>=jsonb_array_length(
 case when jsonb_array_length(v.finalistas)>0 then v.finalistas else v.opciones_fecha end)
 then raise exception 'La nueva ronda debe reducir las opciones'; end if;
 update public.juntadas set ronda=v.ronda+1,finalistas=p_finalistas where id=v.id;
 return jsonb_build_object('ronda',v.ronda+1,'finalistas',p_finalistas);
end;$$;

create or replace function public.juntada_ver_organizador(p_juntada uuid,p_organizador uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v public.juntadas%rowtype; reviews jsonb;
begin
 select * into v from public.juntadas where id=p_juntada
 and organizer_token_hash=encode(extensions.digest(p_organizador::text,'sha256'),'hex');
 if not found then raise exception 'Acceso no autorizado'; end if;
 select coalesce(jsonb_object_agg(nombre,ronda_revisada),'{}'::jsonb) into reviews
 from public.juntada_votos where juntada_id=v.id and tipo='fecha';
 return jsonb_build_object('id',v.id,'ronda',v.ronda,'finalistas',v.finalistas,'revisiones',reviews);
end;$$;

revoke all on function public.juntada_abrir_ronda(uuid,uuid,jsonb) from public;
revoke all on function public.juntada_ver_organizador(uuid,uuid) from public;
grant execute on function public.juntada_abrir_ronda(uuid,uuid,jsonb) to anon,authenticated;
grant execute on function public.juntada_ver_organizador(uuid,uuid) to anon,authenticated;
