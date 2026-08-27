'use server'

import { z } from 'zod'
import { getContenidoParaCorregir } from '@/lib/contenido'
import { esCorrecta, type Respuesta } from '@/lib/correccion'
import type { Medio } from '@/lib/schemas'

/**
 * Corrección del lado del servidor.
 *
 * Antes esto pasaba en el navegador, lo que obligaba a mandarle las respuestas.
 * No hacía falta ni abrir las herramientas de desarrollo: con Ctrl+U el HTML
 * mostraba `respuestaCorrecta":"86.6` y el índice correcto de cada pregunta.
 *
 * QUÉ RESUELVE Y QUÉ NO. Las respuestas dejan de estar a la vista, pero no se
 * vuelven secretas: cualquiera puede llamar a estas acciones probando opciones
 * hasta que una dé "correcta", y en un multiple choice de cuatro son cuatro
 * intentos. Pasan de gratis a costosas, que es una diferencia real pero
 * limitada. La protección de verdad para contenido pago es no servirle el
 * contenido a quien no compró; esto es la otra mitad, y hace falta igual.
 *
 * No se guarda nada acá. El resultado se lo queda el navegador, igual que
 * antes: son ejercicios de autoevaluación, no notas.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Dirección inválida')
const indice = z.number().int().min(0).max(200)
const id = z.number().int().positive().max(10_000)

type Fallo = { ok: false; error: string }

const NO_ENCONTRADO: Fallo = {
  ok: false,
  error: 'No encontramos ese ejercicio. Probá recargar la página.',
}

/** Corrige un ejercicio de un trabajo práctico. */
export async function corregirEjercicio(
  materiaSlug: string,
  claseSlug: string,
  tpIndice: number,
  ejercicioId: number,
  respuesta: Respuesta,
): Promise<
  { ok: true; correcta: boolean; explicacion: string; medios?: Medio[] } | Fallo
> {
  const entrada = z
    .object({
      materiaSlug: slug,
      claseSlug: slug,
      tpIndice: indice,
      ejercicioId: id,
      // Se acepta lo que mande el cliente sin interpretarlo: la respuesta es
      // texto del alumno. Lo que se acota es el tamaño, para que nadie mande
      // un megabyte por llamada.
      respuesta: z.union([
        z.string().max(2000),
        z.array(z.string().max(2000)).max(50),
      ]),
    })
    .safeParse({ materiaSlug, claseSlug, tpIndice, ejercicioId, respuesta })

  if (!entrada.success) return { ok: false, error: 'Datos inválidos.' }

  const contenido = await getContenidoParaCorregir(entrada.data.materiaSlug, entrada.data.claseSlug)
  if (!contenido) return NO_ENCONTRADO

  const practico = contenido.practicos[entrada.data.tpIndice]
  const ejercicio = practico?.ejercicios.find(e => e.id === entrada.data.ejercicioId)
  if (!ejercicio) return NO_ENCONTRADO

  return {
    ok: true,
    correcta: esCorrecta(ejercicio, entrada.data.respuesta),
    // La devolución y sus imágenes salen del servidor recién ahora, cuando el
    // alumno ya respondió. Antes de este momento no existen para el navegador.
    explicacion: ejercicio.explicacion,
    ...(ejercicio.mediosExplicacion?.length ? { medios: ejercicio.mediosExplicacion } : {}),
  }
}

/**
 * Corrige una pregunta de una evaluación.
 *
 * Devuelve cuál era la correcta, porque la pantalla la resalta apenas el alumno
 * elige: es la devolución inmediata de siempre. Eso significa que se puede
 * sacar una respuesta por intento — el costo de enseñar en el momento en vez de
 * al final. Si algún día las evaluaciones cuentan para una nota, hay que
 * corregirlas enteras al entregar y no pregunta por pregunta.
 */
export async function corregirPregunta(
  materiaSlug: string,
  claseSlug: string,
  evalIndice: number,
  preguntaId: number,
  elegida: number,
): Promise<
  | { ok: true; correcta: boolean; correctaIndex: number; explicacion: string; medios?: Medio[] }
  | Fallo
> {
  const entrada = z
    .object({
      materiaSlug: slug,
      claseSlug: slug,
      evalIndice: indice,
      preguntaId: id,
      elegida: z.number().int().min(0).max(50),
    })
    .safeParse({ materiaSlug, claseSlug, evalIndice, preguntaId, elegida })

  if (!entrada.success) return { ok: false, error: 'Datos inválidos.' }

  const contenido = await getContenidoParaCorregir(entrada.data.materiaSlug, entrada.data.claseSlug)
  if (!contenido) return NO_ENCONTRADO

  const evaluacion = contenido.evaluaciones[entrada.data.evalIndice]
  const pregunta = evaluacion?.preguntas.find(p => p.id === entrada.data.preguntaId)
  if (!pregunta) return NO_ENCONTRADO

  return {
    ok: true,
    correcta: entrada.data.elegida === pregunta.respuestaCorrectaIndex,
    correctaIndex: pregunta.respuestaCorrectaIndex,
    explicacion: pregunta.explicacion,
    ...(pregunta.mediosExplicacion?.length ? { medios: pregunta.mediosExplicacion } : {}),
  }
}
