import type { Evaluacion, Medio } from './schemas'

/**
 * Las cuentas del examen, separadas de la base y de la red para poder probarlas.
 *
 * Todo lo que hay acá decide si un alumno pierde o no un examen: si `vencido`
 * se adelanta un segundo, alguien se queda afuera; si se atrasa, el reloj no
 * significa nada. Es la clase de error que no da ningún síntoma hasta que pasa
 * con una persona real, así que va en un archivo sin dependencias, donde se
 * puede verificar con un reloj de mentira.
 *
 * `ahora` es un parámetro y no `Date.now()` adentro por eso mismo: sin poder
 * elegir la hora no hay forma de probar el vencimiento sin esperar 45 minutos.
 */

/**
 * Margen para la red. Una entrega que llega tres segundos tarde es la conexión
 * del alumno, no una trampa; rechazarla genera un mensaje de WhatsApp al
 * profesor que no arregla nada.
 */
export const GRACIA_SEGUNDOS = 15

export type ReglasExamen = {
  titulo?: string
  dificultad?: string
  minutos?: number
  intentosPermitidos?: number
  cantidadPreguntas: number
}

export type PreguntaRevisada = {
  id: number
  pregunta: string
  opciones: string[]
  medios?: Medio[]
  /** Qué eligió. `null` si se quedó sin tiempo antes de llegar. */
  elegida: number | null
  correctaIndex: number
  correcta: boolean
  explicacion: string
  mediosExplicacion?: Medio[]
}

export type ResultadoExamen = {
  puntaje: number
  total: number
  /** Cuánto tardó de verdad, medido por el servidor. */
  segundos: number
  /** Si se cerró por vencimiento y no porque el alumno apretó entregar. */
  porVencimiento: boolean
  detalle: PreguntaRevisada[]
}

/** Segundos desde que empezó. Nunca negativo, ni con relojes desfasados. */
export function transcurrido(comenzadoEn: string, ahora: number = Date.now()): number {
  return Math.max(0, Math.round((ahora - new Date(comenzadoEn).getTime()) / 1000))
}

/**
 * Lo que se le muestra al alumno. `null` cuando la evaluación no tiene reloj.
 *
 * Se manda "te quedan N segundos" y nunca "vence a las 20:27": cambiar la hora
 * de la computadora es más fácil que abrir las herramientas de desarrollo.
 */
export function restantes(
  comenzadoEn: string,
  minutos?: number,
  ahora: number = Date.now(),
): number | null {
  if (!minutos) return null
  return Math.max(0, minutos * 60 - transcurrido(comenzadoEn, ahora))
}

/**
 * Si ya no se le puede aceptar nada más.
 *
 * Ojo con la diferencia: el alumno ve el cero en `restantes`, pero recién se
 * considera vencido pasado el margen de gracia. Entre esos dos momentos, una
 * entrega que salió a tiempo y tardó en llegar todavía se acepta.
 */
export function vencido(
  comenzadoEn: string,
  minutos?: number,
  ahora: number = Date.now(),
): boolean {
  if (!minutos) return false
  return transcurrido(comenzadoEn, ahora) > minutos * 60 + GRACIA_SEGUNDOS
}

/**
 * Si el intento se cerró porque se acabó el tiempo, y no porque el alumno
 * apretó Entregar.
 *
 * OJO: NO es lo mismo que `vencido`, y confundirlas fue un bug real. Son dos
 * preguntas distintas:
 *
 *   vencido()          ¿todavía le acepto una entrega?   → CON margen de gracia
 *   seAcaboElTiempo()  ¿se le acabó el tiempo?           → SIN margen
 *
 * El examen se entrega solo al llegar a cero, o sea a los 120s de uno de dos
 * minutos. Con el margen de 15s, `vencido` daba falso, y la pantalla decía
 * "Tardaste 2:01" como si hubiera entregado tranquilo. El margen existe para
 * perdonar el viaje por la red, no para cambiar lo que se le dice al alumno.
 */
export function seAcaboElTiempo(segundosUsados: number, minutos?: number): boolean {
  if (!minutos) return false
  return segundosUsados >= minutos * 60
}

export function reglasDe(ev: Evaluacion): ReglasExamen {
  return {
    ...(ev.titulo ? { titulo: ev.titulo } : {}),
    ...(ev.dificultad ? { dificultad: ev.dificultad } : {}),
    ...(ev.tiempoLimiteMinutos ? { minutos: ev.tiempoLimiteMinutos } : {}),
    ...(ev.intentos ? { intentosPermitidos: ev.intentos } : {}),
    cantidadPreguntas: ev.preguntas.length,
  }
}

/**
 * Corrige lo respondido contra el contenido.
 *
 * Lo que no se respondió cuenta como incorrecto, no se saltea: si el alumno se
 * quedó sin tiempo en la 6 de 10, la nota es sobre 10. Un examen entregado a
 * medias no se califica sobre lo que llegó a hacer.
 */
export function calificar(ev: Evaluacion, respuestas: Record<string, number>) {
  const detalle: PreguntaRevisada[] = ev.preguntas.map(p => {
    const elegida = respuestas[String(p.id)]
    const respondida = typeof elegida === 'number'

    return {
      id: p.id,
      pregunta: p.pregunta,
      opciones: p.opciones,
      ...(p.medios ? { medios: p.medios } : {}),
      elegida: respondida ? elegida : null,
      correctaIndex: p.respuestaCorrectaIndex,
      correcta: respondida && elegida === p.respuestaCorrectaIndex,
      explicacion: p.explicacion,
      ...(p.mediosExplicacion ? { mediosExplicacion: p.mediosExplicacion } : {}),
    }
  })

  return { detalle, puntaje: detalle.filter(d => d.correcta).length, total: ev.preguntas.length }
}
