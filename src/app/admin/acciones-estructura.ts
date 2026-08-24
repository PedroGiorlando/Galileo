'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { aSlug, mensajeDeError, rechazarSiNoEsAdmin, type Exito, type Fallo } from '@/lib/admin'

/**
 * La estructura del catálogo: programas, carreras, materias y qué materia se
 * dicta en qué carrera.
 *
 * Hasta acá esto se hacía escribiendo SQL a mano, o sea que agregar Química
 * dependía de que yo estuviera disponible. Es poco lo que se toca —una vez por
 * cuatrimestre— pero cuando hace falta, hace falta.
 *
 * El vocabulario, que es lo único difícil de esto:
 *
 *   programa   la institución: UNCuyo, UTN FRM
 *   carrera    lo que se estudia ahí: Ingeniería
 *   materia    el contenido: Física. Se escribe UNA vez.
 *   curso      "Física se dicta en Ingeniería de la UTN". Es lo que se vende.
 *
 * Que materia y curso estén separados es lo que hace que Cinemática se escriba
 * una sola vez y aparezca en las dos universidades.
 */

const nombre = z.string().trim().min(3, 'Necesita al menos 3 caracteres').max(120)
const id = z.number().int().positive()

type Resultado = Exito | Fallo

/** Revalida todo lo que cambia de forma al tocar la estructura. */
function revalidarCatalogo() {
  revalidatePath('/preuniversitario')
  revalidatePath('/preuniversitario/[programa]', 'page')
  revalidatePath('/preuniversitario/[programa]/[carrera]', 'page')
  revalidatePath('/preuniversitario/[programa]/[carrera]/[materia]', 'page')
  revalidatePath('/admin')
  revalidatePath('/admin/estructura')
}

/** Siguiente valor de `orden` dentro de un conjunto: lo nuevo va al final. */
async function siguienteOrden(tabla: string, filtro?: { columna: string; valor: number }) {
  // ESTA FUNCIÓN NO TIENE RED: como `tabla` es un string cualquiera, los tipos
  // generados de la base no se pueden resolver y todo adentro degrada a `any`.
  // Un nombre de tabla o de columna mal escrito acá no lo ve el compilador;
  // aparece recién al ejecutarse. Es el precio de no repetir cuatro consultas
  // casi iguales, y hay que tenerlo presente al tocarla.
  //
  // Probada contra la base real: devuelve el siguiente orden en cada tabla, y 1
  // cuando el conjunto está vacío.
  const base = supabaseAdmin().from(tabla).select('orden')
  const filtrada = filtro ? base.eq(filtro.columna, filtro.valor) : base

  const { data } = await filtrada.order('orden', { ascending: false }).limit(1).maybeSingle()
  return ((data as { orden: number } | null)?.orden ?? 0) + 1
}

// --- Crear -------------------------------------------------------------------

/** Una institución: UNCuyo, UTN FRM. */
export async function crearPrograma(nombrePrograma: string): Promise<Resultado> {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = nombre.safeParse(nombrePrograma)
  if (!r.success) return { ok: false, error: r.error.issues[0].message }

  const slug = aSlug(r.data)
  if (!slug) return { ok: false, error: 'Ese nombre no genera una dirección válida.' }

  const { error } = await supabaseAdmin()
    .from('programas')
    .insert({ slug, nombre: r.data, orden: await siguienteOrden('programas') })

  if (error) return { ok: false, error: mensajeDeError(error, 'Ya existe un programa con ese nombre.') }

  revalidarCatalogo()
  return { ok: true }
}

/** Una carrera dentro de un programa: Ingeniería en la UTN. */
export async function crearCarrera(programaId: number, nombreCarrera: string): Promise<Resultado> {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z.object({ programaId: id, nombre }).safeParse({ programaId, nombre: nombreCarrera })
  if (!r.success) return { ok: false, error: r.error.issues[0].message }

  const slug = aSlug(r.data.nombre)
  if (!slug) return { ok: false, error: 'Ese nombre no genera una dirección válida.' }

  const { error } = await supabaseAdmin().from('carreras').insert({
    programa_id: r.data.programaId,
    slug,
    nombre: r.data.nombre,
    orden: await siguienteOrden('carreras', { columna: 'programa_id', valor: r.data.programaId }),
  })

  if (error) {
    return { ok: false, error: mensajeDeError(error, 'Ese programa ya tiene una carrera con ese nombre.') }
  }

  revalidarCatalogo()
  return { ok: true }
}

/**
 * Una materia: el contenido.
 *
 * Nace sin módulos y sin clases, y sin estar en ninguna carrera. Son dos pasos
 * a propósito: escribir Química y decidir en qué carreras se dicta son
 * decisiones distintas, y normalmente las toman en momentos distintos.
 */
export async function crearMateria(nombreMateria: string): Promise<Resultado> {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = nombre.safeParse(nombreMateria)
  if (!r.success) return { ok: false, error: r.error.issues[0].message }

  const slug = aSlug(r.data)
  if (!slug) return { ok: false, error: 'Ese nombre no genera una dirección válida.' }

  const { error } = await supabaseAdmin()
    .from('materias')
    .insert({ slug, nombre: r.data, orden: await siguienteOrden('materias'), activa: true })

  if (error) return { ok: false, error: mensajeDeError(error, 'Ya existe una materia con ese nombre.') }

  revalidarCatalogo()
  return { ok: true }
}

/**
 * Dictar una materia en una carrera. Esto es lo que crea la página del temario
 * y, más adelante, lo que se cobra.
 *
 * Nace despublicada: aparecer en el sitio es una decisión aparte de existir.
 */
export async function dictarMateria(
  carreraId: number,
  materiaId: number,
  titulo: string,
): Promise<Resultado> {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z
    .object({ carreraId: id, materiaId: id, titulo: z.string().trim().min(3).max(160) })
    .safeParse({ carreraId, materiaId, titulo })

  if (!r.success) return { ok: false, error: 'El título necesita al menos 3 caracteres.' }

  const { error } = await supabaseAdmin().from('cursos').insert({
    carrera_id: r.data.carreraId,
    materia_id: r.data.materiaId,
    titulo: r.data.titulo,
    orden: await siguienteOrden('cursos', { columna: 'carrera_id', valor: r.data.carreraId }),
    publicado: false,
  })

  if (error) {
    return { ok: false, error: mensajeDeError(error, 'Esa materia ya se dicta en esta carrera.') }
  }

  revalidarCatalogo()
  return { ok: true }
}

// --- Mostrar u ocultar -------------------------------------------------------

/** Publicar o despublicar una materia dentro de una carrera. */
export async function alternarCursoPublicado(cursoId: number, publicado: boolean): Promise<Resultado> {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z.object({ cursoId: id, publicado: z.boolean() }).safeParse({ cursoId, publicado })
  if (!r.success) return { ok: false, error: 'Datos inválidos.' }

  const { error } = await supabaseAdmin()
    .from('cursos')
    .update({ publicado: r.data.publicado })
    .eq('id', r.data.cursoId)

  if (error) return { ok: false, error: error.message }

  revalidarCatalogo()
  return { ok: true }
}

/**
 * Activar o desactivar una materia en todo el sitio.
 *
 * Es el interruptor que hoy tiene apagada a Química: la materia existe con su
 * contenido, pero no aparece en ningún lado hasta que esté lista.
 */
export async function alternarMateriaActiva(materiaId: number, activa: boolean): Promise<Resultado> {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z.object({ materiaId: id, activa: z.boolean() }).safeParse({ materiaId, activa })
  if (!r.success) return { ok: false, error: 'Datos inválidos.' }

  const { error } = await supabaseAdmin()
    .from('materias')
    .update({ activa: r.data.activa })
    .eq('id', r.data.materiaId)

  if (error) return { ok: false, error: error.message }

  revalidarCatalogo()
  return { ok: true }
}

// --- Borrar ------------------------------------------------------------------
//
// Solo se borra lo que está vacío. No es timidez: `on delete cascade` haría que
// un clic en "borrar materia" se llevara sus módulos, sus clases, el contenido
// escrito y el progreso de todos los alumnos que la cursaron. La única razón
// real para borrar acá es haberse equivocado escribiendo un nombre, y para eso
// alcanza con poder borrar lo que todavía está vacío.

/** Dejar de dictar una materia en una carrera. */
export async function dejarDeDictar(cursoId: number): Promise<Resultado> {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z.object({ cursoId: id }).safeParse({ cursoId })
  if (!r.success) return { ok: false, error: 'Datos inválidos.' }

  const db = supabaseAdmin()

  // Si alguien lo compró, no se toca: la fila de la compra apunta acá y es el
  // comprobante de que esa persona tiene acceso.
  const { count } = await db
    .from('compras')
    .select('id', { count: 'exact', head: true })
    .eq('curso_id', r.data.cursoId)

  if (count && count > 0) {
    return { ok: false, error: `No se puede: hay ${count} compra(s) de esta materia en esta carrera.` }
  }

  const { error } = await db.from('cursos').delete().eq('id', r.data.cursoId)
  if (error) return { ok: false, error: mensajeDeError(error, '') }

  revalidarCatalogo()
  return { ok: true }
}

/** Borrar una carrera que todavía no dicta ninguna materia. */
export async function borrarCarrera(carreraId: number): Promise<Resultado> {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z.object({ carreraId: id }).safeParse({ carreraId })
  if (!r.success) return { ok: false, error: 'Datos inválidos.' }

  const db = supabaseAdmin()
  const { count } = await db
    .from('cursos')
    .select('id', { count: 'exact', head: true })
    .eq('carrera_id', r.data.carreraId)

  if (count && count > 0) {
    return { ok: false, error: `Esta carrera dicta ${count} materia(s). Sacalas primero.` }
  }

  const { error } = await db.from('carreras').delete().eq('id', r.data.carreraId)
  if (error) return { ok: false, error: mensajeDeError(error, '') }

  revalidarCatalogo()
  return { ok: true }
}

/** Borrar una materia que todavía no tiene módulos. */
export async function borrarMateria(materiaId: number): Promise<Resultado> {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z.object({ materiaId: id }).safeParse({ materiaId })
  if (!r.success) return { ok: false, error: 'Datos inválidos.' }

  const db = supabaseAdmin()

  const { count: modulos } = await db
    .from('modulos')
    .select('id', { count: 'exact', head: true })
    .eq('materia_id', r.data.materiaId)

  if (modulos && modulos > 0) {
    return { ok: false, error: `Esta materia tiene ${modulos} módulo(s). Borralos primero.` }
  }

  const { count: cursos } = await db
    .from('cursos')
    .select('id', { count: 'exact', head: true })
    .eq('materia_id', r.data.materiaId)

  if (cursos && cursos > 0) {
    return { ok: false, error: `Esta materia se dicta en ${cursos} carrera(s). Sacala de ahí primero.` }
  }

  const { error } = await db.from('materias').delete().eq('id', r.data.materiaId)
  if (error) return { ok: false, error: mensajeDeError(error, '') }

  revalidarCatalogo()
  return { ok: true }
}
