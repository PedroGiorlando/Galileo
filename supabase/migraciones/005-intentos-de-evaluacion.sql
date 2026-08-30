-- Migración 005 — intentos de evaluación
--
-- NO toca nada de lo que existe. Agrega una tabla.
--
-- POR QUÉ HACE FALTA UNA TABLA PARA UN CRONÓMETRO
--
-- Un reloj en el navegador no es un límite de tiempo, es una sugerencia: se
-- pausa con las herramientas de desarrollo y se reinicia recargando la página.
-- La única forma de que el tiempo signifique algo es que el servidor anote
-- CUÁNDO empezó el intento y calcule contra ese sello.
--
-- El número que baja en la pantalla del alumno es cosmético. La verdad está
-- acá, en `comenzado_en`.
--
-- Y de paso resuelve tres cosas más que ya estaban pedidas: la nota queda
-- guardada, el tiempo que tardó también, y las respuestas quedan para poder
-- mostrar la revisión al final.

begin;

create table if not exists intentos (
  id           serial primary key,
  user_id      uuid    not null references auth.users(id) on delete cascade,
  clase_id     integer not null references clases(id)     on delete cascade,

  -- Qué evaluación de esa clase: su posición dentro del contenido. Las
  -- evaluaciones no tienen id propio, se numeran por orden como todo el resto.
  eval_indice  integer not null,

  -- El reloj de verdad. Todo lo demás se calcula contra esto.
  comenzado_en timestamptz not null default now(),

  -- NULL mientras está rindiendo. Cuando se entrega -o cuando el servidor lo
  -- cierra al vencerse el tiempo- queda la hora.
  entregado_en timestamptz,

  -- { "1": 2, "3": 0 } — id de pregunta → índice de la opción elegida.
  -- Se guarda respuesta por respuesta, no al entregar: si se corta la luz en
  -- la pregunta 9, no se pierden las 8 anteriores. Y es lo que permite cerrar
  -- el intento con lo que haya cuando se acaba el tiempo.
  respuestas   jsonb   not null default '{}'::jsonb,

  puntaje      integer,
  total        integer
);

-- La consulta de siempre: los intentos de este alumno en esta evaluación,
-- para contar cuántos lleva y encontrar el que tenga abierto.
create index if not exists intentos_alumno_idx
  on intentos (user_id, clase_id, eval_indice);

-- Un solo intento abierto por evaluación. Sin esto, dos clics seguidos en
-- "Comenzar" crean dos filas y el alumno queda con dos relojes corriendo.
create unique index if not exists intentos_uno_abierto
  on intentos (user_id, clase_id, eval_indice)
  where entregado_en is null;

alter table intentos enable row level security;

-- Cada alumno ve y escribe sus propios intentos, nada más. La verificación
-- está en la base y no solo en el código: si mañana una consulta se olvida de
-- filtrar por usuario, acá no pasa igual.
drop policy if exists intentos_propios on intentos;
create policy intentos_propios on intentos
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

commit;
