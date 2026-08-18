import { supabaseAdmin, supabasePublico } from './supabase'
import { TemaContenidoSchema } from './schemas'
import type { SubtemaCompleto } from '@/data/topicData'

/**
 * Capa de datos: lo único que sabe que existe una base.
 *
 * Vocabulario, que importa porque "tema" se usa para dos cosas distintas según
 * dónde se mire:
 *   Curso   = un grado (4° Grado). Es la unidad que se compra.
 *   Tema    = un área del currículum (Números y Operaciones).
 *   Subtema = lo que se estudia (Múltiplos y divisores), con sus 5 solapas.
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
  gradoSlug: string
  gradoNombre: string
  titulo: string
  descripcion: string | null
  orden: number
  materia: string
  precioCentavos: number
}

interface FilaCurso {
  id: number
  grado_slug: string
  grado_nombre: string
  titulo: string
  descripcion: string | null
  orden: number
  precio_centavos: number
  materias: { nombre: string } | null
}

const SELECT_CURSO =
  'id, grado_slug, grado_nombre, titulo, descripcion, orden, precio_centavos, materias!inner(nombre)'

const aCurso = (f: FilaCurso): Curso => ({
  id: f.id,
  gradoSlug: f.grado_slug,
  gradoNombre: f.grado_nombre,
  titulo: f.titulo,
  descripcion: f.descripcion,
  orden: f.orden,
  materia: f.materias?.nombre ?? '',
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
    .eq('nivel', 'primaria')
    .order('orden')
    .overrideTypes<FilaCurso[]>()

  if (error) throw new Error(`No se pudieron leer los cursos: ${error.message}`)
  return (data ?? []).map(aCurso)
}

export async function getCurso(gradoSlug: string): Promise<Curso | null> {
  const { data, error } = await supabasePublico()
    .from('cursos')
    .select(SELECT_CURSO)
    .eq('nivel', 'primaria')
    .eq('grado_slug', gradoSlug)
    .maybeSingle<FilaCurso>()

  if (error) throw new Error(`No se pudo leer el curso: ${error.message}`)
  return data ? aCurso(data) : null
}

/** El temario completo de un grado: las áreas con sus subtemas adentro. */
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
  gradoSlug: string,
  subtemaSlug: string,
): Promise<SubtemaPagina | null> {
  const curso = await getCurso(gradoSlug)
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
        grado: curso.gradoNombre,
        gradoSlug: curso.gradoSlug,
        materia: curso.materia,
        materiaSlug: 'matematica',
        categoria: tema.nombre,
        duracionLabel: data.duracion_label ?? '',
        ...TemaContenidoSchema.parse(data.contenido),
      }
    : null

  return { curso, tema, subtema, resumen, temario: await getTemario(curso.id) }
}

// --- Rutas para prerenderizar en el build ------------------------------------

export async function getRutasDeCursos(): Promise<{ grado: string }[]> {
  const { data, error } = await supabasePublico()
    .from('cursos')
    .select('grado_slug')
    .eq('nivel', 'primaria')

  if (error) throw new Error(`No se pudieron leer las rutas de cursos: ${error.message}`)
  return (data ?? []).map(c => ({ grado: c.grado_slug }))
}

/**
 * Solo los subtemas que YA tienen contenido. Los que están "Próximamente" se
 * sirven bajo demanda: prerenderizar 170 páginas que dicen lo mismo alarga el
 * build sin que nadie las busque.
 */
export async function getRutasDeSubtemas(): Promise<{ grado: string; subtema: string }[]> {
  const { data, error } = await supabasePublico()
    .from('subtemas')
    .select('slug, cursos!inner(grado_slug)')
    .not('contenido', 'is', null)
    .overrideTypes<{ slug: string; cursos: { grado_slug: string } }[]>()

  if (error) throw new Error(`No se pudieron leer las rutas de subtemas: ${error.message}`)
  return (data ?? []).map(s => ({ grado: s.cursos.grado_slug, subtema: s.slug }))
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
