import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente con la sesión del visitante, leída de las cookies.
 *
 * Vive en su propio archivo porque importa `next/headers`, y ese import
 * envenena cualquier módulo que además use el cliente: al tenerlo junto a
 * `supabaseNavegador`, el build falló con "You're importing a module that
 * depends on next/headers".
 *
 * Solo sirve en Server Components, Server Actions y Route Handlers. Ojo: usarlo
 * en una página que hoy es estática la vuelve dinámica, porque leer cookies
 * obliga a Next a renderizar en cada visita.
 */
export async function supabaseSesion() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !clave) {
    throw new Error('Faltan las variables de Supabase. Copiá .env.example a .env.local.')
  }

  const almacen = await cookies()

  return createServerClient(url, clave, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: cookiesNuevas => {
        try {
          cookiesNuevas.forEach(({ name, value, options }) => almacen.set(name, value, options))
        } catch {
          // Un Server Component puede leer cookies pero no escribirlas. La
          // renovación del token la hace el middleware, que sí puede.
        }
      },
    },
  })
}
