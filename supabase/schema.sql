-- Academia Galileo — esquema inicial
--
-- Cómo aplicarlo: Supabase → SQL Editor → New query → pegar todo → Run.
-- Es idempotente (usa IF NOT EXISTS), así que se puede correr de nuevo sin romper nada.

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------

create table if not exists materias (
  id     serial primary key,
  slug   text not null unique,          -- 'matematica' (va en la URL)
  nombre text not null                  -- 'Matemática' (se muestra)
);

create table if not exists cursos (
  id               serial primary key,
  materia_id       integer not null references materias(id) on delete restrict,
  nivel            text    not null default 'primaria',   -- primaria | secundaria | ingreso
  grado_slug       text    not null,                      -- '4-grado'
  grado_nombre     text    not null,                      -- '4° Grado'
  titulo           text    not null,                      -- 'Matemática 4° Grado'
  descripcion      text,
  precio_centavos  integer not null default 0,            -- en centavos: la plata nunca en float
  publicado        boolean not null default false,
  unique (nivel, grado_slug, materia_id)
);

-- El contenido del tema va entero en una columna jsonb, no en seis tablas:
-- siempre se lee completo y nunca se consulta por partes. La forma de ese json
-- la valida TemaContenidoSchema (src/lib/schemas.ts) antes de escribir acá.
create table if not exists temas (
  id             serial primary key,
  curso_id       integer not null references cursos(id) on delete cascade,
  orden          integer not null,
  slug           text    not null,
  titulo         text    not null,
  categoria      text,
  duracion_label text,
  video_url      text,                                    -- null/'' ⇒ se oculta el tab Lección
  gratis         boolean not null default false,          -- muestra pública + lo que indexa Google
  publicado      boolean not null default false,
  contenido      jsonb   not null,
  unique (curso_id, slug)
);

create index if not exists temas_curso_orden_idx on temas (curso_id, orden);

-- ---------------------------------------------------------------------------
-- Personas
-- ---------------------------------------------------------------------------

-- Quién puede entrar al panel. Con dos hermanos alcanza una tabla de dos filas;
-- se agrega el user_id a mano desde el dashboard después del primer registro.
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists compras (
  id            serial primary key,
  user_id       uuid    not null references auth.users(id) on delete cascade,
  curso_id      integer not null references cursos(id) on delete restrict,
  mp_payment_id text unique,                              -- idempotencia del webhook de Mercado Pago
  creada_en     timestamptz not null default now(),
  vence_en      timestamptz                               -- null ⇒ acceso sin vencimiento
);

create index if not exists compras_user_curso_idx on compras (user_id, curso_id);

create table if not exists progreso (
  user_id        uuid    not null references auth.users(id) on delete cascade,
  tema_id        integer not null references temas(id) on delete cascade,
  completado     boolean not null default false,
  mejor_puntaje  integer,
  respuestas     jsonb,
  actualizado_en timestamptz not null default now(),
  primary key (user_id, tema_id)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- RLS es el candado real: se aplica en la base, así que aunque el frontend
-- tenga un bug, un usuario no puede leer el progreso de otro. Sin políticas,
-- una tabla con RLS habilitado no devuelve NADA — hay que declarar cada permiso.
-- ---------------------------------------------------------------------------

alter table materias enable row level security;
alter table cursos   enable row level security;
alter table temas    enable row level security;
alter table admins   enable row level security;
alter table compras  enable row level security;
alter table progreso enable row level security;

create or replace function es_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- Catálogo: cualquiera lee lo publicado; solo un admin escribe.
drop policy if exists materias_lectura on materias;
create policy materias_lectura on materias for select using (true);

drop policy if exists cursos_lectura on cursos;
create policy cursos_lectura on cursos for select using (publicado or es_admin());

drop policy if exists temas_lectura on temas;
create policy temas_lectura on temas for select using (publicado or es_admin());

drop policy if exists materias_admin on materias;
create policy materias_admin on materias for all using (es_admin()) with check (es_admin());

drop policy if exists cursos_admin on cursos;
create policy cursos_admin on cursos for all using (es_admin()) with check (es_admin());

drop policy if exists temas_admin on temas;
create policy temas_admin on temas for all using (es_admin()) with check (es_admin());

-- Cada quien ve si es admin, nadie se agrega solo (eso se hace desde el dashboard).
drop policy if exists admins_lectura_propia on admins;
create policy admins_lectura_propia on admins for select using (user_id = auth.uid());

-- Compras: el alumno ve las suyas y nada más. Insertar es tarea del webhook de
-- Mercado Pago, que corre en el servidor con la service role key y saltea RLS.
-- Deliberadamente NO hay política de insert: nadie se regala un curso desde el
-- navegador.
drop policy if exists compras_lectura_propia on compras;
create policy compras_lectura_propia on compras for select using (user_id = auth.uid());

-- Progreso: el alumno lee y escribe solo el suyo.
drop policy if exists progreso_propio on progreso;
create policy progreso_propio on progreso for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Semilla: el curso que ya existe
-- ---------------------------------------------------------------------------

insert into materias (slug, nombre) values ('matematica', 'Matemática')
  on conflict (slug) do nothing;

insert into cursos (materia_id, nivel, grado_slug, grado_nombre, titulo, descripcion, precio_centavos, publicado)
select m.id, 'primaria', '4-grado', '4° Grado', 'Matemática 4° Grado',
       'Todo el programa de Matemática de 4° grado, con explicaciones, ejemplos resueltos y ejercicios que se corrigen solos.',
       0, true
from materias m where m.slug = 'matematica'
  on conflict (nivel, grado_slug, materia_id) do nothing;
