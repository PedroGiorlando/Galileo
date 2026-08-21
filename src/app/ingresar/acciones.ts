'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabaseSesion } from '@/lib/supabase-servidor'

/**
 * Registro, ingreso y salida.
 *
 * Los mensajes de error son deliberadamente parejos entre "no existe ese mail"
 * y "la contraseña está mal": distinguirlos le confirma a cualquiera si una
 * dirección tiene cuenta en la plataforma.
 */

const Credenciales = z.object({
  email: z.email('Revisá el correo, no parece una dirección válida'),
  password: z.string().min(8, 'La contraseña necesita al menos 8 caracteres'),
})

export type ResultadoAuth = { error: string } | { ok: true; aviso?: string }

function leerCredenciales(datos: FormData) {
  return Credenciales.safeParse({
    email: String(datos.get('email') ?? '').trim(),
    password: String(datos.get('password') ?? ''),
  })
}

export async function registrarse(_previo: unknown, datos: FormData): Promise<ResultadoAuth> {
  const r = leerCredenciales(datos)
  if (!r.success) return { error: r.error.issues[0].message }

  const supabase = await supabaseSesion()
  const { data, error } = await supabase.auth.signUp(r.data)

  if (error) {
    return { error: 'No pudimos crear la cuenta. Probá de nuevo en un momento.' }
  }

  // Con confirmación por correo activada, Supabase devuelve el usuario pero sin
  // sesión: hay que avisar que revise el mail en vez de dejarlo esperando.
  if (data.user && !data.session) {
    return { ok: true, aviso: 'Te mandamos un correo para confirmar la cuenta. Revisá tu bandeja.' }
  }

  revalidatePath('/', 'layout')
  redirect('/mi-cuenta')
}

export async function ingresar(_previo: unknown, datos: FormData): Promise<ResultadoAuth> {
  const r = leerCredenciales(datos)
  if (!r.success) return { error: r.error.issues[0].message }

  const supabase = await supabaseSesion()
  const { error } = await supabase.auth.signInWithPassword(r.data)

  if (error) return { error: 'Correo o contraseña incorrectos.' }

  revalidatePath('/', 'layout')
  redirect('/mi-cuenta')
}

export async function salir() {
  const supabase = await supabaseSesion()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
