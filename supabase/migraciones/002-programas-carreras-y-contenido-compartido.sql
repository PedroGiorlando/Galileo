-- Migración 002 — programas, carreras y contenido compartido entre cursos
--
-- NO borra datos de usuarios: preserva la tabla admins, las compras y todo el
-- progreso. Las tablas viejas de contenido se eliminan recién al final, después
-- de copiar su contenido a las nuevas.
--
-- POR QUÉ
--
-- Física del ingreso a UNCuyo tiene 8 módulos y la de UTN FRM tiene 6, pero los
-- 6 son los mismos. Con el modelo anterior, donde cada clase pertenecía a un
-- curso, había que escribir Cinemática dos veces y mantenerla sincronizada a
-- mano. Al primer cambio, las dos versiones se separan.
--
-- El contenido pasa a pertenecer a la MATERIA, no al curso. Un curso es una
-- selección ordenada de módulos:
--
--   materias → módulos → clases          el contenido, escrito una sola vez
--       ↑
--   curso_modulos                        qué módulos entran en cada curso
--       ↓
--   programas → carreras → cursos        lo que se compra
--
-- Así Cinemática existe una vez y aparece en las dos carreras; Termodinámica
-- existe igual, pero solo está asignada a UNCuyo.

begin;

-- ---------------------------------------------------------------------------
-- Estructura institucional
-- ---------------------------------------------------------------------------

create table if not exists programas (
  id     serial primary key,
  slug   text not null unique,        -- 'uncuyo'
  nombre text not null,               -- 'UNCuyo'
  orden  integer not null default 0
);

alter table programas enable row level security;

create table if not exists carreras (
  id          serial primary key,
  programa_id integer not null references programas(id) on delete cascade,
  slug        text not null,          -- 'ingenieria'
  nombre      text not null,          -- 'Ingeniería'
  orden       integer not null default 0,
  unique (programa_id, slug),
  unique (id, programa_id)            -- para la clave foránea compuesta de cursos
);

alter table carreras enable row level security;

-- ---------------------------------------------------------------------------
-- Contenido, independiente de dónde se dicte
-- ---------------------------------------------------------------------------

create table if not exists materias (
  id     serial primary key,
  slug   text not null unique,        -- 'fisica' (va en la URL de cada clase)
  nombre text not null,
  orden  integer not null default 0
);

alter table materias enable row level security;

create table if not exists modulos (
  id         serial primary key,
  materia_id integer not null references materias(id) on delete cascade,
  slug       text not null,
  nombre     text not null,
  orden      integer not null default 0,   -- orden sugerido; cada curso puede cambiarlo
  unique (materia_id, slug),
  unique (id, materia_id)            -- para la clave foránea compuesta de clases
);

alter table modulos enable row level security;

-- `materia_id` está repetido acá a propósito, igual que antes con curso_id: la
-- URL de una clase es /clase/fisica/velocidad-media, sin el módulo en el medio,
-- así que buscarla por dirección tiene que ser una consulta a una sola tabla, y
-- el slug tiene que ser único por materia. La clave foránea compuesta contra
-- modulos(id, materia_id) hace imposible que ese materia_id contradiga al de su
-- módulo.
create table if not exists clases (
  id             serial primary key,
  modulo_id      integer not null,
  materia_id     integer not null,
  orden          integer not null,
  slug           text    not null,
  titulo         text    not null,
  descripcion    text,
  duracion_label text,
  video_url      text,
  gratis         boolean not null default false,
  publicado      boolean not null default true,
  contenido      jsonb,
  unique (materia_id, slug),
  foreign key (modulo_id, materia_id) references modulos(id, materia_id) on delete cascade
);

alter table clases enable row level security;

create index if not exists clases_modulo_orden_idx on clases (modulo_id, orden);

-- ---------------------------------------------------------------------------
-- Cursos: lo que se compra, armado a partir de módulos existentes
-- ---------------------------------------------------------------------------

create table if not exists cursos_nuevo (
  id              serial primary key,
  carrera_id      integer not null references carreras(id) on delete cascade,
  materia_id      integer not null references materias(id) on delete restrict,
  titulo          text    not null,
  descripcion     text,
  orden           integer not null default 0,
  precio_centavos integer not null default 0,
  publicado       boolean not null default false,
  unique (carrera_id, materia_id)
);

alter table cursos_nuevo enable row level security;

create table if not exists curso_modulos (
  curso_id  integer not null references cursos_nuevo(id) on delete cascade,
  modulo_id integer not null references modulos(id) on delete cascade,
  orden     integer not null,
  primary key (curso_id, modulo_id)
);

alter table curso_modulos enable row level security;

-- ---------------------------------------------------------------------------
-- Traspaso de los datos que ya existen
-- ---------------------------------------------------------------------------

-- Los dos programas. UNCuyo sale de lo que ya estaba cargado; UTN FRM se crea
-- vacío, listo para asignarle módulos desde el panel.
insert into programas (slug, nombre, orden) values
  ('uncuyo', 'UNCuyo', 1),
  ('utn-frm', 'UTN FRM', 2)
on conflict (slug) do update set nombre = excluded.nombre, orden = excluded.orden;

insert into carreras (programa_id, slug, nombre, orden)
select p.id, 'ingenieria', 'Ingeniería', 1 from programas p
on conflict (programa_id, slug) do update set nombre = excluded.nombre;

-- Cada curso viejo era una materia: se convierte en una fila de `materias`.
insert into materias (slug, nombre, orden)
select c.slug, c.nombre, c.orden from cursos c
on conflict (slug) do update set nombre = excluded.nombre, orden = excluded.orden;

-- Los temas viejos pasan a módulos de su materia.
insert into modulos (materia_id, slug, nombre, orden)
select m.id, t.slug, t.nombre, t.orden
from temas t
join cursos c on c.id = t.curso_id
join materias m on m.slug = c.slug
on conflict (materia_id, slug) do update set nombre = excluded.nombre, orden = excluded.orden;

-- Las clases conservan su id original. Es lo que permite que `progreso` siga
-- apuntando a la misma fila sin traducir nada.
insert into clases (id, modulo_id, materia_id, orden, slug, titulo, descripcion,
                    duracion_label, video_url, gratis, publicado, contenido)
select s.id, mo.id, ma.id, s.orden, s.slug, s.titulo, s.descripcion,
       s.duracion_label, s.video_url, s.gratis, s.publicado, s.contenido
from subtemas s
join temas t   on t.id = s.tema_id
join cursos c  on c.id = s.curso_id
join materias ma on ma.slug = c.slug
join modulos mo  on mo.materia_id = ma.id and mo.slug = t.slug
on conflict (id) do nothing;

-- La secuencia queda por delante de los ids copiados, si no el próximo insert
-- chocaría con uno existente.
select setval('clases_id_seq', coalesce((select max(id) from clases), 1), true);

-- Un curso por materia dentro de Ingeniería de UNCuyo, que es lo que había.
insert into cursos_nuevo (carrera_id, materia_id, titulo, descripcion, orden,
                          precio_centavos, publicado)
select ca.id, ma.id, ma.nombre || ' — Ingreso ' || p.nombre, c.descripcion,
       c.orden, c.precio_centavos, c.publicado
from cursos c
join materias ma on ma.slug = c.slug
join programas p on p.slug = 'uncuyo'
join carreras ca on ca.programa_id = p.id and ca.slug = 'ingenieria'
on conflict (carrera_id, materia_id) do nothing;

-- Cada curso arranca con todos los módulos de su materia, que es la relación
-- que había antes. Después se ajusta desde el panel.
insert into curso_modulos (curso_id, modulo_id, orden)
select cn.id, mo.id, mo.orden
from cursos_nuevo cn
join modulos mo on mo.materia_id = cn.materia_id
on conflict (curso_id, modulo_id) do nothing;

-- ---------------------------------------------------------------------------
-- Repuntar el progreso y las compras, sin perder una fila
-- ---------------------------------------------------------------------------

alter table progreso rename column subtema_id to clase_id;
alter table progreso drop constraint if exists progreso_subtema_id_fkey;
alter table progreso add constraint progreso_clase_id_fkey
  foreign key (clase_id) references clases(id) on delete cascade;

-- Las compras apuntaban a los cursos viejos. Se traducen al curso nuevo de la
-- misma materia dentro de Ingeniería de UNCuyo.
alter table compras add column if not exists curso_nuevo_id integer;

update compras co
set curso_nuevo_id = cn.id
from cursos c
join materias ma on ma.slug = c.slug
join cursos_nuevo cn on cn.materia_id = ma.id
where co.curso_id = c.id;

alter table compras drop constraint if exists compras_curso_id_fkey;
alter table compras drop column curso_id;
alter table compras rename column curso_nuevo_id to curso_id;
alter table compras add constraint compras_curso_id_fkey
  foreign key (curso_id) references cursos_nuevo(id) on delete restrict;

-- ---------------------------------------------------------------------------
-- Fuera lo viejo, y cursos_nuevo toma su nombre definitivo
-- ---------------------------------------------------------------------------

drop table subtemas cascade;
drop table temas cascade;
drop table cursos cascade;

alter table cursos_nuevo rename to cursos;
alter sequence cursos_nuevo_id_seq rename to cursos_id_seq;

-- ---------------------------------------------------------------------------
-- Row Level Security sobre las tablas nuevas
-- ---------------------------------------------------------------------------

-- RLS ya quedó activado al crear cada tabla, más arriba.

drop policy if exists programas_lectura on programas;
drop policy if exists carreras_lectura  on carreras;
drop policy if exists materias_lectura  on materias;
drop policy if exists modulos_lectura   on modulos;
drop policy if exists clases_lectura    on clases;
drop policy if exists cursos_lectura    on cursos;
drop policy if exists curso_modulos_lectura on curso_modulos;

create policy programas_lectura on programas for select using (true);
create policy carreras_lectura  on carreras  for select using (true);
create policy materias_lectura  on materias  for select using (true);
create policy modulos_lectura   on modulos   for select using (true);
create policy cursos_lectura    on cursos    for select using (publicado or private.es_admin());
create policy curso_modulos_lectura on curso_modulos for select using (true);

-- Una clase se ve si está publicada. Ya no depende de un curso: la misma clase
-- puede estar en un curso publicado y en otro que no.
create policy clases_lectura on clases for select
  using (publicado or private.es_admin());

drop policy if exists programas_admin on programas;
drop policy if exists carreras_admin  on carreras;
drop policy if exists materias_admin  on materias;
drop policy if exists modulos_admin   on modulos;
drop policy if exists clases_admin    on clases;
drop policy if exists cursos_admin    on cursos;
drop policy if exists curso_modulos_admin on curso_modulos;

create policy programas_admin on programas for all
  using (private.es_admin()) with check (private.es_admin());
create policy carreras_admin on carreras for all
  using (private.es_admin()) with check (private.es_admin());
create policy materias_admin on materias for all
  using (private.es_admin()) with check (private.es_admin());
create policy modulos_admin on modulos for all
  using (private.es_admin()) with check (private.es_admin());
create policy clases_admin on clases for all
  using (private.es_admin()) with check (private.es_admin());
create policy cursos_admin on cursos for all
  using (private.es_admin()) with check (private.es_admin());
create policy curso_modulos_admin on curso_modulos for all
  using (private.es_admin()) with check (private.es_admin());

commit;
