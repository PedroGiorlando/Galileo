'use client'

/**
 * Los dos botones de sesión son lo único interactivo de la cabecera, así que el
 * límite cliente/servidor cae acá y no en el Header entero. Un Server Component
 * no puede llevar onClick: se renderiza en el servidor, donde no hay clicks.
 *
 * ponytail: por ahora avisan que no están habilitados. En la Fase 2 pasan a
 * enlazar al login real y este archivo desaparece o se vuelve un par de Links.
 */
export function BotonesSesion() {
  const aviso = () => alert('Las cuentas todavía no están habilitadas.')

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={aviso}
        className="rounded-md border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800"
      >
        Iniciar sesión
      </button>
      <button
        type="button"
        onClick={aviso}
        className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-700"
      >
        Registrate
      </button>
    </div>
  )
}
