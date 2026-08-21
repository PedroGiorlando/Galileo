'use server'

import { z } from 'zod'
import { supabaseSesion } from '@/lib/supabase-servidor'

/**
 * Guardar el progreso de una clase.
 *
 * Lo que llega es una petición HTTP como cualquier otra, así que se valida y no
 * se confía en el `subtema_id`. Aun así, la defensa de verdad es RLS: la
 * política `progreso_propio` exige que `user_id = auth.uid()`, de modo que ni
 * mandando el id de otra persona se puede escribir en su progreso.
 */

const Marcar = z.object({
  subtemaId: z.number().int().positive(),
  completado: z.boolean(),
})

export async function marcarClase(subtemaId: number, completado: boolean) {
  const r = Marcar.safeParse({ subtemaId, completado })
  if (!r.success) return { ok: false as const, error: 'Datos inválidos.' }

  const supabase = await supabaseSesion()
  const { data: sesion } = await supabase.auth.getUser()
  if (!sesion.user) return { ok: false as const, error: 'Necesitás iniciar sesión.' }

  const { error } = await supabase.from('progreso').upsert(
    {
      user_id: sesion.user.id,
      subtema_id: r.data.subtemaId,
      completado: r.data.completado,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'user_id,subtema_id' },
  )

  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

/**
 * Rescata el progreso que el alumno hizo antes de registrarse.
 *
 * Sin esto, alguien que completa cinco clases y después crea la cuenta las
 * pierde todas — justo en el momento en que decidió comprometerse con la
 * plataforma. Se corre una sola vez, al detectar sesión con progreso local
 * pendiente.
 */
export async function importarProgresoLocal(cursoSlug: string, slugs: string[]) {
  const Lista = z.object({
    cursoSlug: z.string().min(1),
    slugs: z.array(z.string().min(1)).max(500),
  })
  const r = Lista.safeParse({ cursoSlug, slugs })
  if (!r.success) return { ok: false as const, importadas: 0 }

  const supabase = await supabaseSesion()
  const { data: sesion } = await supabase.auth.getUser()
  if (!sesion.user || r.data.slugs.length === 0) return { ok: false as const, importadas: 0 }

  // Se traducen los slugs a ids dentro de esa materia. Si alguno no existe,
  // simplemente no entra: no hay motivo para fallar por un slug viejo.
  const { data: subtemas } = await supabase
    .from('subtemas')
    .select('id, slug, cursos!inner(slug)')
    .in('slug', r.data.slugs)
    .overrideTypes<{ id: number; slug: string; cursos: { slug: string } }[]>()

  const filas = (subtemas ?? [])
    .filter(s => s.cursos.slug === r.data.cursoSlug)
    .map(s => ({
      user_id: sesion.user!.id,
      subtema_id: s.id,
      completado: true,
      actualizado_en: new Date().toISOString(),
    }))

  if (filas.length === 0) return { ok: true as const, importadas: 0 }

  const { error } = await supabase
    .from('progreso')
    .upsert(filas, { onConflict: 'user_id,subtema_id' })

  if (error) return { ok: false as const, importadas: 0 }
  return { ok: true as const, importadas: filas.length }
}
