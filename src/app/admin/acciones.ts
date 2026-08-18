'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { TemaContenidoSchema, TemaMetaSchema } from '@/lib/schemas'

/**
 * 'use server' hace que esta función corra SIEMPRE en el servidor, aunque se la
 * llame desde un Client Component. Next genera el ida y vuelta por HTTP solo.
 * Por eso acá se puede usar la clave secreta sin que llegue al navegador.
 *
 * Y por eso mismo hay que volver a validar: lo que llega es una petición HTTP
 * como cualquier otra, no "lo que el formulario mandó". Que el formulario haya
 * validado antes es comodidad para quien carga, no una garantía.
 */
export async function guardarTema(cursoId: number, meta: unknown, contenido: unknown) {
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
  const { error } = await supabaseAdmin()
    .from('temas')
    .upsert(
      {
        curso_id: cursoId,
        slug: m.slug,
        titulo: m.titulo,
        categoria: m.categoria,
        orden: m.orden,
        duracion_label: m.duracionLabel,
        video_url: m.videoUrl || null,
        gratis: m.gratis,
        publicado: m.publicado,
        contenido: rContenido.data,
      },
      { onConflict: 'curso_id,slug' },
    )

  if (error) return { ok: false as const, error: error.message }

  // Las páginas del tema son estáticas: sin esto seguirían mostrando la versión
  // vieja hasta el próximo build.
  revalidatePath('/primaria/[grado]/[materia]/[tema]', 'page')
  revalidatePath('/primaria/[grado]/[materia]', 'page')

  return { ok: true as const }
}
