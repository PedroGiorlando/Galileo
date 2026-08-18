-- GENERADO por supabase/generar-seed.mjs — no editar a mano.
-- Editar supabase/curriculum.mjs y volver a correr el generador.
--
-- Se corre DESPUÉS de schema.sql. Es idempotente: los insert hacen
-- "on conflict do update", así que volver a correrlo actualiza títulos y
-- orden sin tocar el contenido ya cargado.

-- ========================================================================
-- 1° Grado
-- ========================================================================

insert into cursos (materia_id, nivel, grado_slug, grado_nombre, titulo, descripcion, orden, publicado)
select m.id, 'primaria', '1-grado', '1° Grado', 'Matemática 1° Grado',
       'Los primeros números, las primeras cuentas y las formas que nos rodean.', 1, true
from materias m where m.slug = 'matematica'
  on conflict (nivel, grado_slug, materia_id) do update set
    grado_nombre = excluded.grado_nombre, titulo = excluded.titulo,
    descripcion = excluded.descripcion, orden = excluded.orden;

-- 1° Grado · Números y Operaciones
insert into temas (curso_id, orden, slug, nombre)
select c.id, 1, 'numeros-y-operaciones', 'Números y Operaciones'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '1-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'los-numeros-del-1-al-20', 'Los números del 1 al 20', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'contar-y-ordenar-hasta-el-100', 'Contar y ordenar hasta el 100', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'anterior-y-posterior', 'Anterior y posterior', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'sumas-sin-dificultad', 'Sumas sin dificultad', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'restas-sin-dificultad', 'Restas sin dificultad', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'el-cero-y-su-significado', 'El cero y su significado', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 1° Grado · Fracciones y Decimales
insert into temas (curso_id, orden, slug, nombre)
select c.id, 2, 'fracciones-y-decimales', 'Fracciones y Decimales'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '1-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'la-mitad-de-una-figura', 'La mitad de una figura', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'repartir-en-partes-iguales', 'Repartir en partes iguales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 1° Grado · Geometría
insert into temas (curso_id, orden, slug, nombre)
select c.id, 3, 'geometria', 'Geometría'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '1-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'figuras-circulo-cuadrado-triangulo', 'Figuras: círculo, cuadrado, triángulo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'cuerpos-cubo-esfera-cilindro', 'Cuerpos: cubo, esfera, cilindro', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'adentro-afuera-y-sobre-el-borde', 'Adentro, afuera y sobre el borde', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 1° Grado · Medidas
insert into temas (curso_id, orden, slug, nombre)
select c.id, 4, 'medidas', 'Medidas'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '1-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'mas-largo-y-mas-corto', 'Más largo y más corto', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'mas-pesado-y-mas-liviano', 'Más pesado y más liviano', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'los-dias-de-la-semana', 'Los días de la semana', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 1° Grado · Estadística y Probabilidad
insert into temas (curso_id, orden, slug, nombre)
select c.id, 5, 'estadistica-y-probabilidad', 'Estadística y Probabilidad'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '1-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'agrupar-y-contar-objetos', 'Agrupar y contar objetos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'leer-un-grafico-de-dibujos', 'Leer un gráfico de dibujos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 1° Grado · Álgebra
insert into temas (curso_id, orden, slug, nombre)
select c.id, 6, 'algebra', 'Álgebra'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '1-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'continuar-una-serie', 'Continuar una serie', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'buscar-el-numero-que-falta', 'Buscar el número que falta', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 1° Grado · Problemas y Desafíos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 7, 'problemas-y-desafios', 'Problemas y Desafíos'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '1-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'problemas-de-juntar', 'Problemas de juntar', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'problemas-de-quitar', 'Problemas de quitar', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'dibujar-para-resolver', 'Dibujar para resolver', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '1-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- ========================================================================
-- 2° Grado
-- ========================================================================

insert into cursos (materia_id, nivel, grado_slug, grado_nombre, titulo, descripcion, orden, publicado)
select m.id, 'primaria', '2-grado', '2° Grado', 'Matemática 2° Grado',
       'Sumar y restar con soltura, y las primeras multiplicaciones.', 2, true
from materias m where m.slug = 'matematica'
  on conflict (nivel, grado_slug, materia_id) do update set
    grado_nombre = excluded.grado_nombre, titulo = excluded.titulo,
    descripcion = excluded.descripcion, orden = excluded.orden;

-- 2° Grado · Números y Operaciones
insert into temas (curso_id, orden, slug, nombre)
select c.id, 1, 'numeros-y-operaciones', 'Números y Operaciones'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '2-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'numeros-hasta-el-1-000', 'Números hasta el 1.000', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'valor-posicional-unidad-decena-centena', 'Valor posicional: unidad, decena, centena', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'suma-con-reagrupacion', 'Suma con reagrupación', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'resta-con-reagrupacion', 'Resta con reagrupación', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'la-multiplicacion-como-suma-repetida', 'La multiplicación como suma repetida', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'tablas-del-2-3-4-y-5', 'Tablas del 2, 3, 4 y 5', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 7, 'numeros-pares-e-impares', 'Números pares e impares', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 2° Grado · Fracciones y Decimales
insert into temas (curso_id, orden, slug, nombre)
select c.id, 2, 'fracciones-y-decimales', 'Fracciones y Decimales'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '2-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'mitad-tercio-y-cuarto', 'Mitad, tercio y cuarto', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'fracciones-de-una-coleccion', 'Fracciones de una colección', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 2° Grado · Geometría
insert into temas (curso_id, orden, slug, nombre)
select c.id, 3, 'geometria', 'Geometría'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '2-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'lados-y-vertices-de-las-figuras', 'Lados y vértices de las figuras', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'figuras-simetricas', 'Figuras simétricas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'cuerpos-y-sus-caras', 'Cuerpos y sus caras', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 2° Grado · Medidas
insert into temas (curso_id, orden, slug, nombre)
select c.id, 4, 'medidas', 'Medidas'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '2-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'medir-con-centimetros', 'Medir con centímetros', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'kilogramos-y-gramos', 'Kilogramos y gramos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'leer-la-hora-en-punto-y-media', 'Leer la hora en punto y media', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'el-calendario-y-los-meses', 'El calendario y los meses', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 2° Grado · Estadística y Probabilidad
insert into temas (curso_id, orden, slug, nombre)
select c.id, 5, 'estadistica-y-probabilidad', 'Estadística y Probabilidad'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '2-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'tablas-de-conteo', 'Tablas de conteo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'grafico-de-barras-simple', 'Gráfico de barras simple', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 2° Grado · Álgebra
insert into temas (curso_id, orden, slug, nombre)
select c.id, 6, 'algebra', 'Álgebra'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '2-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'series-con-dos-pasos', 'Series con dos pasos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'igualdades-con-un-hueco', 'Igualdades con un hueco', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 2° Grado · Problemas y Desafíos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 7, 'problemas-y-desafios', 'Problemas y Desafíos'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '2-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'problemas-de-dos-operaciones', 'Problemas de dos operaciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'problemas-con-dinero', 'Problemas con dinero', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'elegir-la-operacion-correcta', 'Elegir la operación correcta', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '2-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- ========================================================================
-- 3° Grado
-- ========================================================================

insert into cursos (materia_id, nivel, grado_slug, grado_nombre, titulo, descripcion, orden, publicado)
select m.id, 'primaria', '3-grado', '3° Grado', 'Matemática 3° Grado',
       'Multiplicación, división y las primeras fracciones.', 3, true
from materias m where m.slug = 'matematica'
  on conflict (nivel, grado_slug, materia_id) do update set
    grado_nombre = excluded.grado_nombre, titulo = excluded.titulo,
    descripcion = excluded.descripcion, orden = excluded.orden;

-- 3° Grado · Números y Operaciones
insert into temas (curso_id, orden, slug, nombre)
select c.id, 1, 'numeros-y-operaciones', 'Números y Operaciones'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '3-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'numeros-hasta-el-10-000', 'Números hasta el 10.000', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'comparar-y-ordenar-numeros-grandes', 'Comparar y ordenar números grandes', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'tablas-de-multiplicar-completas', 'Tablas de multiplicar completas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'multiplicacion-por-una-cifra', 'Multiplicación por una cifra', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'la-division-como-reparto', 'La división como reparto', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'division-por-una-cifra', 'División por una cifra', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 7, 'calculo-mental-con-decenas', 'Cálculo mental con decenas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 3° Grado · Fracciones y Decimales
insert into temas (curso_id, orden, slug, nombre)
select c.id, 2, 'fracciones-y-decimales', 'Fracciones y Decimales'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '3-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'que-es-una-fraccion', 'Qué es una fracción', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'leer-y-escribir-fracciones', 'Leer y escribir fracciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'comparar-fracciones-sencillas', 'Comparar fracciones sencillas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 3° Grado · Geometría
insert into temas (curso_id, orden, slug, nombre)
select c.id, 3, 'geometria', 'Geometría'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '3-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'rectas-semirrectas-y-segmentos', 'Rectas, semirrectas y segmentos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'angulos-recto-agudo-y-obtuso', 'Ángulos: recto, agudo y obtuso', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'clasificacion-de-triangulos', 'Clasificación de triángulos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'cuadrilateros', 'Cuadriláteros', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 3° Grado · Medidas
insert into temas (curso_id, orden, slug, nombre)
select c.id, 4, 'medidas', 'Medidas'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '3-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'metro-centimetro-y-milimetro', 'Metro, centímetro y milímetro', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'litro-y-mililitro', 'Litro y mililitro', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'leer-la-hora-con-minutos', 'Leer la hora con minutos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'perimetro-de-figuras-simples', 'Perímetro de figuras simples', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 3° Grado · Estadística y Probabilidad
insert into temas (curso_id, orden, slug, nombre)
select c.id, 5, 'estadistica-y-probabilidad', 'Estadística y Probabilidad'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '3-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'interpretar-graficos-de-barras', 'Interpretar gráficos de barras', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'seguro-posible-e-imposible', 'Seguro, posible e imposible', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 3° Grado · Álgebra
insert into temas (curso_id, orden, slug, nombre)
select c.id, 6, 'algebra', 'Álgebra'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '3-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'patrones-numericos', 'Patrones numéricos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'ecuaciones-con-un-dato-desconocido', 'Ecuaciones con un dato desconocido', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 3° Grado · Problemas y Desafíos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 7, 'problemas-y-desafios', 'Problemas y Desafíos'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '3-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'problemas-de-varias-etapas', 'Problemas de varias etapas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'problemas-de-reparto', 'Problemas de reparto', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'estimar-antes-de-calcular', 'Estimar antes de calcular', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '3-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- ========================================================================
-- 4° Grado
-- ========================================================================

insert into cursos (materia_id, nivel, grado_slug, grado_nombre, titulo, descripcion, orden, publicado)
select m.id, 'primaria', '4-grado', '4° Grado', 'Matemática 4° Grado',
       'Todos los temas de matemáticas de 4to grado organizados para que aprendas paso a paso.', 4, true
from materias m where m.slug = 'matematica'
  on conflict (nivel, grado_slug, materia_id) do update set
    grado_nombre = excluded.grado_nombre, titulo = excluded.titulo,
    descripcion = excluded.descripcion, orden = excluded.orden;

-- 4° Grado · Números y Operaciones
insert into temas (curso_id, orden, slug, nombre)
select c.id, 1, 'numeros-y-operaciones', 'Números y Operaciones'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '4-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'numeros-naturales-hasta-el-100-000', 'Números naturales hasta el 100.000', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'calculos-mentales-y-aproximaciones', 'Cálculos mentales y aproximaciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'suma-y-resta', 'Suma y resta', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'multiplicacion', 'Multiplicación', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'division', 'División', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'criterios-de-divisibilidad', 'Criterios de divisibilidad', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 7, 'multiplos-y-divisores', 'Múltiplos y divisores', true, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 8, 'situaciones-problematicas', 'Situaciones problemáticas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 9, 'potencias-y-raices', 'Potencias y raíces', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 10, 'numeros-romanos', 'Números romanos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 4° Grado · Fracciones y Decimales
insert into temas (curso_id, orden, slug, nombre)
select c.id, 2, 'fracciones-y-decimales', 'Fracciones y Decimales'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '4-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'fracciones-equivalentes', 'Fracciones equivalentes', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'suma-y-resta-de-fracciones', 'Suma y resta de fracciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'numeros-decimales', 'Números decimales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'comparar-decimales', 'Comparar decimales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 4° Grado · Geometría
insert into temas (curso_id, orden, slug, nombre)
select c.id, 3, 'geometria', 'Geometría'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '4-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'rectas-paralelas-y-perpendiculares', 'Rectas paralelas y perpendiculares', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'medir-angulos-con-transportador', 'Medir ángulos con transportador', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'poligonos-y-sus-elementos', 'Polígonos y sus elementos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'circunferencia-y-circulo', 'Circunferencia y círculo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 4° Grado · Medidas
insert into temas (curso_id, orden, slug, nombre)
select c.id, 4, 'medidas', 'Medidas'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '4-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'unidades-de-longitud', 'Unidades de longitud', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'unidades-de-peso-y-capacidad', 'Unidades de peso y capacidad', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'perimetro-y-area-del-rectangulo', 'Perímetro y área del rectángulo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'medidas-de-tiempo', 'Medidas de tiempo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 4° Grado · Estadística y Probabilidad
insert into temas (curso_id, orden, slug, nombre)
select c.id, 5, 'estadistica-y-probabilidad', 'Estadística y Probabilidad'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '4-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'tablas-de-frecuencia', 'Tablas de frecuencia', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'graficos-de-barras-y-de-lineas', 'Gráficos de barras y de líneas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'promedio-simple', 'Promedio simple', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 4° Grado · Álgebra
insert into temas (curso_id, orden, slug, nombre)
select c.id, 6, 'algebra', 'Álgebra'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '4-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'propiedades-de-las-operaciones', 'Propiedades de las operaciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'expresiones-con-letras', 'Expresiones con letras', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 4° Grado · Problemas y Desafíos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 7, 'problemas-y-desafios', 'Problemas y Desafíos'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '4-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'problemas-combinados', 'Problemas combinados', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'problemas-con-fracciones', 'Problemas con fracciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'desafios-de-logica', 'Desafíos de lógica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '4-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- ========================================================================
-- 5° Grado
-- ========================================================================

insert into cursos (materia_id, nivel, grado_slug, grado_nombre, titulo, descripcion, orden, publicado)
select m.id, 'primaria', '5-grado', '5° Grado', 'Matemática 5° Grado',
       'Proporcionalidad, porcentajes y geometría del espacio.', 5, true
from materias m where m.slug = 'matematica'
  on conflict (nivel, grado_slug, materia_id) do update set
    grado_nombre = excluded.grado_nombre, titulo = excluded.titulo,
    descripcion = excluded.descripcion, orden = excluded.orden;

-- 5° Grado · Números y Operaciones
insert into temas (curso_id, orden, slug, nombre)
select c.id, 1, 'numeros-y-operaciones', 'Números y Operaciones'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '5-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'numeros-hasta-el-millon', 'Números hasta el millón', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'multiplicacion-por-dos-cifras', 'Multiplicación por dos cifras', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'division-por-dos-cifras', 'División por dos cifras', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'numeros-primos-y-compuestos', 'Números primos y compuestos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'multiplo-comun-menor', 'Múltiplo común menor', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 6, 'divisor-comun-mayor', 'Divisor común mayor', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 5° Grado · Fracciones y Decimales
insert into temas (curso_id, orden, slug, nombre)
select c.id, 2, 'fracciones-y-decimales', 'Fracciones y Decimales'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '5-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'fracciones-impropias-y-mixtas', 'Fracciones impropias y mixtas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'multiplicacion-de-fracciones', 'Multiplicación de fracciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'operaciones-con-decimales', 'Operaciones con decimales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'fraccion-decimal-y-porcentaje', 'Fracción decimal y porcentaje', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 5° Grado · Geometría
insert into temas (curso_id, orden, slug, nombre)
select c.id, 3, 'geometria', 'Geometría'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '5-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'cuerpos-geometricos-y-sus-desarrollos', 'Cuerpos geométricos y sus desarrollos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'simetria-y-traslacion', 'Simetría y traslación', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'construccion-de-triangulos', 'Construcción de triángulos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'area-del-triangulo-y-del-paralelogramo', 'Área del triángulo y del paralelogramo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 5° Grado · Medidas
insert into temas (curso_id, orden, slug, nombre)
select c.id, 4, 'medidas', 'Medidas'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '5-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'sistema-metrico-decimal', 'Sistema métrico decimal', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'volumen-y-capacidad', 'Volumen y capacidad', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'superficie-de-figuras-compuestas', 'Superficie de figuras compuestas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 5° Grado · Estadística y Probabilidad
insert into temas (curso_id, orden, slug, nombre)
select c.id, 5, 'estadistica-y-probabilidad', 'Estadística y Probabilidad'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '5-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'media-mediana-y-moda', 'Media, mediana y moda', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'graficos-circulares', 'Gráficos circulares', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'probabilidad-de-un-suceso', 'Probabilidad de un suceso', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 5° Grado · Álgebra
insert into temas (curso_id, orden, slug, nombre)
select c.id, 6, 'algebra', 'Álgebra'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '5-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'proporcionalidad-directa', 'Proporcionalidad directa', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'regla-de-tres-simple', 'Regla de tres simple', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'porcentajes', 'Porcentajes', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 5° Grado · Problemas y Desafíos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 7, 'problemas-y-desafios', 'Problemas y Desafíos'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '5-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'problemas-de-proporcionalidad', 'Problemas de proporcionalidad', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'problemas-con-porcentajes', 'Problemas con porcentajes', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'desafios-de-razonamiento', 'Desafíos de razonamiento', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '5-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- ========================================================================
-- 6° Grado
-- ========================================================================

insert into cursos (materia_id, nivel, grado_slug, grado_nombre, titulo, descripcion, orden, publicado)
select m.id, 'primaria', '6-grado', '6° Grado', 'Matemática 6° Grado',
       'Números enteros, razones y el paso previo al álgebra.', 6, true
from materias m where m.slug = 'matematica'
  on conflict (nivel, grado_slug, materia_id) do update set
    grado_nombre = excluded.grado_nombre, titulo = excluded.titulo,
    descripcion = excluded.descripcion, orden = excluded.orden;

-- 6° Grado · Números y Operaciones
insert into temas (curso_id, orden, slug, nombre)
select c.id, 1, 'numeros-y-operaciones', 'Números y Operaciones'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '6-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'numeros-enteros-positivos-y-negativos', 'Números enteros: positivos y negativos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'recta-numerica-con-enteros', 'Recta numérica con enteros', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'operaciones-combinadas', 'Operaciones combinadas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'potencias-y-notacion', 'Potencias y notación', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'raiz-cuadrada-exacta', 'Raíz cuadrada exacta', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 6° Grado · Fracciones y Decimales
insert into temas (curso_id, orden, slug, nombre)
select c.id, 2, 'fracciones-y-decimales', 'Fracciones y Decimales'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '6-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'division-de-fracciones', 'División de fracciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'operaciones-combinadas-con-fracciones', 'Operaciones combinadas con fracciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'decimales-periodicos', 'Decimales periódicos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'pasar-de-fraccion-a-decimal', 'Pasar de fracción a decimal', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 6° Grado · Geometría
insert into temas (curso_id, orden, slug, nombre)
select c.id, 3, 'geometria', 'Geometría'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '6-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'angulos-entre-paralelas', 'Ángulos entre paralelas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'teorema-de-pitagoras-introduccion', 'Teorema de Pitágoras: introducción', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'area-del-circulo', 'Área del círculo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'volumen-de-prismas', 'Volumen de prismas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 6° Grado · Medidas
insert into temas (curso_id, orden, slug, nombre)
select c.id, 4, 'medidas', 'Medidas'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '6-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'equivalencias-entre-unidades', 'Equivalencias entre unidades', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'escalas-y-planos', 'Escalas y planos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'superficie-y-volumen-en-problemas', 'Superficie y volumen en problemas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 6° Grado · Estadística y Probabilidad
insert into temas (curso_id, orden, slug, nombre)
select c.id, 5, 'estadistica-y-probabilidad', 'Estadística y Probabilidad'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '6-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'muestras-y-poblaciones', 'Muestras y poblaciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'interpretar-graficos-estadisticos', 'Interpretar gráficos estadísticos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'probabilidad-con-fracciones', 'Probabilidad con fracciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 6° Grado · Álgebra
insert into temas (curso_id, orden, slug, nombre)
select c.id, 6, 'algebra', 'Álgebra'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '6-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'lenguaje-algebraico', 'Lenguaje algebraico', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'ecuaciones-de-primer-grado', 'Ecuaciones de primer grado', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'razones-y-proporciones', 'Razones y proporciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'proporcionalidad-inversa', 'Proporcionalidad inversa', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 6° Grado · Problemas y Desafíos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 7, 'problemas-y-desafios', 'Problemas y Desafíos'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '6-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'problemas-con-ecuaciones', 'Problemas con ecuaciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'problemas-de-escala', 'Problemas de escala', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'desafios-de-combinatoria', 'Desafíos de combinatoria', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '6-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- ========================================================================
-- 7° Grado
-- ========================================================================

insert into cursos (materia_id, nivel, grado_slug, grado_nombre, titulo, descripcion, orden, publicado)
select m.id, 'primaria', '7-grado', '7° Grado', 'Matemática 7° Grado',
       'El cierre de la primaria y la preparación para el secundario.', 7, true
from materias m where m.slug = 'matematica'
  on conflict (nivel, grado_slug, materia_id) do update set
    grado_nombre = excluded.grado_nombre, titulo = excluded.titulo,
    descripcion = excluded.descripcion, orden = excluded.orden;

-- 7° Grado · Números y Operaciones
insert into temas (curso_id, orden, slug, nombre)
select c.id, 1, 'numeros-y-operaciones', 'Números y Operaciones'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '7-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'numeros-racionales', 'Números racionales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'operaciones-con-racionales', 'Operaciones con racionales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'potencias-de-exponente-negativo', 'Potencias de exponente negativo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'notacion-cientifica', 'Notación científica', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 5, 'aproximacion-y-redondeo', 'Aproximación y redondeo', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'numeros-y-operaciones'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 7° Grado · Fracciones y Decimales
insert into temas (curso_id, orden, slug, nombre)
select c.id, 2, 'fracciones-y-decimales', 'Fracciones y Decimales'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '7-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'orden-en-los-racionales', 'Orden en los racionales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'operaciones-combinadas-con-racionales', 'Operaciones combinadas con racionales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'problemas-con-fracciones-y-decimales', 'Problemas con fracciones y decimales', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'fracciones-y-decimales'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 7° Grado · Geometría
insert into temas (curso_id, orden, slug, nombre)
select c.id, 3, 'geometria', 'Geometría'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '7-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'teorema-de-pitagoras-aplicaciones', 'Teorema de Pitágoras: aplicaciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'cuerpos-redondos', 'Cuerpos redondos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'area-y-volumen-de-cilindros', 'Área y volumen de cilindros', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'semejanza-de-figuras', 'Semejanza de figuras', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'geometria'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 7° Grado · Medidas
insert into temas (curso_id, orden, slug, nombre)
select c.id, 4, 'medidas', 'Medidas'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '7-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'unidades-de-superficie-y-volumen', 'Unidades de superficie y volumen', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'medidas-de-angulos-en-grados-y-minutos', 'Medidas de ángulos en grados y minutos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'problemas-de-medida', 'Problemas de medida', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'medidas'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 7° Grado · Estadística y Probabilidad
insert into temas (curso_id, orden, slug, nombre)
select c.id, 5, 'estadistica-y-probabilidad', 'Estadística y Probabilidad'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '7-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'frecuencia-absoluta-y-relativa', 'Frecuencia absoluta y relativa', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'medidas-de-dispersion', 'Medidas de dispersión', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'probabilidad-de-sucesos-compuestos', 'Probabilidad de sucesos compuestos', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'estadistica-y-probabilidad'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 7° Grado · Álgebra
insert into temas (curso_id, orden, slug, nombre)
select c.id, 6, 'algebra', 'Álgebra'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '7-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'ecuaciones-con-parentesis', 'Ecuaciones con paréntesis', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'inecuaciones-sencillas', 'Inecuaciones sencillas', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'funciones-y-su-grafico', 'Funciones y su gráfico', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 4, 'sistemas-de-dos-ecuaciones', 'Sistemas de dos ecuaciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'algebra'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

-- 7° Grado · Problemas y Desafíos
insert into temas (curso_id, orden, slug, nombre)
select c.id, 7, 'problemas-y-desafios', 'Problemas y Desafíos'
from cursos c where c.nivel = 'primaria' and c.grado_slug = '7-grado'
  on conflict (curso_id, slug) do update set
    nombre = excluded.nombre, orden = excluded.orden;

insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 1, 'problemas-de-preparacion-al-secundario', 'Problemas de preparación al secundario', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 2, 'problemas-con-funciones', 'Problemas con funciones', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;
insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)
select t.curso_id, t.id, 3, 'desafios-integradores', 'Desafíos integradores', false, true
from temas t join cursos c on c.id = t.curso_id
where c.nivel = 'primaria' and c.grado_slug = '7-grado' and t.slug = 'problemas-y-desafios'
  on conflict (curso_id, slug) do update set
    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;

