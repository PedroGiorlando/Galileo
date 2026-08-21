import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

/**
 * Cuatro clientes, cuatro situaciones. La diferencia importa:
 *
 * - `supabasePublico`  clave pública, sin sesión. Lee el catálogo publicado.
 *                      Lo usan las páginas estáticas, que no tienen usuario.
 * - `supabaseSesion`   (en supabase-servidor.ts) clave pública + cookies. Vive
 *                      aparte porque importa next/headers, y ese import no
 *                      puede aparecer en un archivo que toque el cliente.
 * - `supabaseNavegador` la misma sesión, del lado del cliente.
 * - `supabaseAdmin`    clave secreta. SALTEA RLS por completo. Solo servidor.
 *
 * Se crean dentro de funciones y no como constantes de módulo: si fueran
 * constantes, importar este archivo desde un Client Component reventaría en el
 * build por falta de variables, aun sin usar el cliente que las necesita.
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

const URL = () => requerir('NEXT_PUBLIC_SUPABASE_URL')
const CLAVE_PUBLICA = () => requerir('NEXT_PUBLIC_SUPABASE_ANON_KEY')

export function supabasePublico() {
  return createClient(URL(), CLAVE_PUBLICA(), { auth: { persistSession: false } })
}

/** El mismo usuario, pero desde el navegador. */
export function supabaseNavegador() {
  return createBrowserClient(URL(), CLAVE_PUBLICA())
}

export function supabaseAdmin() {
  // Cinturón: si esto se evaluara en el navegador, mejor romper acá y fuerte
  // que filtrar la clave secreta en un bundle.
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin() no puede usarse en el navegador.')
  }
  return createClient(URL(), requerir('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  })
}
