import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

/**
 * Clientes de Supabase según quién y desde dónde consulta:
 *
 * - `supabasePublico`   clave pública, sin sesión. Lee el catálogo publicado
 *                       desde el servidor, en páginas estáticas.
 * - `supabaseNavegador` la misma clave, con la sesión del visitante, en el
 *                       navegador.
 * - `supabaseSesion`    (en supabase-servidor.ts) clave pública + cookies.
 *                       Vive aparte porque importa next/headers, y ese import
 *                       no puede aparecer en un archivo que toque el cliente.
 * - `supabaseAdmin`     clave secreta. SALTEA RLS por completo. Solo servidor.
 *
 * IMPORTANTE: las variables se nombran completas y literales, nunca con una
 * clave dinámica como `process.env[nombre]`.
 *
 * Las `NEXT_PUBLIC_*` no existen en el navegador: el compilador reemplaza el
 * texto exacto `process.env.NEXT_PUBLIC_ALGO` por su valor al construir. Con
 * una clave dinámica no hay texto que reconocer, así que no reemplaza nada y en
 * el navegador queda `undefined`. En el servidor no se nota, porque ahí
 * `process.env` sí existe en tiempo de ejecución.
 */

const FALTA = 'Faltan las variables de Supabase. Copiá .env.example a .env.local y completalas.'

export function supabasePublico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !clave) throw new Error(FALTA)

  return createClient(url, clave, { auth: { persistSession: false } })
}

export function supabaseNavegador() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !clave) throw new Error(FALTA)

  return createBrowserClient(url, clave)
}

export function supabaseAdmin() {
  // Cinturón: si esto se evaluara en el navegador, mejor romper acá y fuerte
  // que filtrar la clave secreta en un bundle.
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin() no puede usarse en el navegador.')
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !secreta) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en .env.local.')
  }

  return createClient(url, secreta, { auth: { persistSession: false } })
}
