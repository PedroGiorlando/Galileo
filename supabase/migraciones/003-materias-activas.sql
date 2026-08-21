-- Migración 003 — materias que se pueden apagar sin borrarlas
--
-- NO borra nada. Agrega una columna y apaga Química.
--
-- Química queda fuera del alcance por ahora, pero sus 7 módulos y 29 clases se
-- conservan: el día que entre un profesor de Química, se prende la materia y
-- todo el esqueleto ya está. Borrarla obligaría a recargar el currículum.

begin;

alter table materias add column if not exists activa boolean not null default true;

update materias set activa = false where slug = 'quimica';

-- Sin curso, una materia no aparece en ninguna carrera aunque esté activa. Se
-- despublica el de Química para que no quede colgado.
update cursos set publicado = false
where materia_id in (select id from materias where slug = 'quimica');

commit;
