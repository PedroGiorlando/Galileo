'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { TemaContenidoSchema, TemaMetaSchema } from '@/lib/schemas'
import { esAdmin } from '@/lib/progreso'

/**
 * 'use server' hace que esta función corra SIEMPRE en el servidor, aunque se la
 * llame desde un Client Component. Next genera el ida y vuelta por HTTP solo.
 * Por eso acá se puede usar la clave secreta sin que llegue al navegador.
 *
 * Y por eso mismo hay que volver a validar: lo que llega es una petición HTTP
 * como cualquier otra, no "lo que el formulario mandó". Que el formulario haya
 * validado antes es comodidad para quien carga, no una garantía.
 */
export async function guardarSubtema(cursoId: number, meta: unknown, contenido: unknown) {
  // Proteger la página /admin no alcanza: una Server Action es un endpoint
  // HTTP y se puede llamar sin pasar por ninguna pantalla. Como acá se escribe
  // con la clave secreta, que saltea RLS, el permiso se verifica de nuevo.
  if (!(await esAdmin())) {
    return { ok: false as const, error: 'Tu cuenta no tiene permiso para editar contenido.' }
  }

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

  // Update y no upsert: la fila ya existe (la creó el seed del currículum). El
  // panel edita subtemas, no los inventa — así el orden y el área a la que
  // pertenece no se pueden romper desde el formulario.
  const { data, error } = await supabaseAdmin()
    .from('subtemas')
    .update({
      titulo: m.titulo,
      descripcion: m.descripcion || null,
      duracion_label: m.duracionLabel,
      video_url: m.videoUrl || null,
      gratis: m.gratis,
      publicado: m.publicado,
      contenido: rContenido.data,
    })
    .eq('curso_id', cursoId)
    .eq('slug', m.slug)
    .select('id')

  if (error) return { ok: false as const, error: error.message }
  if (!data || data.length === 0) {
    return {
      ok: false as const,
      error: `No existe el subtema "${m.slug}" en este curso. El slug no se puede cambiar desde acá.`,
    }
  }

  // Las páginas son estáticas: sin esto seguirían mostrando la versión vieja
  // hasta el próximo build.
  revalidatePath('/preuniversitario/[curso]/[subtema]', 'page')
  revalidatePath('/preuniversitario/[curso]', 'page')
  revalidatePath('/preuniversitario')

  return { ok: true as const }
}
