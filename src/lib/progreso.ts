import { supabaseSesion } from './supabase-servidor'

/**
 * Progreso del alumno, en la base.
 *
 * Usa el cliente con sesión, así que RLS hace el trabajo pesado: la política
 * `progreso_propio` limita cada consulta a las filas de quien pregunta. Acá no
 * hace falta filtrar por user_id, y aunque alguien se olvidara, la base no
 * devolvería nada de otro.
 *
 * Mientras no haya sesión, el progreso sigue viviendo en localStorage. Un
 * alumno que entra por primera vez puede completar clases sin registrarse, y
 * eso es lo que después lo empuja a crear la cuenta para no perderlas.
 */

export async function getUsuario() {
  const supabase = await supabaseSesion()
  const { data } = await supabase.auth.getUser()
  return data.user
}

/** Slugs de las clases completadas de una materia. */
export async function getCompletados(cursoId: number): Promise<string[]> {
  const supabase = await supabaseSesion()
  const { data: sesion } = await supabase.auth.getUser()
  if (!sesion.user) return []

  const { data, error } = await supabase
    .from('progreso')
    .select('subtemas!inner(slug, curso_id)')
    .eq('completado', true)
    .eq('subtemas.curso_id', cursoId)
    .overrideTypes<{ subtemas: { slug: string } }[]>()

  if (error) throw new Error(`No se pudo leer el progreso: ${error.message}`)
  return (data ?? []).map(p => p.subtemas.slug)
}

export interface ResumenProgreso {
  cursoId: number
  cursoSlug: string
  cursoNombre: string
  completadas: number
  total: number
}

/** Avance por materia, para la página de cuenta. */
export async function getResumenPorCurso(): Promise<ResumenProgreso[]> {
  const supabase = await supabaseSesion()
  const { data: sesion } = await supabase.auth.getUser()
  if (!sesion.user) return []

  const { data: cursos, error: e1 } = await supabase
    .from('cursos')
    .select('id, slug, nombre')
    .eq('nivel', 'preuniversitario')
    .order('orden')

  if (e1) throw new Error(`No se pudieron leer los cursos: ${e1.message}`)

  // Una consulta por materia sería más prolija de leer, pero son dos consultas
  // en total contra N+1: se traen todos los subtemas y todo el progreso, y se
  // cruzan en memoria.
  const { data: subtemas, error: e2 } = await supabase
    .from('subtemas')
    .select('id, curso_id')

  if (e2) throw new Error(`No se pudieron leer las clases: ${e2.message}`)

  const { data: hechas, error: e3 } = await supabase
    .from('progreso')
    .select('subtema_id')
    .eq('completado', true)

  if (e3) throw new Error(`No se pudo leer el progreso: ${e3.message}`)

  const cursoDeSubtema = new Map((subtemas ?? []).map(s => [s.id, s.curso_id]))
  const completadasPorCurso = new Map<number, number>()
  for (const fila of hechas ?? []) {
    const curso = cursoDeSubtema.get(fila.subtema_id)
    if (curso != null) completadasPorCurso.set(curso, (completadasPorCurso.get(curso) ?? 0) + 1)
  }

  const totalPorCurso = new Map<number, number>()
  for (const s of subtemas ?? []) {
    totalPorCurso.set(s.curso_id, (totalPorCurso.get(s.curso_id) ?? 0) + 1)
  }

  return (cursos ?? []).map(c => ({
    cursoId: c.id,
    cursoSlug: c.slug,
    cursoNombre: c.nombre,
    completadas: completadasPorCurso.get(c.id) ?? 0,
    total: totalPorCurso.get(c.id) ?? 0,
  }))
}

/**
 * Si quien está mirando puede entrar al panel.
 *
 * Consulta la tabla `admins`, cuya política solo devuelve la fila propia: nadie
 * puede averiguar quién más es admin, y nadie puede agregarse. Los user_id se
 * cargan a mano desde el dashboard de Supabase.
 */
export async function esAdmin(): Promise<boolean> {
  const supabase = await supabaseSesion()
  const { data: sesion } = await supabase.auth.getUser()
  if (!sesion.user) return false

  const { data } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', sesion.user.id)
    .maybeSingle()

  return Boolean(data)
}
