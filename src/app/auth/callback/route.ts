import { NextResponse, type NextRequest } from 'next/server'
import { supabaseSesion } from '@/lib/supabase-servidor'

/**
 * Donde aterriza el link de confirmación del correo.
 *
 * Supabase no manda la sesión en el mail: manda un código de un solo uso. El
 * link pasa por Supabase, que lo valida, y devuelve al sitio con `?code=...`.
 * Ese código hay que canjearlo por una sesión, y eso es lo que hace esta ruta.
 *
 * Sin ella, el link dejaba al alumno en la portada sin sesión y sin ningún
 * aviso: parecía que la confirmación había fallado en silencio.
 *
 * Es un Route Handler y no una página porque necesita ESCRIBIR la cookie de
 * sesión, y un Server Component solo puede leerlas.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const destino = searchParams.get('next') ?? '/mi-cuenta'

  if (!code) {
    return NextResponse.redirect(`${origin}/ingresar?error=sin-codigo`)
  }

  const supabase = await supabaseSesion()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // El código vence y es de un solo uso: un link viejo o ya usado cae acá.
    return NextResponse.redirect(`${origin}/ingresar?error=link-vencido`)
  }

  return NextResponse.redirect(`${origin}${destino}`)
}
