'use server'

import { z } from 'zod'
import { supabaseSesion } from '@/lib/supabase-servidor'
import { getClaseConRespuestas, getContenidoPorId } from '@/lib/contenido'
import type { Evaluacion } from '@/lib/schemas'
import {
  calificar,
  reglasDe,
  restantes,
  transcurrido,
  vencido,
  type ReglasExamen,
  type ResultadoExamen,
} from '@/lib/examen'

export type { ResultadoExamen } from '@/lib/examen'

/**
 * Rendir una evaluación con tiempo y con intentos contados.
 *
 * LA IDEA QUE ORDENA TODO ESTE ARCHIVO: el reloj vive acá, no en el navegador.
 *
 * Un contador en la pantalla no es un límite de tiempo, es una sugerencia: se
 * pausa con las herramientas de desarrollo y se reinicia recargando la página.
 * Lo único que cuenta es `comenzado_en`, que anota el servidor al empezar. El
 * número que baja en la pantalla del alumno es cosmético — se lo manda el
 * servidor y el navegador solo lo muestra.
 *
 * Por eso también se manda "te quedan N segundos" y nunca "esto vence a las
 * 20:27": cambiar la hora de la computadora es más fácil que abrir las
 * herramientas de desarrollo.
 *
 * Las respuestas se guardan de a una, no al entregar. Si se corta la luz en la
 * pregunta 9 no se pierden las 8 anteriores, y es lo que permite cerrar el
 * intento con lo que haya cuando se acaba el tiempo.
 *
 * La verificación de que cada quien toque solo sus intentos NO está en estas
 * consultas: está en la política `intentos_propios` de la base. Se usa el
 * cliente con sesión a propósito, así un `where` olvidado no alcanza para
 * llegar al intento de otra persona.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Dirección inválida')
const indice = z.number().int().min(0).max(200)
const id = z.number().int().positive().max(1_000_000)

type Fallo = { ok: false; error: string; necesitaCuenta?: true }

const SIN_CUENTA: Fallo = {
  ok: false,
  error: 'Para rendir una evaluación con tiempo necesitás una cuenta.',
  necesitaCuenta: true,
}

const NO_ENCONTRADO: Fallo = { ok: false, error: 'No encontramos esa evaluación.' }

interface FilaIntento {
  id: number
  clase_id: number
  eval_indice: number
  comenzado_en: string
  entregado_en: string | null
  respuestas: Record<string, number>
}

// --- Acciones ----------------------------------------------------------------

/**
 * Lo que se muestra ANTES de empezar: a qué se está metiendo el alumno y si
 * todavía le quedan intentos.
 */
export async function estadoExamen(
  materiaSlug: string,
  claseSlug: string,
  evalIndice: number,
): Promise<
  | {
      ok: true
      reglas: ReglasExamen
      usados: number
      mejor: number | null
      /** Un intento sin entregar, si lo dejó a medias. */
      enCurso: { intentoId: number; segundosRestantes: number | null } | null
    }
  | Fallo
> {
  const entrada = z
    .object({ materiaSlug: slug, claseSlug: slug, evalIndice: indice })
    .safeParse({ materiaSlug, claseSlug, evalIndice })
  if (!entrada.success) return { ok: false, error: 'Datos inválidos.' }

  const db = await supabaseSesion()
  const { data: sesion } = await db.auth.getUser()
  if (!sesion.user) return SIN_CUENTA

  const clase = await getClaseConRespuestas(entrada.data.materiaSlug, entrada.data.claseSlug)
  const ev = clase?.contenido.evaluaciones[entrada.data.evalIndice]
  if (!clase || !ev) return NO_ENCONTRADO

  const { data: filas } = await db
    .from('intentos')
    .select('id, clase_id, eval_indice, comenzado_en, entregado_en, respuestas, puntaje')
    .eq('clase_id', clase.id)
    .eq('eval_indice', entrada.data.evalIndice)
    .order('comenzado_en')

  const intentos = (filas ?? []) as (FilaIntento & { puntaje: number | null })[]

  // Si dejó uno abierto y ya se le pasó el tiempo, se cierra ahora con lo que
  // haya. Si no, quedaría abierto para siempre bloqueando el índice único.
  const abierto = intentos.find(i => !i.entregado_en)
  if (abierto && vencido(abierto.comenzado_en, ev.tiempoLimiteMinutos)) {
    await cerrar(db, abierto, ev)
    return estadoExamen(materiaSlug, claseSlug, evalIndice)
  }

  const terminados = intentos.filter(i => i.entregado_en)
  const puntajes = terminados.map(i => i.puntaje).filter((p): p is number => p !== null)

  return {
    ok: true,
    reglas: reglasDe(ev),
    usados: terminados.length,
    mejor: puntajes.length > 0 ? Math.max(...puntajes) : null,
    enCurso: abierto
      ? {
          intentoId: abierto.id,
          segundosRestantes: restantes(abierto.comenzado_en, ev.tiempoLimiteMinutos),
        }
      : null,
  }
}

/** Empezar a rendir. Acá es donde el servidor anota la hora. */
export async function comenzarExamen(
  materiaSlug: string,
  claseSlug: string,
  evalIndice: number,
): Promise<{ ok: true; intentoId: number; segundosRestantes: number | null } | Fallo> {
  const entrada = z
    .object({ materiaSlug: slug, claseSlug: slug, evalIndice: indice })
    .safeParse({ materiaSlug, claseSlug, evalIndice })
  if (!entrada.success) return { ok: false, error: 'Datos inválidos.' }

  const db = await supabaseSesion()
  const { data: sesion } = await db.auth.getUser()
  if (!sesion.user) return SIN_CUENTA

  const clase = await getClaseConRespuestas(entrada.data.materiaSlug, entrada.data.claseSlug)
  const ev = clase?.contenido.evaluaciones[entrada.data.evalIndice]
  if (!clase || !ev) return NO_ENCONTRADO

  const estado = await estadoExamen(materiaSlug, claseSlug, evalIndice)
  if (!estado.ok) return estado

  // Si ya tenía uno abierto se retoma, no se crea otro. Es el caso de recargar
  // la página o volver desde el celular: el reloj sigue donde estaba.
  if (estado.enCurso) {
    return {
      ok: true,
      intentoId: estado.enCurso.intentoId,
      segundosRestantes: estado.enCurso.segundosRestantes,
    }
  }

  if (ev.intentos && estado.usados >= ev.intentos) {
    return {
      ok: false,
      error: `Ya usaste los ${ev.intentos} ${ev.intentos === 1 ? 'intento' : 'intentos'} de esta evaluación.`,
    }
  }

  const { data, error } = await db
    .from('intentos')
    .insert({
      user_id: sesion.user.id,
      clase_id: clase.id,
      eval_indice: entrada.data.evalIndice,
      total: ev.preguntas.length,
    })
    .select('id, comenzado_en')
    .single()

  if (error || !data) {
    // 23505 es el índice único de "un solo intento abierto": dos clics
    // seguidos en Comenzar. El segundo encuentra el que creó el primero.
    if (error?.code === '23505') return comenzarExamen(materiaSlug, claseSlug, evalIndice)
    return { ok: false, error: 'No pudimos empezar la evaluación. Probá de nuevo.' }
  }

  return {
    ok: true,
    intentoId: data.id,
    segundosRestantes: restantes(data.comenzado_en, ev.tiempoLimiteMinutos),
  }
}

/**
 * Guardar una respuesta.
 *
 * No devuelve si estuvo bien: en un examen la devolución va al final. Si
 * corrigiera pregunta por pregunta, la revisión del final no revisaría nada.
 */
export async function guardarRespuestaExamen(
  intentoId: number,
  preguntaId: number,
  elegida: number,
): Promise<{ ok: true; segundosRestantes: number | null } | (Fallo & { vencido?: true })> {
  const entrada = z
    .object({ intentoId: id, preguntaId: id, elegida: z.number().int().min(0).max(50) })
    .safeParse({ intentoId, preguntaId, elegida })
  if (!entrada.success) return { ok: false, error: 'Datos inválidos.' }

  const db = await supabaseSesion()
  const { data: sesion } = await db.auth.getUser()
  if (!sesion.user) return SIN_CUENTA

  const intento = await leerIntento(db, entrada.data.intentoId)
  if (!intento) return NO_ENCONTRADO
  if (intento.entregado_en) return { ok: false, error: 'Esta evaluación ya está entregada.' }

  const ev = await evaluacionDe(intento)
  if (!ev) return NO_ENCONTRADO

  if (vencido(intento.comenzado_en, ev.tiempoLimiteMinutos)) {
    await cerrar(db, intento, ev)
    return { ok: false, error: 'Se acabó el tiempo.', vencido: true }
  }

  const { error } = await db
    .from('intentos')
    .update({
      respuestas: { ...intento.respuestas, [String(entrada.data.preguntaId)]: entrada.data.elegida },
    })
    .eq('id', intento.id)

  if (error) return { ok: false, error: 'No pudimos guardar la respuesta.' }

  return { ok: true, segundosRestantes: restantes(intento.comenzado_en, ev.tiempoLimiteMinutos) }
}

/**
 * Entregar y ver el resultado.
 *
 * Es idempotente: volver a llamarla sobre un intento ya entregado devuelve la
 * misma revisión. Así el alumno puede volver mañana a mirar en qué se
 * equivocó, y recargar la página de resultados no rompe nada.
 */
export async function entregarExamen(
  intentoId: number,
): Promise<{ ok: true; resultado: ResultadoExamen } | Fallo> {
  const entrada = z.object({ intentoId: id }).safeParse({ intentoId })
  if (!entrada.success) return { ok: false, error: 'Datos inválidos.' }

  const db = await supabaseSesion()
  const { data: sesion } = await db.auth.getUser()
  if (!sesion.user) return SIN_CUENTA

  const intento = await leerIntento(db, entrada.data.intentoId)
  if (!intento) return NO_ENCONTRADO

  const ev = await evaluacionDe(intento)
  if (!ev) return NO_ENCONTRADO

  const seVencio = vencido(intento.comenzado_en, ev.tiempoLimiteMinutos)

  if (!intento.entregado_en) await cerrar(db, intento, ev)

  const { detalle, puntaje, total } = calificar(ev, intento.respuestas)

  // El tiempo se toma del intento ya cerrado, no de "ahora": si vuelve mañana
  // a mirar la revisión, tiene que decir lo que tardó, no un día.
  const cerrado = await leerIntento(db, intento.id)
  const segundos = cerrado?.entregado_en
    ? Math.max(
        0,
        Math.round(
          (new Date(cerrado.entregado_en).getTime() - new Date(intento.comenzado_en).getTime()) /
            1000,
        ),
      )
    : transcurrido(intento.comenzado_en)

  return {
    ok: true,
    resultado: { puntaje, total, segundos, porVencimiento: seVencio, detalle },
  }
}

// --- Internos ----------------------------------------------------------------

type Cliente = Awaited<ReturnType<typeof supabaseSesion>>

async function leerIntento(db: Cliente, intentoId: number): Promise<FilaIntento | null> {
  // Sin filtrar por usuario a propósito: lo hace la política de la base. Si
  // esta consulta pidiera el intento de otra persona, no devolvería nada.
  const { data } = await db
    .from('intentos')
    .select('id, clase_id, eval_indice, comenzado_en, entregado_en, respuestas')
    .eq('id', intentoId)
    .maybeSingle()

  return (data as FilaIntento | null) ?? null
}

async function evaluacionDe(intento: FilaIntento): Promise<Evaluacion | null> {
  const contenido = await getContenidoPorId(intento.clase_id)
  return contenido?.evaluaciones[intento.eval_indice] ?? null
}

/** Cierra un intento calificando lo que haya respondido hasta ahora. */
async function cerrar(db: Cliente, intento: FilaIntento, ev: Evaluacion) {
  const { puntaje, total } = calificar(ev, intento.respuestas)

  await db
    .from('intentos')
    .update({ entregado_en: new Date().toISOString(), puntaje, total })
    .eq('id', intento.id)
    // Sin esto, dos cierres simultáneos (el reloj del navegador y el servidor
    // detectando el vencimiento) pisarían la hora de entrega dos veces.
    .is('entregado_en', null)
}
