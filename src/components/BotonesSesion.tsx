'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { supabaseNavegador } from '@/lib/supabase'
import { salir } from '@/app/ingresar/acciones'

/**
 * Estado de sesión en la cabecera. Es Client Component POR NECESIDAD, no por
 * comodidad.
 *
 * La versión de servidor era más linda: leía las cookies y el HTML ya llegaba
 * con el correo puesto, sin parpadeo. Pero la cabecera está en todas las
 * páginas, y leer cookies obliga a Next a renderizar en cada visita: al
 * probarlo, las páginas del temario y de las clases pasaron de estáticas a
 * dinámicas. Es decir, un dato de la cabecera se llevaba puesto todo el SEO.
 *
 * Así, las páginas siguen siendo estáticas y la sesión se resuelve en el
 * navegador. El costo es un instante sin botones al cargar, que es
 * infinitamente más barato.
 */
export function BotonesSesion() {
  const [correo, setCorreo] = useState<string | null>(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    const supabase = supabaseNavegador()

    supabase.auth.getUser().then(({ data }) => {
      setCorreo(data.user?.email ?? null)
      setListo(true)
    })

    // Mantiene la cabecera al día si la sesión cambia en otra pestaña.
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setCorreo(sesion?.user?.email ?? null)
      setListo(true)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  if (!listo) {
    // Espacio reservado del alto de los botones: sin esto la cabecera salta
    // cuando aparecen.
    return <div className="h-11 w-40" aria-hidden="true" />
  }

  if (!correo) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/ingresar"
          className="flex min-h-11 items-center rounded-md border border-slate-600 px-3 text-sm hover:bg-slate-800"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/registrarse"
          className="flex min-h-11 items-center rounded-md bg-galileo px-3 text-sm font-medium hover:bg-galileo-oscuro"
        >
          Registrate
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/mi-cuenta"
        className="flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-slate-200 hover:bg-slate-800"
      >
        <UserRound size={16} />
        <span className="hidden max-w-40 truncate sm:inline">{correo}</span>
      </Link>
      {/* Salir cambia el estado del servidor, así que va como formulario y no
          como enlace: un GET no debería tener efectos. */}
      <form action={salir}>
        <button
          type="submit"
          className="flex min-h-11 items-center rounded-md border border-slate-600 px-3 text-sm hover:bg-slate-800"
        >
          Salir
        </button>
      </form>
    </div>
  )
}
