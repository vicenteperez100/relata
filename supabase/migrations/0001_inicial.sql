-- =============================================================================
-- ReLata · esquema inicial de la base de datos
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pega TODO este archivo → Run.
--
-- Privacidad: solo guardamos lo mínimo.
--   · El correo lo guarda Supabase Auth (tabla auth.users), no nosotros.
--   · profiles guarda un alias (opcional) y el token del QR.
--   · can_events guarda cada lata: de quién, de qué tipo, en qué máquina y cuándo.
--
-- Seguridad: Row Level Security (RLS) activado en todas las tablas.
--   · Cada persona solo puede LEER sus propios datos.
--   · Nadie puede registrar latas desde el navegador: solo el servidor,
--     a través de la función registrar_lata(), con la clave secreta.
-- =============================================================================

-- pgcrypto entrega números aleatorios criptográficamente seguros.
-- En Supabase viene instalada en el esquema "extensions".
create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- Token del QR: 32 bytes aleatorios en base64url (43 caracteres).
-- Hay 2^256 combinaciones: imposible de adivinar, a diferencia de un ID 1, 2, 3…
-- -----------------------------------------------------------------------------
create or replace function public.nuevo_qr_token()
returns text
language sql
volatile
set search_path = ''
as $$
  select rtrim(translate(encode(extensions.gen_random_bytes(32), 'base64'), '+/', '-_'), '=');
$$;

-- -----------------------------------------------------------------------------
-- Perfiles: uno por cada usuario de Supabase Auth.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  alias       text check (alias is null or char_length(btrim(alias)) between 2 and 30),
  qr_token    text not null unique default public.nuevo_qr_token(),
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Datos mínimos de cada persona: alias opcional y token del QR.';
comment on column public.profiles.qr_token is 'Secreto que va dentro del QR. Se puede regenerar con regenerar_qr_token().';

-- -----------------------------------------------------------------------------
-- Latas registradas por las máquinas.
-- -----------------------------------------------------------------------------
create type public.tipo_lata as enum ('otra', 'auspiciadora');

create table public.can_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  tipo        public.tipo_lata not null,
  maquina_id  text not null check (maquina_id ~ '^[A-Za-z0-9_-]{1,40}$'),
  created_at  timestamptz not null default now()
);

-- Acelera "las últimas latas de esta persona" (historial).
create index can_events_user_created_idx on public.can_events (user_id, created_at desc);

comment on table public.can_events is 'Una fila por cada lata aplastada.';

-- -----------------------------------------------------------------------------
-- Conteo de latas por persona. Los PUNTOS no se guardan: se calculan en la app
-- con lib/reglas/puntos.ts a partir de este conteo, así nunca se desincronizan.
-- security_invoker = true hace que la vista respete el RLS de can_events.
-- -----------------------------------------------------------------------------
create view public.conteo_latas
with (security_invoker = true)
as
select
  user_id,
  count(*) filter (where tipo = 'otra')::int         as otras,
  count(*) filter (where tipo = 'auspiciadora')::int as auspiciadoras
from public.can_events
group by user_id;

-- -----------------------------------------------------------------------------
-- Crear el perfil automáticamente cuando alguien se registra.
-- -----------------------------------------------------------------------------
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- -----------------------------------------------------------------------------
-- Permisos y Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.can_events enable row level security;

-- Partimos de cero: nadie puede nada…
revoke all on public.profiles, public.can_events, public.conteo_latas from anon, authenticated;
revoke all on function public.nuevo_qr_token() from public, anon, authenticated;
revoke all on function public.crear_perfil_nuevo_usuario() from public, anon, authenticated;

-- …y damos solo lo necesario a quien inició sesión (authenticated).
grant select on public.profiles, public.can_events, public.conteo_latas to authenticated;
-- Solo puede cambiar su alias. El token del QR NO se edita a mano.
grant update (alias) on public.profiles to authenticated;

-- El servidor (clave secreta = service_role) necesita acceso completo, por
-- ejemplo para borrar una cuenta. Lo damos explícito para no depender de los
-- permisos por defecto de Supabase.
grant select, insert, update, delete on public.profiles, public.can_events to service_role;
grant select on public.conteo_latas to service_role;

create policy "Cada persona ve su perfil"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Cada persona edita su alias"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Cada persona ve sus latas"
  on public.can_events for select to authenticated
  using ((select auth.uid()) = user_id);

-- No hay políticas de INSERT/UPDATE/DELETE en can_events: desde el navegador
-- nadie puede crear, cambiar ni borrar latas.

-- -----------------------------------------------------------------------------
-- Regenerar el QR (por ejemplo, si alguien le sacó una foto).
-- -----------------------------------------------------------------------------
create or replace function public.regenerar_qr_token()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  nuevo text;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión' using errcode = '42501';
  end if;
  update public.profiles
     set qr_token = public.nuevo_qr_token()
   where id = auth.uid()
  returning qr_token into nuevo;
  return nuevo;
end;
$$;

revoke all on function public.regenerar_qr_token() from public, anon;
grant execute on function public.regenerar_qr_token() to authenticated;

-- -----------------------------------------------------------------------------
-- Registrar una lata (la usa la API de la máquina, SOLO desde el servidor).
-- Devuelve el conteo actualizado, o nada si el token no existe.
-- -----------------------------------------------------------------------------
create or replace function public.registrar_lata(p_token text, p_tipo public.tipo_lata, p_maquina_id text)
returns table (user_id uuid, otras int, auspiciadoras int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  select p.id into v_user from public.profiles p where p.qr_token = p_token;
  if v_user is null then
    return; -- token desconocido: no devuelve filas
  end if;

  insert into public.can_events (user_id, tipo, maquina_id)
  values (v_user, p_tipo, p_maquina_id);

  return query
    select v_user,
           count(*) filter (where e.tipo = 'otra')::int,
           count(*) filter (where e.tipo = 'auspiciadora')::int
      from public.can_events e
     where e.user_id = v_user;
end;
$$;

-- Ni anon ni authenticated pueden llamarla: solo service_role (clave secreta).
revoke all on function public.registrar_lata(text, public.tipo_lata, text) from public, anon, authenticated;
grant execute on function public.registrar_lata(text, public.tipo_lata, text) to service_role;
