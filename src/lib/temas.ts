import { supabaseAdmin, supabasePublico } from './supabase'
import { TemaContenidoSchema } from './schemas'
import type { Tema } from '@/data/topicData'

/**
 * Capa de datos: lo único que sabe que existe una base.
 *
 * En la base el contenido vive en una columna jsonb y los metadatos en columnas
 * propias. Los componentes esperan un objeto plano (`tema.ejercicios`, no
 * `tema.contenido.ejercicios`), así que se aplana al leer. Una línea acá evita
 * tocar seis componentes.
 */

export interface ItemTemario {
  id: number
  slug: string
  titulo: string
  orden: number
  gratis: boolean
}

export interface Curso {
  id: number
  titulo: string
  descripcion: string | null
  nivel: string
  gradoSlug: string
  gradoNombre: string
  materia: string
  materiaSlug: string
  precioCentavos: number
}

// Supabase devuelve las relaciones anidadas; el nombre de la propiedad es el de
// la tabla referenciada.
interface FilaCurso {
  id: number
  titulo: string
  descripcion: string | null
  nivel: string
  grado_slug: string
  grado_nombre: string
  precio_centavos: number
  materias: { nombre: string; slug: string } | null
}

const SELECT_CURSO =
  'id, titulo, descripcion, nivel, grado_slug, grado_nombre, precio_centavos, materias!inner(nombre, slug)'

function aCurso(fila: FilaCurso): Curso {
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    nivel: fila.nivel,
    gradoSlug: fila.grado_slug,
    gradoNombre: fila.grado_nombre,
    materia: fila.materias?.nombre ?? '',
    materiaSlug: fila.materias?.slug ?? '',
    precioCentavos: fila.precio_centavos,
  }
}

export async function getCurso(gradoSlug: string, materiaSlug: string): Promise<Curso | null> {
  const { data, error } = await supabasePublico()
    .from('cursos')
    .select(SELECT_CURSO)
    .eq('grado_slug', gradoSlug)
    .eq('materias.slug', materiaSlug)
    .maybeSingle<FilaCurso>()

  if (error) throw new Error(`No se pudo leer el curso: ${error.message}`)
  // `materias!inner` hace que el filtro por materia descarte filas de verdad.
  // Sin el !inner, PostgREST devuelve igual el curso con materias en null, y
  // maybeSingle() explotaria en cuanto un grado tenga dos materias.
  if (!data?.materias) return null
  return aCurso(data)
}

export async function getTemario(cursoId: number): Promise<ItemTemario[]> {
  const { data, error } = await supabasePublico()
    .from('temas')
    .select('id, slug, titulo, orden, gratis')
    .eq('curso_id', cursoId)
    .order('orden')

  if (error) throw new Error(`No se pudo leer el temario: ${error.message}`)
  return data ?? []
}

export async function getTema(
  gradoSlug: string,
  materiaSlug: string,
  temaSlug: string,
): Promise<{ tema: Tema; curso: Curso; temario: ItemTemario[] } | null> {
  const curso = await getCurso(gradoSlug, materiaSlug)
  if (!curso) return null

  const { data, error } = await supabasePublico()
    .from('temas')
    .select('id, slug, titulo, categoria, duracion_label, video_url, gratis, orden, contenido')
    .eq('curso_id', curso.id)
    .eq('slug', temaSlug)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer el tema: ${error.message}`)
  if (!data) return null

  // El jsonb entra como `unknown`: lo que está guardado pudo haberse cargado
  // con una versión vieja del schema. Si no valida, es mejor romper que
  // renderizar un tema a medias.
  const contenido = TemaContenidoSchema.parse(data.contenido)

  const tema: Tema = {
    id: data.orden,
    slug: data.slug,
    titulo: data.titulo,
    grado: curso.gradoNombre,
    gradoSlug: curso.gradoSlug,
    materia: curso.materia,
    materiaSlug: curso.materiaSlug,
    categoria: data.categoria ?? '',
    duracionLabel: data.duracion_label ?? '',
    ...contenido,
  }

  return { tema, curso, temario: await getTemario(curso.id) }
}

/** Todas las rutas de temas publicados, para prerenderizarlas en el build. */
export async function getRutasDeTemas(): Promise<
  { grado: string; materia: string; tema: string }[]
> {
  const { data, error } = await supabasePublico()
    .from('temas')
    .select('slug, cursos(grado_slug, materias(slug))')
    .overrideTypes<{ slug: string; cursos: { grado_slug: string; materias: { slug: string } | null } | null }[]>()

  if (error) throw new Error(`No se pudieron leer las rutas: ${error.message}`)

  return (data ?? []).flatMap(t =>
    t.cursos?.materias
      ? [{ grado: t.cursos.grado_slug, materia: t.cursos.materias.slug, tema: t.slug }]
      : [],
  )
}

/**
 * Lectura para el panel: usa la clave secreta, así que ve también los temas sin
 * publicar. Nunca debe llamarse desde una página del alumno.
 */
export async function getTemaParaAdmin(cursoId: number, temaSlug: string) {
  const { data, error } = await supabaseAdmin()
    .from('temas')
    .select('id, slug, titulo, categoria, duracion_label, video_url, gratis, publicado, orden, contenido')
    .eq('curso_id', cursoId)
    .eq('slug', temaSlug)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer el tema: ${error.message}`)
  return data
}
