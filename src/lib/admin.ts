import { esAdmin } from './progreso'

/**
 * Lo que comparten los dos archivos de acciones del panel.
 *
 * Va acá y no en uno de ellos porque los archivos con `'use server'` convierten
 * en endpoint HTTP todo lo que exportan: mover un ayudante allá lo publicaría
 * en internet sin necesidad.
 */

/** 'Trabajo y energía' → 'trabajo-y-energia'. */
export function aSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[°º]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export type Fallo = { ok: false; error: string }
export type Exito = { ok: true }

/**
 * Cada acción verifica el permiso por su cuenta.
 *
 * Una Server Action es un endpoint HTTP y se puede llamar sin pasar por
 * ninguna pantalla: proteger la página /admin no protege la acción.
 */
export async function rechazarSiNoEsAdmin(): Promise<Fallo | null> {
  if (!(await esAdmin())) {
    return { ok: false, error: 'Tu cuenta no tiene permiso para editar contenido.' }
  }
  return null
}

/** Traduce los errores de Postgres que se pueden provocar desde un formulario. */
export function mensajeDeError(error: { code?: string; message: string }, duplicado: string) {
  if (error.code === '23505') return duplicado
  // 23503: clave foránea. Pasa al borrar algo de lo que todavía cuelga otra
  // cosa, y el mensaje crudo de Postgres no le dice nada a nadie.
  if (error.code === '23503') return 'No se puede borrar: todavía hay cosas que dependen de esto.'
  return error.message
}
