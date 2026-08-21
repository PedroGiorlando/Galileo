'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { TemaContenidoSchema, TemaMetaSchema } from '@/lib/schemas'
import { esAdmin } from '@/lib/progreso'

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
