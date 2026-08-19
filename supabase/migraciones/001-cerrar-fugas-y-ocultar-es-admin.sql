-- Migración 001 — cerrar dos fugas de lectura y sacar es_admin() de la API pública
--
-- NO borra tablas ni datos. Solo reemplaza políticas y mueve una función.
-- Se corre una vez sobre una base que ya tiene el schema aplicado.
--
-- Qué arregla, verificado contra la base real con la clave pública:
--
-- 1. Cualquiera podía listar las 63 clases y las 20 unidades de materias sin
--    publicar. `subtemas_lectura` solo miraba `subtemas.publicado`, sin
--    preguntar si el curso al que pertenecen estaba publicado, y
--    `temas_lectura` era directamente `using (true)`.
--
-- 2. `public.es_admin()` quedaba expuesta como endpoint REST
--    (/rest/v1/rpc/es_admin), llamable sin estar logueado. Hoy solo devuelve
--    si vos mismo sos admin, así que no filtra nada de otros, pero una función
--    SECURITY DEFINER colgada de la API pública es una superficie que no hace
--    falta tener.

-- ---------------------------------------------------------------------------
-- La función se muda a un esquema que PostgREST no expone
-- ---------------------------------------------------------------------------

create schema if not exists private;

-- Las políticas se evalúan con los permisos de quien consulta, así que los
-- roles necesitan poder entrar al esquema. Poder entrar no es poder llamarla
-- por HTTP: PostgREST solo publica los esquemas configurados, y `private` no
-- está entre ellos.
grant usage on schema private to anon, authenticated;

create or replace function private.es_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Políticas nuevas
--
-- Las viejas referencian public.es_admin(), así que hay que reemplazarlas
-- antes de poder borrar esa función.
-- ---------------------------------------------------------------------------

drop policy if exists cursos_lectura   on cursos;
drop policy if exists cursos_admin     on cursos;
drop policy if exists temas_lectura    on temas;
drop policy if exists temas_admin      on temas;
drop policy if exists subtemas_lectura on subtemas;
drop policy if exists subtemas_admin   on subtemas;

create policy cursos_lectura on cursos for select
  using (publicado or private.es_admin());

create policy cursos_admin on cursos for all
  using (private.es_admin()) with check (private.es_admin());

-- El `exists` sobre cursos no repite la condición `publicado`: la consulta
-- interna también pasa por RLS, así que ya solo ve los cursos que quien
-- pregunta tiene permitido ver. Un admin ve todos y el resultado se acomoda
-- solo, sin duplicar la regla en dos lugares.
create policy temas_lectura on temas for select
  using (exists (select 1 from cursos c where c.id = temas.curso_id));

create policy temas_admin on temas for all
  using (private.es_admin()) with check (private.es_admin());

create policy subtemas_lectura on subtemas for select
  using (
    (publicado or private.es_admin())
    and exists (select 1 from cursos c where c.id = subtemas.curso_id)
  );

create policy subtemas_admin on subtemas for all
  using (private.es_admin()) with check (private.es_admin());

-- ---------------------------------------------------------------------------
-- Recién ahora se puede borrar la función expuesta
-- ---------------------------------------------------------------------------

drop function if exists public.es_admin();
