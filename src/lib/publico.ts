import type { SubtemaCompleto } from '@/data/topicData'
import type { Ejercicio, PreguntaQuiz } from './schemas'

/**
 * La versión de una clase que puede ver el navegador.
 *
 * EL PROBLEMA QUE RESUELVE: hasta acá, la página mandaba el contenido entero al
 * cliente, respuestas incluidas. No hacía falta F12 ni saber nada: con Ctrl+U
 * el HTML mostraba, en texto plano, `respuestaCorrecta":"86.6` y un
 * `respuestaCorrectaIndex` por cada pregunta de cada evaluación. El examen
 * venía resuelto adentro de la página.
 *
 * ESTÁ ESCRITO COMO LISTA BLANCA A PROPÓSITO. La tentación es hacer
 * `Omit<Ejercicio, 'respuestaCorrecta'>` y borrar la clave: es menos código y
 * es peligroso, porque el día que alguien agregue un campo nuevo al schema
 * —una pista, una solución paso a paso— va a viajar al navegador sin que nadie
 * lo decida. Acá, un campo que no esté nombrado explícitamente no sale. Que
 * agregar un campo público cueste una línea es el precio de que agregar uno
 * secreto no cueste un descuido.
 *
 * `explicacion` también se va: casi siempre contiene la respuesta ("la
 * componente en x se calcula con el coseno..."). Vuelve del servidor recién
 * cuando el alumno ya respondió.
 */

export type EjercicioPublico =
  | { id: number; enunciado: string; puntos: number; tipo: 'libre' }
  | { id: number; enunciado: string; puntos: number; tipo: 'si-no' }
  | { id: number; enunciado: string; puntos: number; tipo: 'multiple'; opciones: string[] }

export type PreguntaPublica = { id: number; pregunta: string; opciones: string[] }

export type TrabajoPracticoPublico = { titulo?: string; ejercicios: EjercicioPublico[] }
export type EvaluacionPublica = { titulo?: string; preguntas: PreguntaPublica[] }

export type SubtemaPublico = Omit<SubtemaCompleto, 'practicos' | 'evaluaciones'> & {
  practicos: TrabajoPracticoPublico[]
  evaluaciones: EvaluacionPublica[]
}

function ejercicioPublico(e: Ejercicio): EjercicioPublico {
  const base = { id: e.id, enunciado: e.enunciado, puntos: e.puntos }
  return e.tipo === 'multiple'
    ? { ...base, tipo: 'multiple', opciones: e.opciones }
    : { ...base, tipo: e.tipo }
}

function preguntaPublica(p: PreguntaQuiz): PreguntaPublica {
  return { id: p.id, pregunta: p.pregunta, opciones: p.opciones }
}

/** Saca todo lo que no debería llegar al navegador. */
export function sinRespuestas(clase: SubtemaCompleto): SubtemaPublico {
  return {
    ...clase,
    practicos: clase.practicos.map(p => ({
      ...(p.titulo ? { titulo: p.titulo } : {}),
      ejercicios: p.ejercicios.map(ejercicioPublico),
    })),
    evaluaciones: clase.evaluaciones.map(ev => ({
      ...(ev.titulo ? { titulo: ev.titulo } : {}),
      preguntas: ev.preguntas.map(preguntaPublica),
    })),
  }
}
