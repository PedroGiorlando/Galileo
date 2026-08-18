import { createClient } from '@supabase/supabase-js'

/**
 * Dos clientes, dos niveles de permiso. La diferencia importa:
 *
 * - `supabasePublico` usa la clave pública. Respeta RLS, así que solo ve lo
 *   publicado. Es el que usan las páginas del alumno.
 * - `supabaseAdmin` usa la clave secreta y SALTEA RLS por completo. Solo puede
 *   correr en el servidor (Server Actions, scripts, webhooks). Si esta clave
 *   llegara al navegador, cualquiera podría leer y escribir toda la base.
 *
 * Se crean dentro de funciones y no como constantes de módulo: si fueran
 * constantes, importar este archivo desde un Client Component reventaría en el
 * build por falta de variables, aun sin usar el cliente admin.
 */

function requerir(nombre: string): string {
  const valor = process.env[nombre]
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Copiá .env.example a .env.local y completala.`,
    )
  }
  return valor
}

export function supabasePublico() {
  return createClient(
    requerir('NEXT_PUBLIC_SUPABASE_URL'),
    requerir('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { auth: { persistSession: false } },
  )
}

export function supabaseAdmin() {
  // Cinturón: si esto se evaluara en el navegador, mejor romper acá y fuerte
  // que filtrar la clave secreta en un bundle.
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin() no puede usarse en el navegador.')
  }
  return createClient(requerir('NEXT_PUBLIC_SUPABASE_URL'), requerir('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  })
}
