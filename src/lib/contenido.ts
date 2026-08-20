/** Todo lo que hay hoy es preuniversitario. Cuando entre otro nivel, pasa a parámetro. */
const NIVEL = 'preuniversitario'

import { supabaseAdmin, supabasePublico } from './supabase'
import { TemaContenidoSchema } from './schemas'
import type { SubtemaCompleto } from '@/data/topicData'

/**
 * Capa de datos: lo único que sabe que existe una base.
 *
 * Vocabulario, que importa porque "tema" se usa para dos cosas distintas según
 * dónde se mire:
 *   Curso   = una materia del ingreso (Física). Es la unidad que se compra.
 *   Tema    = una unidad del programa (Vectores).
 *   Subtema = la clase que se estudia (Suma de vectores), con sus 5 solapas.
 */

export interface SubtemaResumen {
  id: number
  slug: string
  titulo: string
  descripcion: string | null
  orden: number
  gratis: boolean
  duracionLabel: string | null
  tieneContenido: boolean
}

export interface TemaConSubtemas {
  id: number
  slug: string
  nombre: string
  orden: number
  subtemas: SubtemaResumen[]
}

export interface Curso {
  id: number
  slug: string
  nombre: string
  programa: string
  titulo: string
  descripcion: string | null
  orden: number
  precioCentavos: number
}

interface FilaCurso {
  id: number
  slug: string
  nombre: string
  programa: string
  titulo: string
  descripcion: string | null
  orden: number
  precio_centavos: number
}

const SELECT_CURSO =
  'id, slug, nombre, programa, titulo, descripcion, orden, precio_centavos'

const aCurso = (f: FilaCurso): Curso => ({
  id: f.id,
  slug: f.slug,
  nombre: f.nombre,
  programa: f.programa,
  titulo: f.titulo,
  descripcion: f.descripcion,
  orden: f.orden,
  precioCentavos: f.precio_centavos,
})

// `contenido is not null` es lo que separa un subtema listo de uno que todavía
// se ve como "Próximamente". Se pide como `contenido->>'objetivos'` en vez del
// jsonb entero para no traer kilobytes de teoría solo para armar un listado.
const SELECT_SUBTEMA_RESUMEN =
  'id, slug, titulo, descripcion, orden, gratis, duracion_label, tiene_contenido:contenido'

interface FilaSubtemaResumen {
  id: number
  slug: string
  titulo: string
  descripcion: string | null
  orden: number
  gratis: boolean
  duracion_label: string | null
  tiene_contenido: unknown
}

const aSubtemaResumen = (f: FilaSubtemaResumen): SubtemaResumen => ({
  id: f.id,
  slug: f.slug,
  titulo: f.titulo,
  descripcion: f.descripcion,
  orden: f.orden,
  gratis: f.gratis,
  duracionLabel: f.duracion_label,
  tieneContenido: f.tiene_contenido != null,
})

export async function getCursos(): Promise<Curso[]> {
  const { data, error } = await supabasePublico()
    .from('cursos')
    .select(SELECT_CURSO)
    .eq('nivel', NIVEL)
    .order('orden')
    .overrideTypes<FilaCurso[]>()

  if (error) throw new Error(`No se pudieron leer los cursos: ${error.message}`)
  return (data ?? []).map(aCurso)
}

export async function getCurso(cursoSlug: string): Promise<Curso | null> {
  const { data, error } = await supabasePublico()
    .from('cursos')
    .select(SELECT_CURSO)
    .eq('nivel', NIVEL)
    .eq('slug', cursoSlug)
    .maybeSingle<FilaCurso>()

  if (error) throw new Error(`No se pudo leer el curso: ${error.message}`)
  return data ? aCurso(data) : null
}

/** El temario completo de una materia: las unidades con sus clases adentro. */
export async function getTemario(cursoId: number): Promise<TemaConSubtemas[]> {
  const { data, error } = await supabasePublico()
    .from('temas')
    .select(`id, slug, nombre, orden, subtemas(${SELECT_SUBTEMA_RESUMEN})`)
    .eq('curso_id', cursoId)
    .order('orden')
    .order('orden', { referencedTable: 'subtemas' })
    .overrideTypes<
      { id: number; slug: string; nombre: string; orden: number; subtemas: FilaSubtemaResumen[] }[]
    >()

  if (error) throw new Error(`No se pudo leer el temario: ${error.message}`)

  return (data ?? []).map(t => ({
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    orden: t.orden,
    subtemas: (t.subtemas ?? []).map(aSubtemaResumen),
  }))
}

export interface SubtemaPagina {
  curso: Curso
  tema: { slug: string; nombre: string }
  subtema: SubtemaCompleto | null
  resumen: SubtemaResumen
  temario: TemaConSubtemas[]
}

export async function getSubtema(
  cursoSlug: string,
  subtemaSlug: string,
): Promise<SubtemaPagina | null> {
  const curso = await getCurso(cursoSlug)
  if (!curso) return null

  const { data, error } = await supabasePublico()
    .from('subtemas')
    .select(
      'id, slug, titulo, descripcion, orden, gratis, duracion_label, video_url, contenido, temas!inner(slug, nombre)',
    )
    .eq('curso_id', curso.id)
    .eq('slug', subtemaSlug)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer el subtema: ${error.message}`)
  if (!data) return null

  const tema = data.temas as unknown as { slug: string; nombre: string }

  const resumen: SubtemaResumen = {
    id: data.id,
    slug: data.slug,
    titulo: data.titulo,
    descripcion: data.descripcion,
    orden: data.orden,
    gratis: data.gratis,
    duracionLabel: data.duracion_label,
    tieneContenido: data.contenido != null,
  }

  // Sin contenido no hay página completa: la ruta responde "Próximamente".
  // Con contenido, se valida antes de renderizar — lo guardado pudo haberse
  // cargado con una versión vieja del schema, y es mejor romper que mostrar
  // un subtema a medias.
  const subtema: SubtemaCompleto | null = data.contenido
    ? {
        id: data.orden,
        slug: data.slug,
        titulo: data.titulo,
        duracionLabel: data.duracion_label ?? '',
        ...TemaContenidoSchema.parse(data.contenido),
      }
    : null

  return { curso, tema, subtema, resumen, temario: await getTemario(curso.id) }
}

// --- Rutas para prerenderizar en el build ------------------------------------

export async function getRutasDeCursos(): Promise<{ curso: string }[]> {
  const { data, error } = await supabasePublico()
    .from('cursos')
    .select('slug')
    .eq('nivel', NIVEL)

  if (error) throw new Error(`No se pudieron leer las rutas de cursos: ${error.message}`)
  return (data ?? []).map(c => ({ curso: c.slug }))
}

/**
 * Solo los subtemas que YA tienen contenido. Los que están "Próximamente" se
 * sirven bajo demanda: prerenderizar 170 páginas que dicen lo mismo alarga el
 * build sin que nadie las busque.
 */
export async function getRutasDeSubtemas(): Promise<{ curso: string; subtema: string }[]> {
  // No se puede pedir `cursos!inner(slug)` desde subtemas: `subtemas.curso_id`
  // no es una clave foránea a cursos por sí sola. La que existe es compuesta,
  // contra temas(id, curso_id), y PostgREST solo sabe anidar por relaciones
  // declaradas. Con tres cursos, resolverlo con un Map es más simple que meter
  // un anidamiento de dos niveles a través de temas.
  const cursos = await getCursos()
  const slugPorId = new Map(cursos.map(c => [c.id, c.slug]))

  const { data, error } = await supabasePublico()
    .from('subtemas')
    .select('slug, curso_id')
    .not('contenido', 'is', null)

  if (error) throw new Error(`No se pudieron leer las rutas de subtemas: ${error.message}`)

  return (data ?? []).flatMap(s => {
    const curso = slugPorId.get(s.curso_id)
    return curso ? [{ curso, subtema: s.slug }] : []
  })
}

// --- Panel -------------------------------------------------------------------

/**
 * Lectura para el panel: usa la clave secreta, así que ve también lo que no
 * está publicado. Nunca debe llamarse desde una página del alumno.
 */
export async function getSubtemasParaAdmin(cursoId: number) {
  const { data, error } = await supabaseAdmin()
    .from('subtemas')
    .select('id, slug, titulo, orden, publicado, gratis, contenido, temas!inner(nombre, orden)')
    .eq('curso_id', cursoId)
    .order('orden')

  if (error) throw new Error(`No se pudieron leer los subtemas: ${error.message}`)
  return data ?? []
}

export async function getSubtemaParaAdmin(cursoId: number, subtemaSlug: string) {
  const { data, error } = await supabaseAdmin()
    .from('subtemas')
    .select('id, slug, titulo, descripcion, orden, gratis, publicado, duracion_label, video_url, contenido, temas!inner(id, slug, nombre)')
    .eq('curso_id', cursoId)
    .eq('slug', subtemaSlug)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer el subtema: ${error.message}`)
  return data
}
