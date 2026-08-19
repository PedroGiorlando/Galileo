-- Academia Galileo — esquema
--
-- Cómo aplicarlo: abrir este archivo en el editor, copiar todo (Ctrl+A, Ctrl+C)
-- y pegarlo en Supabase → SQL Editor → New query → Run.
--
-- NO copiarlo con "Get-Content archivo | Set-Clipboard" a secas: Windows
-- PowerShell lo lee en la codificación ANSI del sistema y las tildes llegan
-- corruptas a la base ('Física' termina como 'FÃ­sica'). Si hace falta desde la
-- terminal, va con encoding explícito:
--     Get-Content archivo -Raw -Encoding UTF8 | Set-Clipboard
--
-- ⚠ ESTE ARCHIVO BORRA LAS TABLAS Y LAS VUELVE A CREAR. Está pensado para la
-- etapa de desarrollo, donde el contenido se recarga desde el seed y el panel.
-- En cuanto haya alumnos o pagos, esto se reemplaza por migraciones
-- incrementales que nunca hacen drop.
--
-- Jerarquía. Los nombres de las tablas son genéricos a propósito: lo que cambia
-- según el nivel son las etiquetas que ve el alumno.
--
--   cursos   → una materia del ingreso   "Física"        (lo que se compra)
--   temas    → una unidad                "Vectores"
--   subtemas → una clase                 "Suma de vectores por componentes"

drop table if exists progreso cascade;
drop table if exists compras  cascade;
drop table if exists subtemas cascade;
drop table if exists temas    cascade;
drop table if exists cursos   cascade;
drop table if exists materias cascade;   -- de una versión anterior del modelo
drop table if exists admins   cascade;

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------

-- Un curso es lo que se compra: una materia completa de un programa.
create table cursos (
  id              serial primary key,
  nivel           text    not null default 'preuniversitario',
  slug            text    not null,                      -- 'fisica' (va en la URL)
  nombre          text    not null,                      -- 'Física'
  programa        text    not null,                      -- 'Ingreso UNCuyo'
  titulo          text    not null,                      -- 'Física — Ingreso UNCuyo'
  descripcion     text,
  orden           integer not null default 0,
  precio_centavos integer not null default 0,            -- centavos: la plata nunca en float
  publicado       boolean not null default false,
  unique (nivel, slug)
);

-- Tema = unidad del programa: 'Vectores', 'Cinemática'...
create table temas (
  id       serial primary key,
  curso_id integer not null references cursos(id) on delete cascade,
  orden    integer not null,
  slug     text    not null,
  nombre   text    not null,
  unique (curso_id, slug),
  -- Necesaria para la clave foránea compuesta de subtemas (ver abajo).
  unique (id, curso_id)
);

-- Subtema = la clase que se estudia, con sus 5 solapas.
--
-- `curso_id` está repetido acá a propósito: la URL es
-- /preuniversitario/fisica/slug, sin la unidad en el medio, así que buscar una
-- clase por su dirección tiene que ser una consulta a una sola tabla. La clave
-- foránea compuesta contra temas(id, curso_id) hace imposible que este curso_id
-- contradiga al de la unidad a la que pertenece.
--
-- `contenido` es nullable: la fila existe y se ve en el temario desde el día
-- uno, pero mientras no haya contenido escrito la página muestra "Próximamente"
-- y no se indexa.
create table subtemas (
  id             serial primary key,
  curso_id       integer not null,
  tema_id        integer not null,
  orden          integer not null,
  slug           text    not null,
  titulo         text    not null,
  descripcion    text,
  duracion_label text,
  video_url      text,                             -- vacío ⇒ se oculta la solapa Lección
  gratis         boolean not null default false,
  publicado      boolean not null default true,
  contenido      jsonb,
  unique (curso_id, slug),
  foreign key (tema_id, curso_id) references temas(id, curso_id) on delete cascade
);

create index subtemas_curso_orden_idx on subtemas (curso_id, orden);
create index subtemas_tema_orden_idx  on subtemas (tema_id, orden);

-- ---------------------------------------------------------------------------
-- Personas
-- ---------------------------------------------------------------------------

-- Quién puede entrar al panel: los profesores que cargan su materia. El user_id
-- se agrega a mano desde el dashboard después de que la persona se registre.
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table compras (
  id            serial primary key,
  user_id       uuid    not null references auth.users(id) on delete cascade,
  curso_id      integer not null references cursos(id) on delete restrict,
  mp_payment_id text unique,                       -- idempotencia del webhook de Mercado Pago
  creada_en     timestamptz not null default now(),
  vence_en      timestamptz                        -- null ⇒ acceso sin vencimiento
);

create index compras_user_curso_idx on compras (user_id, curso_id);

create table progreso (
  user_id        uuid    not null references auth.users(id) on delete cascade,
  subtema_id     integer not null references subtemas(id) on delete cascade,
  completado     boolean not null default false,
  mejor_puntaje  integer,
  respuestas     jsonb,
  actualizado_en timestamptz not null default now(),
  primary key (user_id, subtema_id)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- RLS es el candado real: se aplica en la base, así que aunque el frontend
-- tenga un bug, un usuario no puede leer el progreso de otro. Sin políticas,
-- una tabla con RLS habilitado no devuelve NADA — hay que declarar cada permiso.
-- ---------------------------------------------------------------------------

alter table cursos   enable row level security;
alter table temas    enable row level security;
alter table subtemas enable row level security;
alter table admins   enable row level security;
alter table compras  enable row level security;
alter table progreso enable row level security;

create or replace function es_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- Catálogo: cualquiera lee lo publicado; solo un admin escribe.
create policy cursos_lectura   on cursos   for select using (publicado or es_admin());
create policy temas_lectura    on temas    for select using (true);
create policy subtemas_lectura on subtemas for select using (publicado or es_admin());

create policy cursos_admin   on cursos   for all using (es_admin()) with check (es_admin());
create policy temas_admin    on temas    for all using (es_admin()) with check (es_admin());
create policy subtemas_admin on subtemas for all using (es_admin()) with check (es_admin());

-- Cada quien ve si es admin; nadie se agrega solo (eso se hace desde el dashboard).
create policy admins_lectura_propia on admins for select using (user_id = auth.uid());

-- Compras: el alumno ve las suyas y nada más. Insertar es tarea del webhook de
-- Mercado Pago, que corre en el servidor con la service role key y saltea RLS.
-- Deliberadamente NO hay política de insert: nadie se regala un curso desde el
-- navegador.
create policy compras_lectura_propia on compras for select using (user_id = auth.uid());

-- Progreso: el alumno lee y escribe solo el suyo.
create policy progreso_propio on progreso for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Las materias, unidades y clases vienen en seed-preuniversitario.sql.
-- ---------------------------------------------------------------------------
