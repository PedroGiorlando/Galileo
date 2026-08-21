'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { TemaContenidoSchema, TemaMetaSchema } from '@/lib/schemas'
import { esAdmin } from '@/lib/progreso'

/** 'Trabajo y energía' → 'trabajo-y-energia'. Mismo criterio que el generador del currículum. */
function aSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[°º]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 'use server' hace que estas funciones corran SIEMPRE en el servidor, aunque
 * se las llame desde un Client Component. Por eso pueden usar la clave secreta
 * sin que llegue al navegador.
 *
 * Y por eso mismo cada una verifica el permiso: una Server Action es un
 * endpoint HTTP y se puede llamar sin pasar por ninguna pantalla. Proteger la
 * página /admin no protege la acción.
 */

async function rechazarSiNoEsAdmin() {
  if (!(await esAdmin())) {
    return { ok: false as const, error: 'Tu cuenta no tiene permiso para editar contenido.' }
  }
  return null
}

/** Incluir o sacar un módulo de una carrera. */
export async function asignarModulo(moduloId: number, cursoId: number, incluir: boolean) {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z
    .object({
      moduloId: z.number().int().positive(),
      cursoId: z.number().int().positive(),
      incluir: z.boolean(),
    })
    .safeParse({ moduloId, cursoId, incluir })

  if (!r.success) return { ok: false as const, error: 'Datos inválidos.' }

  const db = supabaseAdmin()

  if (!r.data.incluir) {
    const { error } = await db
      .from('curso_modulos')
      .delete()
      .eq('curso_id', r.data.cursoId)
      .eq('modulo_id', r.data.moduloId)

    if (error) return { ok: false as const, error: error.message }
  } else {
    // El orden por defecto es el del módulo dentro de su materia. Cada carrera
    // puede reordenarlo después sin afectar a la otra.
    const { data: modulo } = await db
      .from('modulos')
      .select('orden')
      .eq('id', r.data.moduloId)
      .maybeSingle()

    const { error } = await db
      .from('curso_modulos')
      .upsert(
        { curso_id: r.data.cursoId, modulo_id: r.data.moduloId, orden: modulo?.orden ?? 0 },
        { onConflict: 'curso_id,modulo_id' },
      )

    if (error) return { ok: false as const, error: error.message }
  }

  revalidatePath('/preuniversitario/[programa]/[carrera]/[materia]', 'page')
  revalidatePath('/preuniversitario/[programa]/[carrera]', 'page')
  revalidatePath('/admin/[materia]', 'page')

  return { ok: true as const }
}

/** Guardar el contenido de una clase. */
export async function guardarClase(materiaId: number, meta: unknown, contenido: unknown) {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const rMeta = TemaMetaSchema.safeParse(meta)
  const rContenido = TemaContenidoSchema.safeParse(contenido)

  if (!rMeta.success || !rContenido.success) {
    const problemas = [
      ...(rMeta.success ? [] : rMeta.error.issues),
      ...(rContenido.success ? [] : rContenido.error.issues),
    ]
    return { ok: false as const, error: `Contenido inválido: ${problemas[0]?.message ?? ''}` }
  }

  const m = rMeta.data

  // Update y no upsert: la fila ya existe. El panel edita clases, no las
  // inventa, así que el módulo al que pertenece no se puede romper desde el
  // formulario.
  const { data, error } = await supabaseAdmin()
    .from('clases')
    .update({
      titulo: m.titulo,
      descripcion: m.descripcion || null,
      duracion_label: m.duracionLabel,
      video_url: m.videoUrl || null,
      gratis: m.gratis,
      publicado: m.publicado,
      contenido: rContenido.data,
    })
    .eq('materia_id', materiaId)
    .eq('slug', m.slug)
    .select('id')

  if (error) return { ok: false as const, error: error.message }
  if (!data || data.length === 0) {
    return {
      ok: false as const,
      error: `No existe la clase "${m.slug}" en esta materia. El slug no se puede cambiar desde acá.`,
    }
  }

  // Las páginas son estáticas: sin esto seguirían mostrando la versión vieja
  // hasta el próximo build.
  revalidatePath('/clase/[materia]/[clase]', 'page')
  revalidatePath('/preuniversitario/[programa]/[carrera]/[materia]', 'page')
  revalidatePath('/admin/[materia]', 'page')

  return { ok: true as const }
}

/** Crear un módulo dentro de una materia. */
export async function crearModulo(materiaId: number, nombre: string) {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z
    .object({ materiaId: z.number().int().positive(), nombre: z.string().trim().min(3).max(120) })
    .safeParse({ materiaId, nombre })

  if (!r.success) return { ok: false as const, error: 'El nombre necesita al menos 3 caracteres.' }

  const db = supabaseAdmin()
  const slug = aSlug(r.data.nombre)

  if (!slug) return { ok: false as const, error: 'Ese nombre no genera una dirección válida.' }

  // El módulo nuevo va al final del listado de su materia.
  const { data: ultimo } = await db
    .from('modulos')
    .select('orden')
    .eq('materia_id', r.data.materiaId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await db.from('modulos').insert({
    materia_id: r.data.materiaId,
    slug,
    nombre: r.data.nombre,
    orden: (ultimo?.orden ?? 0) + 1,
  })

  if (error) {
    // El slug es único por materia: dos módulos con el mismo nombre chocan.
    if (error.code === '23505') {
      return { ok: false as const, error: 'Ya existe un módulo con ese nombre en esta materia.' }
    }
    return { ok: false as const, error: error.message }
  }

  revalidatePath('/admin/[materia]', 'page')
  return { ok: true as const }
}

/**
 * Borrar un módulo.
 *
 * Borrar en cascada arrastra sus clases, y con ellas el contenido escrito y el
 * progreso de todos los alumnos. Por eso se niega si alguna clase tiene
 * contenido: quien quiera borrarlo igual tiene que vaciarlas primero, a
 * conciencia. Un clic no puede tirar semanas de trabajo.
 */
export async function borrarModulo(moduloId: number) {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z.object({ moduloId: z.number().int().positive() }).safeParse({ moduloId })
  if (!r.success) return { ok: false as const, error: 'Datos inválidos.' }

  const db = supabaseAdmin()

  const { data: escritas } = await db
    .from('clases')
    .select('id')
    .eq('modulo_id', r.data.moduloId)
    .not('contenido', 'is', null)

  if (escritas && escritas.length > 0) {
    return {
      ok: false as const,
      error: `Este módulo tiene ${escritas.length} ${
        escritas.length === 1 ? 'clase escrita' : 'clases escritas'
      }. Borrá su contenido antes de eliminarlo.`,
    }
  }

  const { error } = await db.from('modulos').delete().eq('id', r.data.moduloId)
  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/admin/[materia]', 'page')
  revalidatePath('/preuniversitario/[programa]/[carrera]/[materia]', 'page')
  return { ok: true as const }
}

/** Crear una clase dentro de un módulo. */
export async function crearClase(materiaId: number, moduloId: number, titulo: string) {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z
    .object({
      materiaId: z.number().int().positive(),
      moduloId: z.number().int().positive(),
      titulo: z.string().trim().min(3).max(160),
    })
    .safeParse({ materiaId, moduloId, titulo })

  if (!r.success) return { ok: false as const, error: 'El título necesita al menos 3 caracteres.' }

  const db = supabaseAdmin()
  const slug = aSlug(r.data.titulo)
  if (!slug) return { ok: false as const, error: 'Ese título no genera una dirección válida.' }

  const { data: ultima } = await db
    .from('clases')
    .select('orden')
    .eq('modulo_id', r.data.moduloId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await db.from('clases').insert({
    materia_id: r.data.materiaId,
    modulo_id: r.data.moduloId,
    slug,
    titulo: r.data.titulo,
    orden: (ultima?.orden ?? 0) + 1,
  })

  if (error) {
    if (error.code === '23505') {
      return { ok: false as const, error: 'Ya existe una clase con ese título en esta materia.' }
    }
    return { ok: false as const, error: error.message }
  }

  revalidatePath('/admin/[materia]', 'page')
  return { ok: true as const }
}

/** Borrar una clase. Se niega si tiene contenido escrito, por lo mismo. */
export async function borrarClase(claseId: number) {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const r = z.object({ claseId: z.number().int().positive() }).safeParse({ claseId })
  if (!r.success) return { ok: false as const, error: 'Datos inválidos.' }

  const db = supabaseAdmin()

  const { data: clase } = await db
    .from('clases')
    .select('contenido')
    .eq('id', r.data.claseId)
    .maybeSingle()

  if (clase?.contenido != null) {
    return {
      ok: false as const,
      error: 'Esta clase tiene contenido escrito. Vaciala antes de borrarla.',
    }
  }

  const { error } = await db.from('clases').delete().eq('id', r.data.claseId)
  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/admin/[materia]', 'page')
  return { ok: true as const }
}
