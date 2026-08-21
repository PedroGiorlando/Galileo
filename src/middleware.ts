import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Renueva el token de sesión en cada navegación.
 *
 * Los tokens de Supabase vencen cada hora. Un Server Component puede leer
 * cookies pero no escribirlas, así que si la renovación dependiera de las
 * páginas, la sesión se cortaría sola cada hora en medio del estudio. El
 * middleware sí puede escribir, y por eso vive acá.
 *
 * `getUser()` no es opcional ni redundante: es lo que fuerza la validación del
 * token contra Supabase. `getSession()` se limita a leer la cookie, que el
 * navegador puede haber manipulado.
 */
export async function middleware(request: NextRequest) {
  let respuesta = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: cookiesNuevas => {
          cookiesNuevas.forEach(({ name, value }) => request.cookies.set(name, value))
          respuesta = NextResponse.next({ request })
          cookiesNuevas.forEach(({ name, value, options }) =>
            respuesta.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  await supabase.auth.getUser()

  return respuesta
}

export const config = {
  matcher: [
    /*
     * Todo menos archivos estáticos e imágenes. Renovar la sesión en cada
     * pedido de un ícono sería trabajo puro sin sentido.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
}
