-- Pruebas de seguridad de la migración 0001 (se corren contra un Postgres
-- local con stub-supabase.sql; ver scripts/probar-sql.sh).
\set ON_ERROR_STOP on
\set QUIET on

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@ejemplo.cl'),
  ('22222222-2222-2222-2222-222222222222', 'beto@ejemplo.cl');

do $$
declare t1 text; t2 text; r record; n int;
begin
  -- 1. El trigger crea un perfil por usuario, con token de 43 caracteres base64url
  select count(*) into n from public.profiles;
  assert n = 2, 'debería haber 2 perfiles';
  select qr_token into t1 from public.profiles where id = '11111111-1111-1111-1111-111111111111';
  select qr_token into t2 from public.profiles where id = '22222222-2222-2222-2222-222222222222';
  assert t1 ~ '^[A-Za-z0-9_-]{43}$', 'token con formato inválido: ' || t1;
  assert t1 <> t2, 'los tokens deben ser distintos';

  -- 2. registrar_lata suma y devuelve el conteo
  perform public.registrar_lata(t1, 'auspiciadora', 'RLT-01');
  perform public.registrar_lata(t1, 'otra', 'RLT-01');
  select * into r from public.registrar_lata(t1, 'auspiciadora', 'RLT-01');
  assert r.otras = 1 and r.auspiciadoras = 2, 'conteo incorrecto';

  -- 3. Token inexistente: no devuelve filas ni inserta
  select count(*) into n from public.registrar_lata('token-falso', 'otra', 'RLT-01');
  assert n = 0, 'un token falso no debe registrar';
  select count(*) into n from public.can_events;
  assert n = 3, 'solo 3 latas';
  raise notice 'OK 1-3: trigger, token, registrar_lata';
end $$;

-- 4. Usuario anónimo (sin sesión): no ve nada
set role anon;
do $$ begin
  begin perform * from public.profiles; raise exception 'anon NO debería leer profiles';
  exception when insufficient_privilege then null; end;
  begin perform * from public.can_events; raise exception 'anon NO debería leer can_events';
  exception when insufficient_privilege then null; end;
  begin perform public.registrar_lata('x', 'otra', 'RLT-01'); raise exception 'anon NO debería registrar';
  exception when insufficient_privilege then null; end;
  raise notice 'OK 4: anon bloqueado';
end $$;
reset role;

-- 5. Ana (con sesión) ve SOLO lo suyo y no puede trampear
set role authenticated;
do $$ begin perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false); end $$;
do $$
declare n int; viejo text; nuevo text;
begin
  select count(*) into n from public.profiles;            assert n = 1, 'Ana ve 1 perfil';
  select count(*) into n from public.can_events;          assert n = 3, 'Ana ve sus 3 latas';
  select count(*) into n from public.conteo_latas;        assert n = 1, 'Ana ve solo su conteo';

  update public.profiles set alias = 'Ana' where true;     -- solo afecta su fila
  select count(*) into n from public.profiles where alias = 'Ana'; assert n = 1, 'alias actualizado';

  begin update public.profiles set qr_token = 'aaa'; raise exception 'NO debería editar el token';
  exception when insufficient_privilege then null; end;

  begin insert into public.can_events (user_id, tipo, maquina_id)
        values ('11111111-1111-1111-1111-111111111111', 'auspiciadora', 'X');
        raise exception 'NO debería insertar latas';
  exception when insufficient_privilege then null; end;

  begin delete from public.can_events; raise exception 'NO debería borrar latas';
  exception when insufficient_privilege then null; end;

  begin perform public.registrar_lata('x', 'otra', 'RLT-01'); raise exception 'NO debería registrar';
  exception when insufficient_privilege then null; end;

  select qr_token into viejo from public.profiles;
  nuevo := public.regenerar_qr_token();
  assert nuevo <> viejo and nuevo ~ '^[A-Za-z0-9_-]{43}$', 'QR regenerado';
  raise notice 'OK 5: Ana ve solo lo suyo, no edita token ni latas, regenera QR';
end $$;

-- 6. Beto no ve las latas de Ana
do $$ begin perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false); end $$;
do $$ declare n int; begin
  select count(*) into n from public.can_events; assert n = 0, 'Beto no ve latas ajenas';
  update public.profiles set alias = 'hack' where id = '11111111-1111-1111-1111-111111111111';
  reset role;
  select count(*) into n from public.profiles where alias = 'hack'; assert n = 0, 'Beto no edita a Ana';
  raise notice 'OK 6: aislamiento entre usuarios';
end $$;
reset role;

-- 7. Validaciones
do $$ begin
  begin update public.profiles set alias = 'x' where id = '22222222-2222-2222-2222-222222222222';
        raise exception 'alias de 1 letra no debería pasar';
  exception when check_violation then null; end;
  begin perform public.registrar_lata((select qr_token from public.profiles limit 1), 'otra', 'maq; drop table');
        raise exception 'maquina_id inválido no debería pasar';
  exception when check_violation then null; end;
  raise notice 'OK 7: validaciones';
end $$;

-- 8. Borrar el usuario borra perfil y latas (derecho a eliminar datos)
delete from auth.users where id = '11111111-1111-1111-1111-111111111111';
do $$ declare n int; begin
  select count(*) into n from public.can_events; assert n = 0, 'latas borradas en cascada';
  raise notice 'OK 8: borrado en cascada';
end $$;
