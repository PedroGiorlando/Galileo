import { supabaseSesion } from './supabase-servidor'
import { getMateria } from './contenido'
import { normalizarContenido, type TemaContenido } from './schemas'

/**
 * Las lecturas que ven las RESPUESTAS. Solo para acciones del servidor.
 *
 * Viven en un archivo aparte de `contenido.ts` por dos motivos distintos, y
 * los dos importan:
 *
 * 1. Nada de esto puede llegar a un componente de cliente. Para las páginas
 *    está `getClase`, que filtra las respuestas antes de mandar nada.
 *
 * 2. Acá se lee la sesión (cookies), y `contenido.ts` lo usan páginas
 *    estáticas. Mezclarlos ya nos costó una vez todo el SSG del sitio: un dato
 *    de sesión en un módulo compartido obliga a Next a renderizar en cada
 *    visita. Estas funciones solo se llaman desde Server Actions, que corren
 *    por petición igual, así que acá no cuesta nada.
 *
 * POR QUÉ CON SESIÓN Y NO CON EL CLIENTE ANÓNIMO. La política de la base dice
 * `publicado OR es_admin()`. Con el cliente anónimo, un profesor mirando la
 * vista previa de su propio borrador recibía "No encontramos esa evaluación":
 * la clase existe, pero para esa consulta no. Con la sesión, cada quien ve lo
 * que le corresponde y la decisión la toma la base, no un `if` que alguien se
 * puede olvidar de escribir.
 *
 * Y no se usa la clave de administrador, que saltearía las políticas: con ella
 * cualquiera podría sondear las respuestas de una clase todavía sin publicar.
 */

export async function getClaseConRespuestas(
  materiaSlug: string,
  claseSlug: string,
): Promise<{ id: number; contenido: TemaContenido } | null> {
  const materia = await getMateria(materiaSlug)
  if (!materia) return null

  const db = await supabaseSesion()
  const { data, error } = await db
    .from('clases')
    .select('id, contenido')
    .eq('materia_id', materia.id)
    .eq('slug', claseSlug)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer la clase: ${error.message}`)
  if (!data?.contenido) return null

  return { id: data.id, contenido: normalizarContenido(data.contenido) }
}

export async function getContenidoParaCorregir(
  materiaSlug: string,
  claseSlug: string,
): Promise<TemaContenido | null> {
  return (await getClaseConRespuestas(materiaSlug, claseSlug))?.contenido ?? null
}

/**
 * El contenido de una clase por su id.
 *
 * Lo usa el examen: un intento guarda `clase_id`, no la dirección, así que
 * para calificarlo hay que poder llegar al contenido desde el número.
 */
export async function getContenidoPorId(claseId: number): Promise<TemaContenido | null> {
  const db = await supabaseSesion()
  const { data, error } = await db
    .from('clases')
    .select('contenido')
    .eq('id', claseId)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer la clase: ${error.message}`)
  if (!data?.contenido) return null

  return normalizarContenido(data.contenido)
}
