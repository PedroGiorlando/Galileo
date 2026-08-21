import { supabaseAdmin, supabasePublico } from './supabase'
import { TemaContenidoSchema } from './schemas'
import type { SubtemaCompleto } from '@/data/topicData'

/**
 * Capa de datos: lo único que sabe que existe una base.
 *
 * Vocabulario:
 *   programa → carrera → curso     dónde se dicta y qué se compra
 *   materia  → módulo  → clase     el contenido, escrito una sola vez
 *   curso_modulos                  qué módulos incluye cada curso
 *
 * Una clase de Cinemática existe una vez y aparece tanto en Física-UNCuyo como
 * en Física-UTN. Por eso su dirección es /clase/fisica/velocidad-media: depende
 * de la materia, no del curso desde el que se llegó.
 *
 * REGLA APRENDIDA A LOS GOLPES: acá no se anida nada que no tenga una clave
 * foránea simple. `clases.materia_id` existe como columna, pero la clave
 * foránea es compuesta contra modulos(id, materia_id), así que PostgREST no
 * sabe hacer `clases → materias` y la consulta falla entera. Dos consultas
 * chicas y un Map son más aburridas y no fallan.
 */

export interface Programa {
  id: number
  slug: string
  nombre: string
}

export interface Carrera {
  id: number
  slug: string
  nombre: string
}

export interface Materia {
  id: number
  slug: string
  nombre: string
}

export interface ClaseResumen {
  id: number
  slug: string
  titulo: string
  descripcion: string | null
  orden: number
  gratis: boolean
  duracionLabel: string | null
  tieneContenido: boolean
}

export interface ModuloConClases {
  id: number
  slug: string
  nombre: string
  orden: number
  clases: ClaseResumen[]
}

export interface Curso {
  id: number
  titulo: string
  descripcion: string | null
  precioCentavos: number
  materia: Materia
  carrera: Carrera
  programa: Programa
}

// --- Programas y carreras ----------------------------------------------------

export async function getProgramas(): Promise<Programa[]> {
  const { data, error } = await supabasePublico()
    .from('programas')
    .select('id, slug, nombre')
    .order('orden')

  if (error) throw new Error(`No se pudieron leer los programas: ${error.message}`)
  return data ?? []
}

export async function getPrograma(slug: string): Promise<Programa | null> {
  const { data, error } = await supabasePublico()
    .from('programas')
    .select('id, slug, nombre')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer el programa: ${error.message}`)
  return data
}

export async function getCarreras(programaId: number): Promise<Carrera[]> {
  const { data, error } = await supabasePublico()
    .from('carreras')
    .select('id, slug, nombre')
    .eq('programa_id', programaId)
    .order('orden')

  if (error) throw new Error(`No se pudieron leer las carreras: ${error.message}`)
  return data ?? []
}

export async function getCarrera(programaId: number, slug: string): Promise<Carrera | null> {
  const { data, error } = await supabasePublico()
    .from('carreras')
    .select('id, slug, nombre')
    .eq('programa_id', programaId)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer la carrera: ${error.message}`)
  return data
}

// --- Cursos ------------------------------------------------------------------

interface FilaCurso {
  id: number
  titulo: string
  descripcion: string | null
  precio_centavos: number
  materias: Materia
}

const SELECT_CURSO = 'id, titulo, descripcion, precio_centavos, materias!inner(id, slug, nombre)'

/** Las materias que ofrece una carrera. */
export async function getCursosDeCarrera(
  programa: Programa,
  carrera: Carrera,
): Promise<Curso[]> {
  const { data, error } = await supabasePublico()
    .from('cursos')
    .select(SELECT_CURSO)
    .eq('carrera_id', carrera.id)
    .order('orden')
    .overrideTypes<FilaCurso[]>()

  if (error) throw new Error(`No se pudieron leer los cursos: ${error.message}`)

  return (data ?? []).map(c => ({
    id: c.id,
    titulo: c.titulo,
    descripcion: c.descripcion,
    precioCentavos: c.precio_centavos,
    materia: c.materias,
    carrera,
    programa,
  }))
}

export async function getCurso(
  programaSlug: string,
  carreraSlug: string,
  materiaSlug: string,
): Promise<Curso | null> {
  const programa = await getPrograma(programaSlug)
  if (!programa) return null

  const carrera = await getCarrera(programa.id, carreraSlug)
  if (!carrera) return null

  const cursos = await getCursosDeCarrera(programa, carrera)
  return cursos.find(c => c.materia.slug === materiaSlug) ?? null
}

/**
 * El temario de un curso: los módulos que incluye, en el orden que definió ese
 * curso, con sus clases.
 *
 * El orden lo manda `curso_modulos.orden` y no `modulos.orden`, porque el mismo
 * módulo puede ir tercero en una carrera y quinto en otra.
 */
export async function getTemario(cursoId: number): Promise<ModuloConClases[]> {
  const supabase = supabasePublico()

  const { data: asignados, error: e1 } = await supabase
    .from('curso_modulos')
    .select('orden, modulos!inner(id, slug, nombre)')
    .eq('curso_id', cursoId)
    .order('orden')
    .overrideTypes<{ orden: number; modulos: { id: number; slug: string; nombre: string } }[]>()

  if (e1) throw new Error(`No se pudo leer el temario: ${e1.message}`)
  if (!asignados || asignados.length === 0) return []

  const ids = asignados.map(a => a.modulos.id)

  const { data: clases, error: e2 } = await supabase
    .from('clases')
    .select('id, slug, titulo, descripcion, orden, gratis, duracion_label, modulo_id, contenido')
    .in('modulo_id', ids)
    .order('orden')

  if (e2) throw new Error(`No se pudieron leer las clases: ${e2.message}`)

  const porModulo = new Map<number, ClaseResumen[]>()
  for (const c of clases ?? []) {
    const lista = porModulo.get(c.modulo_id) ?? []
    lista.push({
      id: c.id,
      slug: c.slug,
      titulo: c.titulo,
      descripcion: c.descripcion,
      orden: c.orden,
      gratis: c.gratis,
      duracionLabel: c.duracion_label,
      tieneContenido: c.contenido != null,
    })
    porModulo.set(c.modulo_id, lista)
  }

  return asignados.map(a => ({
    id: a.modulos.id,
    slug: a.modulos.slug,
    nombre: a.modulos.nombre,
    orden: a.orden,
    clases: porModulo.get(a.modulos.id) ?? [],
  }))
}

// --- Clases ------------------------------------------------------------------

export async function getMateria(slug: string): Promise<Materia | null> {
  const { data, error } = await supabasePublico()
    .from('materias')
    .select('id, slug, nombre')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer la materia: ${error.message}`)
  return data
}

export interface ClasePagina {
  materia: Materia
  modulo: { id: number; slug: string; nombre: string }
  clase: SubtemaCompleto | null
  resumen: ClaseResumen
  /** Todas las clases de la materia, agrupadas por módulo, para navegar. */
  temario: ModuloConClases[]
}

export async function getClase(
  materiaSlug: string,
  claseSlug: string,
): Promise<ClasePagina | null> {
  const materia = await getMateria(materiaSlug)
  if (!materia) return null

  const supabase = supabasePublico()

  const { data, error } = await supabase
    .from('clases')
    .select(
      'id, slug, titulo, descripcion, orden, gratis, duracion_label, video_url, contenido, modulo_id',
    )
    .eq('materia_id', materia.id)
    .eq('slug', claseSlug)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer la clase: ${error.message}`)
  if (!data) return null

  const { data: modulo, error: e2 } = await supabase
    .from('modulos')
    .select('id, slug, nombre')
    .eq('id', data.modulo_id)
    .maybeSingle()

  if (e2 || !modulo) throw new Error('No se pudo leer el módulo de la clase.')

  const resumen: ClaseResumen = {
    id: data.id,
    slug: data.slug,
    titulo: data.titulo,
    descripcion: data.descripcion,
    orden: data.orden,
    gratis: data.gratis,
    duracionLabel: data.duracion_label,
    tieneContenido: data.contenido != null,
  }

  // Sin contenido no hay página completa: la ruta responde "Próximamente". Con
  // contenido, se valida antes de renderizar — lo guardado pudo cargarse con
  // una versión vieja del schema, y es mejor romper que mostrar algo a medias.
  const clase: SubtemaCompleto | null = data.contenido
    ? {
        id: data.orden,
        slug: data.slug,
        titulo: data.titulo,
        descripcion: data.descripcion,
        videoUrl: data.video_url,
        duracionLabel: data.duracion_label ?? '',
        ...TemaContenidoSchema.parse(data.contenido),
      }
    : null

  return { materia, modulo, clase, resumen, temario: await getTemarioDeMateria(materia.id) }
}

/** Todos los módulos y clases de una materia, sin filtrar por curso. */
export async function getTemarioDeMateria(materiaId: number): Promise<ModuloConClases[]> {
  const supabase = supabasePublico()

  const { data: modulos, error: e1 } = await supabase
    .from('modulos')
    .select('id, slug, nombre, orden')
    .eq('materia_id', materiaId)
    .order('orden')

  if (e1) throw new Error(`No se pudieron leer los módulos: ${e1.message}`)
  if (!modulos || modulos.length === 0) return []

  const { data: clases, error: e2 } = await supabase
    .from('clases')
    .select('id, slug, titulo, descripcion, orden, gratis, duracion_label, modulo_id, contenido')
    .eq('materia_id', materiaId)
    .order('orden')

  if (e2) throw new Error(`No se pudieron leer las clases: ${e2.message}`)

  const porModulo = new Map<number, ClaseResumen[]>()
  for (const c of clases ?? []) {
    const lista = porModulo.get(c.modulo_id) ?? []
    lista.push({
      id: c.id,
      slug: c.slug,
      titulo: c.titulo,
      descripcion: c.descripcion,
      orden: c.orden,
      gratis: c.gratis,
      duracionLabel: c.duracion_label,
      tieneContenido: c.contenido != null,
    })
    porModulo.set(c.modulo_id, lista)
  }

  return modulos.map(m => ({
    id: m.id,
    slug: m.slug,
    nombre: m.nombre,
    orden: m.orden,
    clases: porModulo.get(m.id) ?? [],
  }))
}

// --- Rutas para prerenderizar en el build ------------------------------------

export async function getRutasDeCarreras(): Promise<{ programa: string; carrera: string }[]> {
  const supabase = supabasePublico()
  const { data: programas } = await supabase.from('programas').select('id, slug')
  const { data: carreras } = await supabase.from('carreras').select('slug, programa_id')

  const slugPorId = new Map((programas ?? []).map(p => [p.id, p.slug]))
  return (carreras ?? []).flatMap(c => {
    const programa = slugPorId.get(c.programa_id)
    return programa ? [{ programa, carrera: c.slug }] : []
  })
}

export async function getRutasDeCursos(): Promise<
  { programa: string; carrera: string; materia: string }[]
> {
  const supabase = supabasePublico()
  const { data: programas } = await supabase.from('programas').select('id, slug')
  const { data: carreras } = await supabase.from('carreras').select('id, slug, programa_id')
  const { data: materias } = await supabase.from('materias').select('id, slug')
  const { data: cursos } = await supabase.from('cursos').select('carrera_id, materia_id')

  const prog = new Map((programas ?? []).map(p => [p.id, p.slug]))
  const carr = new Map((carreras ?? []).map(c => [c.id, c]))
  const mat = new Map((materias ?? []).map(m => [m.id, m.slug]))

  return (cursos ?? []).flatMap(c => {
    const carrera = carr.get(c.carrera_id)
    const programa = carrera ? prog.get(carrera.programa_id) : undefined
    const materia = mat.get(c.materia_id)
    return programa && carrera && materia
      ? [{ programa, carrera: carrera.slug, materia }]
      : []
  })
}

/** Solo las clases que YA tienen contenido: el resto no vale prerenderizarlo. */
export async function getRutasDeClases(): Promise<{ materia: string; clase: string }[]> {
  const supabase = supabasePublico()
  const { data: materias } = await supabase.from('materias').select('id, slug')
  const { data: clases } = await supabase
    .from('clases')
    .select('slug, materia_id')
    .not('contenido', 'is', null)

  const slugPorId = new Map((materias ?? []).map(m => [m.id, m.slug]))
  return (clases ?? []).flatMap(c => {
    const materia = slugPorId.get(c.materia_id)
    return materia ? [{ materia, clase: c.slug }] : []
  })
}

// --- Panel -------------------------------------------------------------------

/** Lee con la clave secreta: ve también lo que no está publicado. */
export async function getClaseParaAdmin(materiaId: number, claseSlug: string) {
  const { data, error } = await supabaseAdmin()
    .from('clases')
    .select('*, modulos!inner(id, slug, nombre)')
    .eq('materia_id', materiaId)
    .eq('slug', claseSlug)
    .maybeSingle()

  if (error) throw new Error(`No se pudo leer la clase: ${error.message}`)
  return data
}
