-- GENERADO por supabase/generar-seed.mjs — no editar a mano.
-- Editar supabase/curriculum.mjs y volver a correr el generador.
--
-- Se corre DESPUÉS de schema.sql. Es idempotente: los insert hacen
-- "on conflict do update", así que volver a correrlo actualiza títulos y
-- orden sin tocar el contenido ya cargado.

-- ========================================================================
-- Física
-- ========================================================================

insert into cursos (nivel, slug, nombre, programa, titulo, descripcion, orden, publicado)
values ('preuniversitario', 'fisica', 'Física', 'Ingreso Universitario',
        'Física — Ingreso Universitario', 'Todo el programa de Física del ingreso, desde magnitudes y unidades hasta trabajo y energía, con teoría, ejercicios resueltos y exámenes reales.',
        1, true)
  on conflict (nivel, slug) do update set
    nombre = excluded.nombre, programa = excluded.programa, titulo = excluded.titulo,
    descripcion = excluded.descripcion, orden = excluded.orden;

-- Física · Magnitudes y unidades
insert into temas (curso_id, orden, slug, nombre)
select c.id, 1, 'magnitudes-y-unidades', 'Magnitudes y unidades'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'fisica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'magnitudes-fisicas-y-su-medicion', 'Magnitudes físicas y su medición', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'magnitudes-y-unidades'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'sistema-internacional-de-unidades', 'Sistema Internacional de Unidades', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'magnitudes-y-unidades'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'notacion-cientifica', 'Notación científica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'magnitudes-y-unidades'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'cifras-significativas-y-redondeo', 'Cifras significativas y redondeo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'magnitudes-y-unidades'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'conversion-de-unidades', 'Conversión de unidades', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'magnitudes-y-unidades'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'analisis-dimensional', 'Análisis dimensional', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'magnitudes-y-unidades'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Física · Vectores
insert into temas (curso_id, orden, slug, nombre)
select c.id, 2, 'vectores', 'Vectores'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'fisica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'magnitudes-escalares-y-vectoriales', 'Magnitudes escalares y vectoriales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'vectores'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'representacion-y-elementos-de-un-vector', 'Representación y elementos de un vector', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'vectores'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'suma-de-vectores-por-metodo-grafico', 'Suma de vectores por método gráfico', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'vectores'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'descomposicion-en-componentes', 'Descomposición en componentes', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'vectores'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'suma-de-vectores-por-componentes', 'Suma de vectores por componentes', true, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'vectores'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'producto-de-un-vector-por-un-escalar', 'Producto de un vector por un escalar', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'vectores'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Física · Cinemática
insert into temas (curso_id, orden, slug, nombre)
select c.id, 3, 'cinematica', 'Cinemática'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'fisica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'posicion-desplazamiento-y-trayectoria', 'Posición, desplazamiento y trayectoria', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'cinematica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'velocidad-media-e-instantanea', 'Velocidad media e instantánea', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'cinematica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'movimiento-rectilineo-uniforme', 'Movimiento rectilíneo uniforme', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'cinematica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'movimiento-rectilineo-uniformemente-variado', 'Movimiento rectilíneo uniformemente variado', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'cinematica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'caida-libre-y-tiro-vertical', 'Caída libre y tiro vertical', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'cinematica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'tiro-oblicuo', 'Tiro oblicuo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'cinematica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 7, 'movimiento-circular-uniforme', 'Movimiento circular uniforme', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'cinematica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Física · Dinámica: las leyes de Newton
insert into temas (curso_id, orden, slug, nombre)
select c.id, 4, 'dinamica', 'Dinámica: las leyes de Newton'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'fisica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'primera-ley-de-newton-inercia', 'Primera ley de Newton: inercia', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'dinamica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'segunda-ley-de-newton', 'Segunda ley de Newton', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'dinamica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'tercera-ley-de-newton-accion-y-reaccion', 'Tercera ley de Newton: acción y reacción', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'dinamica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'peso-normal-y-tension', 'Peso, normal y tensión', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'dinamica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'fuerza-de-rozamiento', 'Fuerza de rozamiento', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'dinamica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'cuerpos-sobre-plano-inclinado', 'Cuerpos sobre plano inclinado', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'dinamica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 7, 'sistemas-de-cuerpos-vinculados', 'Sistemas de cuerpos vinculados', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'dinamica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Física · Trabajo y energía
insert into temas (curso_id, orden, slug, nombre)
select c.id, 5, 'trabajo-y-energia', 'Trabajo y energía'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'fisica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'trabajo-de-una-fuerza-constante', 'Trabajo de una fuerza constante', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'trabajo-y-energia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'energia-cinetica-y-teorema-del-trabajo', 'Energía cinética y teorema del trabajo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'trabajo-y-energia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'energia-potencial-gravitatoria', 'Energía potencial gravitatoria', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'trabajo-y-energia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'energia-potencial-elastica', 'Energía potencial elástica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'trabajo-y-energia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'conservacion-de-la-energia-mecanica', 'Conservación de la energía mecánica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'trabajo-y-energia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'potencia-y-rendimiento', 'Potencia y rendimiento', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'trabajo-y-energia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Física · Estática
insert into temas (curso_id, orden, slug, nombre)
select c.id, 6, 'estatica', 'Estática'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'fisica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'equilibrio-de-fuerzas-concurrentes', 'Equilibrio de fuerzas concurrentes', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'estatica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'momento-de-una-fuerza', 'Momento de una fuerza', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'estatica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'equilibrio-de-cuerpos-rigidos', 'Equilibrio de cuerpos rígidos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'estatica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'centro-de-gravedad', 'Centro de gravedad', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'estatica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Física · Exámenes resueltos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 7, 'examenes-resueltos', 'Exámenes resueltos'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'fisica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'examen-de-fisica-resuelto-modelo-1', 'Examen de Física resuelto: modelo 1', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'examenes-resueltos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'examen-de-fisica-resuelto-modelo-2', 'Examen de Física resuelto: modelo 2', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'examenes-resueltos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'examen-de-fisica-resuelto-modelo-3', 'Examen de Física resuelto: modelo 3', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'fisica' and t.slug = 'examenes-resueltos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- ========================================================================
-- Matemática
-- ========================================================================

insert into cursos (nivel, slug, nombre, programa, titulo, descripcion, orden, publicado)
values ('preuniversitario', 'matematica', 'Matemática', 'Ingreso Universitario',
        'Matemática — Ingreso Universitario', 'Todo el programa de Matemática del ingreso: conjuntos numéricos, álgebra, ecuaciones, funciones y trigonometría, con ejercicios resueltos y exámenes reales.',
        2, false)
  on conflict (nivel, slug) do update set
    nombre = excluded.nombre, programa = excluded.programa, titulo = excluded.titulo,
    descripcion = excluded.descripcion, orden = excluded.orden;

-- Matemática · Conjuntos numéricos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 1, 'conjuntos-numericos', 'Conjuntos numéricos'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'matematica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'numeros-naturales-y-enteros', 'Números naturales y enteros', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'conjuntos-numericos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'numeros-racionales-y-sus-operaciones', 'Números racionales y sus operaciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'conjuntos-numericos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'numeros-reales-y-recta-numerica', 'Números reales y recta numérica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'conjuntos-numericos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'potenciacion-y-sus-propiedades', 'Potenciación y sus propiedades', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'conjuntos-numericos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'radicacion-y-racionalizacion', 'Radicación y racionalización', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'conjuntos-numericos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'notacion-cientifica-y-orden-de-magnitud', 'Notación científica y orden de magnitud', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'conjuntos-numericos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Matemática · Expresiones algebraicas
insert into temas (curso_id, orden, slug, nombre)
select c.id, 2, 'expresiones-algebraicas', 'Expresiones algebraicas'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'matematica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'lenguaje-algebraico-y-polinomios', 'Lenguaje algebraico y polinomios', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'expresiones-algebraicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'operaciones-con-polinomios', 'Operaciones con polinomios', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'expresiones-algebraicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'productos-notables', 'Productos notables', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'expresiones-algebraicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'factoreo-casos-fundamentales', 'Factoreo: casos fundamentales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'expresiones-algebraicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'expresiones-algebraicas-racionales', 'Expresiones algebraicas racionales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'expresiones-algebraicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'simplificacion-de-expresiones', 'Simplificación de expresiones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'expresiones-algebraicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Matemática · Ecuaciones e inecuaciones
insert into temas (curso_id, orden, slug, nombre)
select c.id, 3, 'ecuaciones', 'Ecuaciones e inecuaciones'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'matematica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'ecuaciones-de-primer-grado', 'Ecuaciones de primer grado', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'ecuaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'ecuaciones-de-segundo-grado', 'Ecuaciones de segundo grado', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'ecuaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'ecuaciones-con-radicales', 'Ecuaciones con radicales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'ecuaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'sistemas-de-dos-ecuaciones-lineales', 'Sistemas de dos ecuaciones lineales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'ecuaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'inecuaciones-de-primer-grado', 'Inecuaciones de primer grado', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'ecuaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'problemas-que-se-resuelven-con-ecuaciones', 'Problemas que se resuelven con ecuaciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'ecuaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Matemática · Funciones
insert into temas (curso_id, orden, slug, nombre)
select c.id, 4, 'funciones', 'Funciones'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'matematica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'concepto-de-funcion-dominio-e-imagen', 'Concepto de función, dominio e imagen', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'funciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'funcion-lineal-y-su-grafico', 'Función lineal y su gráfico', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'funciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'funcion-cuadratica-y-parabola', 'Función cuadrática y parábola', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'funciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'funcion-exponencial', 'Función exponencial', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'funciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'logaritmos-y-funcion-logaritmica', 'Logaritmos y función logarítmica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'funciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'composicion-y-funcion-inversa', 'Composición y función inversa', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'funciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Matemática · Trigonometría
insert into temas (curso_id, orden, slug, nombre)
select c.id, 5, 'trigonometria', 'Trigonometría'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'matematica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'clasificacion-de-los-triangulos', 'Clasificación de los triángulos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'trigonometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'teorema-de-pitagoras', 'Teorema de Pitágoras', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'trigonometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'razones-trigonometricas-seno-coseno-y-tangente', 'Razones trigonométricas: seno, coseno y tangente', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'trigonometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'resolucion-de-triangulos-rectangulos', 'Resolución de triángulos rectángulos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'trigonometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'teorema-del-seno', 'Teorema del seno', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'trigonometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'teorema-del-coseno', 'Teorema del coseno', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'trigonometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 7, 'sistema-circular-y-radianes', 'Sistema circular y radianes', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'trigonometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Matemática · Exámenes resueltos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 6, 'examenes-resueltos', 'Exámenes resueltos'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'matematica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'examen-de-matematica-resuelto-modelo-1', 'Examen de Matemática resuelto: modelo 1', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'examenes-resueltos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'examen-de-matematica-resuelto-modelo-2', 'Examen de Matemática resuelto: modelo 2', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'examenes-resueltos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'examen-de-matematica-resuelto-modelo-3', 'Examen de Matemática resuelto: modelo 3', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'matematica' and t.slug = 'examenes-resueltos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- ========================================================================
-- Química
-- ========================================================================

insert into cursos (nivel, slug, nombre, programa, titulo, descripcion, orden, publicado)
values ('preuniversitario', 'quimica', 'Química', 'Ingreso Universitario',
        'Química — Ingreso Universitario', 'Todo el programa de Química del ingreso: estructura de la materia, tabla periódica, uniones, nomenclatura y estequiometría.',
        3, false)
  on conflict (nivel, slug) do update set
    nombre = excluded.nombre, programa = excluded.programa, titulo = excluded.titulo,
    descripcion = excluded.descripcion, orden = excluded.orden;

-- Química · La materia y sus propiedades
insert into temas (curso_id, orden, slug, nombre)
select c.id, 1, 'la-materia', 'La materia y sus propiedades'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'quimica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'sistemas-materiales-homogeneos-y-heterogeneos', 'Sistemas materiales homogéneos y heterogéneos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'la-materia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'metodos-de-separacion-de-fases', 'Métodos de separación de fases', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'la-materia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'estados-de-agregacion-y-cambios-de-estado', 'Estados de agregación y cambios de estado', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'la-materia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'propiedades-intensivas-y-extensivas', 'Propiedades intensivas y extensivas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'la-materia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'sustancias-puras-y-mezclas', 'Sustancias puras y mezclas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'la-materia'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Química · Estructura atómica
insert into temas (curso_id, orden, slug, nombre)
select c.id, 2, 'estructura-atomica', 'Estructura atómica'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'quimica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'modelos-atomicos-evolucion', 'Modelos atómicos: evolución', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'estructura-atomica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'numero-atomico-numero-masico-e-isotopos', 'Número atómico, número másico e isótopos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'estructura-atomica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'configuracion-electronica', 'Configuración electrónica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'estructura-atomica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'numeros-cuanticos', 'Números cuánticos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'estructura-atomica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Química · Tabla periódica
insert into temas (curso_id, orden, slug, nombre)
select c.id, 3, 'tabla-periodica', 'Tabla periódica'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'quimica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'organizacion-de-la-tabla-periodica', 'Organización de la tabla periódica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'tabla-periodica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'grupos-y-periodos', 'Grupos y períodos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'tabla-periodica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'propiedades-periodicas', 'Propiedades periódicas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'tabla-periodica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'metales-no-metales-y-gases-nobles', 'Metales, no metales y gases nobles', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'tabla-periodica'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Química · Uniones químicas
insert into temas (curso_id, orden, slug, nombre)
select c.id, 4, 'uniones-quimicas', 'Uniones químicas'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'quimica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'regla-del-octeto-y-estructuras-de-lewis', 'Regla del octeto y estructuras de Lewis', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'uniones-quimicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'union-ionica', 'Unión iónica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'uniones-quimicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'union-covalente', 'Unión covalente', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'uniones-quimicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'union-metalica', 'Unión metálica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'uniones-quimicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'fuerzas-intermoleculares', 'Fuerzas intermoleculares', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'uniones-quimicas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Química · Nomenclatura y formuleo
insert into temas (curso_id, orden, slug, nombre)
select c.id, 5, 'nomenclatura', 'Nomenclatura y formuleo'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'quimica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'numero-de-oxidacion', 'Número de oxidación', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'nomenclatura'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'oxidos-basicos-y-acidos', 'Óxidos básicos y ácidos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'nomenclatura'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'hidroxidos-y-acidos', 'Hidróxidos y ácidos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'nomenclatura'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'sales', 'Sales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'nomenclatura'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Química · Reacciones y estequiometría
insert into temas (curso_id, orden, slug, nombre)
select c.id, 6, 'estequiometria', 'Reacciones y estequiometría'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'quimica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'ecuaciones-quimicas-y-balanceo', 'Ecuaciones químicas y balanceo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'estequiometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'el-mol-y-la-masa-molar', 'El mol y la masa molar', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'estequiometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'calculos-estequiometricos', 'Cálculos estequiométricos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'estequiometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'reactivo-limitante', 'Reactivo limitante', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'estequiometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'pureza-y-rendimiento', 'Pureza y rendimiento', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'estequiometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- Química · Exámenes resueltos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 7, 'examenes-resueltos', 'Exámenes resueltos'
from cursos c where c.nivel = 'preuniversitario' and c.slug = 'quimica'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'examen-de-quimica-resuelto-modelo-1', 'Examen de Química resuelto: modelo 1', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'examenes-resueltos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'examen-de-quimica-resuelto-modelo-2', 'Examen de Química resuelto: modelo 2', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'preuniversitario' and c.slug = 'quimica' and t.slug = 'examenes-resueltos'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

