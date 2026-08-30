import type { SubtemaCompleto } from '@/data/topicData'
import type { Ejercicio, Medio, PreguntaQuiz } from './schemas'

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

type Comun = { id: number; enunciado: string; puntos: number; medios?: Medio[] }

export type EjercicioPublico =
  | (Comun & { tipo: 'libre' })
  | (Comun & { tipo: 'si-no' })
  | (Comun & { tipo: 'multiple'; opciones: string[] })

export type PreguntaPublica = {
  id: number
  pregunta: string
  opciones: string[]
  medios?: Medio[]
}

export type TrabajoPracticoPublico = { titulo?: string; ejercicios: EjercicioPublico[] }

/**
 * Las reglas del examen SÍ viajan: son exactamente lo que el alumno tiene que
 * saber antes de apretar Comenzar. Cuánto dura, qué dificultad tiene y cuántos
 * intentos le quedan no es información secreta, es el trato.
 *
 * El tiempo igual lo controla el servidor: esto es lo que se muestra, no lo
 * que se verifica.
 */
export type EvaluacionPublica = {
  titulo?: string
  dificultad?: 'Básico' | 'Intermedio' | 'Avanzado'
  tiempoLimiteMinutos?: number
  intentos?: number
  preguntas: PreguntaPublica[]
}

export type SubtemaPublico = Omit<SubtemaCompleto, 'practicos' | 'evaluaciones'> & {
  practicos: TrabajoPracticoPublico[]
  evaluaciones: EvaluacionPublica[]
}

function ejercicioPublico(e: Ejercicio): EjercicioPublico {
  // `medios` sí (es el dibujo del enunciado, sin él no se puede resolver).
  // `mediosExplicacion` NO: es parte de la devolución y vuelve del servidor
  // recién cuando el alumno ya respondió. Un croquis con la resolución al lado
  // del enunciado es la respuesta servida en bandeja.
  const base = { id: e.id, enunciado: e.enunciado, puntos: e.puntos, ...soloSiHay(e.medios) }
  return e.tipo === 'multiple'
    ? { ...base, tipo: 'multiple', opciones: e.opciones }
    : { ...base, tipo: e.tipo }
}

function preguntaPublica(p: PreguntaQuiz): PreguntaPublica {
  return { id: p.id, pregunta: p.pregunta, opciones: p.opciones, ...soloSiHay(p.medios) }
}

/** Evita escribir `medios: undefined`, que al serializar ensucia el JSON. */
function soloSiHay(m: Medio[] | undefined) {
  return m && m.length > 0 ? { medios: m } : {}
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
      ...(ev.dificultad ? { dificultad: ev.dificultad } : {}),
      ...(ev.tiempoLimiteMinutos ? { tiempoLimiteMinutos: ev.tiempoLimiteMinutos } : {}),
      ...(ev.intentos ? { intentos: ev.intentos } : {}),
      preguntas: ev.preguntas.map(preguntaPublica),
    })),
  }
}
