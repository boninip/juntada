-- Juntada V1: suspensión reversible de invitaciones.
alter table public.juntadas add column if not exists suspendida boolean not null default false;

create or replace function public.juntada_suspender(
 p_juntada uuid, p_organizador uuid, p_suspender boolean
)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v public.juntadas%rowtype;
begin
 select * into v from public.juntadas
 where id=p_juntada and organizer_token_hash=encode(extensions.digest(p_organizador::text,'sha256'),'hex')
 for update;
 if not found then raise exception 'Acceso no autorizado'; end if;
 if v.cancelada then raise exception 'La juntada fue eliminada y no se puede reactivar'; end if;
 update public.juntadas set suspendida=p_suspender where id=p_juntada;
 update public.invitaciones set activa=not p_suspender where juntada_id=p_juntada;
 return jsonb_build_object('ok',true,'suspendida',p_suspender);
end;$$;
revoke all on function public.juntada_suspender(uuid,uuid,boolean) from public;
grant execute on function public.juntada_suspender(uuid,uuid,boolean) to anon,authenticated;
