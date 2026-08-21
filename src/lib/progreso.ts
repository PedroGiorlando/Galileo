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

export interface ResumenProgreso {
  materiaId: number
  materiaSlug: string
  materiaNombre: string
  completadas: number
  total: number
}

/**
 * Avance por materia, para la página de cuenta.
 *
 * Va por materia y no por carrera porque el progreso vive en la clase: quien
 * completó Cinemática la completó, sin importar desde qué carrera entró.
 */
export async function getResumenPorMateria(): Promise<ResumenProgreso[]> {
  const supabase = await supabaseSesion()
  const { data: sesion } = await supabase.auth.getUser()
  if (!sesion.user) return []

  const { data: materias, error: e1 } = await supabase
    .from('materias')
    .select('id, slug, nombre')
    .order('orden')

  if (e1) throw new Error(`No se pudieron leer las materias: ${e1.message}`)

  // Dos consultas y un cruce en memoria, en vez de una por materia.
  const { data: clases, error: e2 } = await supabase.from('clases').select('id, materia_id')
  if (e2) throw new Error(`No se pudieron leer las clases: ${e2.message}`)

  const { data: hechas, error: e3 } = await supabase
    .from('progreso')
    .select('clase_id')
    .eq('completado', true)

  if (e3) throw new Error(`No se pudo leer el progreso: ${e3.message}`)

  const materiaDeClase = new Map((clases ?? []).map(c => [c.id, c.materia_id]))
  const completadasPorMateria = new Map<number, number>()
  for (const fila of hechas ?? []) {
    const materia = materiaDeClase.get(fila.clase_id)
    if (materia != null) {
      completadasPorMateria.set(materia, (completadasPorMateria.get(materia) ?? 0) + 1)
    }
  }

  const totalPorMateria = new Map<number, number>()
  for (const c of clases ?? []) {
    totalPorMateria.set(c.materia_id, (totalPorMateria.get(c.materia_id) ?? 0) + 1)
  }

  return (materias ?? []).map(m => ({
    materiaId: m.id,
    materiaSlug: m.slug,
    materiaNombre: m.nombre,
    completadas: completadasPorMateria.get(m.id) ?? 0,
    total: totalPorMateria.get(m.id) ?? 0,
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
