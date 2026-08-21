'use server'

import { z } from 'zod'
import { supabaseSesion } from '@/lib/supabase-servidor'

/**
 * Guardar el progreso de una clase.
 *
 * Lo que llega es una petición HTTP como cualquier otra, así que se valida y no
 * se confía en el `clase_id`. Aun así, la defensa de verdad es RLS: la
 * política `progreso_propio` exige que `user_id = auth.uid()`, de modo que ni
 * mandando el id de otra persona se puede escribir en su progreso.
 */

const Marcar = z.object({
  claseId: z.number().int().positive(),
  completado: z.boolean(),
})

export async function marcarClase(claseId: number, completado: boolean) {
  const r = Marcar.safeParse({ claseId, completado })
  if (!r.success) return { ok: false as const, error: 'Datos inválidos.' }

  const supabase = await supabaseSesion()
  const { data: sesion } = await supabase.auth.getUser()
  if (!sesion.user) return { ok: false as const, error: 'Necesitás iniciar sesión.' }

  const { error } = await supabase.from('progreso').upsert(
    {
      user_id: sesion.user.id,
      clase_id: r.data.claseId,
      completado: r.data.completado,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'user_id,clase_id' },
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
export async function importarProgresoLocal(materiaId: number, slugs: string[]) {
  const Lista = z.object({
    materiaId: z.number().int().positive(),
    slugs: z.array(z.string().min(1)).max(500),
  })
  const r = Lista.safeParse({ materiaId, slugs })
  if (!r.success) return { ok: false as const, importadas: 0 }

  const supabase = await supabaseSesion()
  const { data: sesion } = await supabase.auth.getUser()
  if (!sesion.user || r.data.slugs.length === 0) return { ok: false as const, importadas: 0 }

  // Se traducen los slugs a ids dentro de esa materia. Si alguno no existe,
  // simplemente no entra: no hay motivo para fallar por un slug viejo.
  // Filtra por la columna curso_id: subtemas no tiene clave foránea directa a
  // cursos, así que anidarla haría fallar la consulta entera.
  const { data: clases } = await supabase
    .from('clases')
    .select('id, slug')
    .eq('materia_id', r.data.materiaId)
    .in('slug', r.data.slugs)

  const filas = (clases ?? [])
    .map(s => ({
      user_id: sesion.user!.id,
      clase_id: s.id,
      completado: true,
      actualizado_en: new Date().toISOString(),
    }))

  if (filas.length === 0) return { ok: true as const, importadas: 0 }

  const { error } = await supabase
    .from('progreso')
    .upsert(filas, { onConflict: 'user_id,clase_id' })

  if (error) return { ok: false as const, importadas: 0 }
  return { ok: true as const, importadas: filas.length }
}
