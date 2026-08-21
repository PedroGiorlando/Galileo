-- Migración 004 — videos, trabajos prácticos y evaluaciones
--
-- NO borra contenido: transforma el que ya existe a la forma nueva.
--
-- QUÉ CAMBIA
--
-- Antes una clase tenía una lista suelta de ejercicios y un quiz. Ahora tiene
-- varios trabajos prácticos y varias evaluaciones, cada uno con los suyos, que
-- es como se dicta de verdad: TP 1, TP 2, Evaluación 1.
--
-- Además gana `videos`: una clase puede tener varios, cada uno con su título y
-- subtítulo, y los ejemplos resueltos pueden apuntar a un video y a un minuto
-- exacto.
--
-- El contenido que ya estaba se envuelve: los ejercicios sueltos pasan a ser el
-- Trabajo práctico 1, y el quiz pasa a ser la Evaluación 1. No se pierde nada.

begin;

update clases
set contenido =
  (contenido - 'ejercicios' - 'quiz')
  || jsonb_build_object(
       'videos', coalesce(contenido -> 'videos', '[]'::jsonb),
       'practicos',
         case
           when jsonb_array_length(coalesce(contenido -> 'ejercicios', '[]'::jsonb)) > 0
           then jsonb_build_array(
                  jsonb_build_object('ejercicios', contenido -> 'ejercicios')
                )
           else '[]'::jsonb
         end,
       'evaluaciones',
         case
           when jsonb_array_length(coalesce(contenido -> 'quiz', '[]'::jsonb)) > 0
           then jsonb_build_array(
                  jsonb_build_object('preguntas', contenido -> 'quiz')
                )
           else '[]'::jsonb
         end
     )
where contenido is not null
  and (contenido ? 'ejercicios' or contenido ? 'quiz');

-- `video_url` guardaba un único video por clase. Ahora los videos viven dentro
-- de `contenido`, así que la columna sobra: dos lugares para el mismo dato es
-- garantía de que algún día digan cosas distintas.
alter table clases drop column if exists video_url;

commit;
