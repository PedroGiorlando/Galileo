import Link from 'next/link'
import { ArrowLeft, Check, LifeBuoy, Lock } from 'lucide-react'
import type { ModuloConClases } from '@/lib/contenido'

interface SidebarProps {
  materiaSlug: string
  materiaNombre: string
  moduloNombre: string
  temario: ModuloConClases[]
  slugActual: string
  completados: string[]
}

/**
 * Temario lateral. Muestra solo las clases de la unidad actual: el temario
 * completo de la materia son decenas y no entran en una barra lateral.
 * "Ver las N clases" lleva a la página de la materia, que sí las tiene todas.
 */
export function Sidebar({
  materiaSlug,
  materiaNombre,
  moduloNombre,
  temario,
  slugActual,
  completados,
}: SidebarProps) {
  const temaActual = temario.find(t => t.clases.some(s => s.slug === slugActual))
  const hermanos = temaActual?.clases ?? []
  const posicion = hermanos.findIndex(s => s.slug === slugActual)
  const totalDelCurso = temario.reduce((n, t) => n + t.clases.length, 0)

  return (
    <aside className="w-72 shrink-0 space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <Link
          href="/preuniversitario"
          className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={14} /> Volver a {materiaNombre}
        </Link>

        <h2 className="text-sm font-bold text-slate-800">{moduloNombre}</h2>
        {posicion >= 0 && (
          <>
            <p className="mt-0.5 mb-2 text-xs text-slate-500">
              Tema {posicion + 1} de {hermanos.length}
            </p>
            <div className="mb-4 h-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${((posicion + 1) / hermanos.length) * 100}%` }}
              />
            </div>
          </>
        )}

        <h3 className="mb-2 text-sm font-bold text-slate-800">Temario del curso</h3>
        <ul className="space-y-1">
          {hermanos.map(s => {
            const actual = s.slug === slugActual
            const completo = completados.includes(s.slug)
            return (
              <li key={s.id}>
                <Link
                  href={`/clase/${materiaSlug}/${s.slug}`}
                  className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                    actual
                      ? 'bg-orange-50 font-medium text-orange-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      completo
                        ? 'bg-green-500 text-white'
                        : actual
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {completo ? <Check size={14} /> : s.orden}
                  </span>
                  <span className="min-w-0 flex-1">{s.titulo}</span>
                  {!s.tieneContenido && <Lock size={12} className="shrink-0 text-slate-300" />}
                </Link>
              </li>
            )
          })}
        </ul>

        <Link
          href="/preuniversitario"
          className="mt-4 block rounded-md border border-slate-200 py-2 text-center text-sm text-slate-600 hover:bg-slate-50"
        >
          Ver las {totalDelCurso} clases
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <LifeBuoy size={16} className="text-slate-500" /> ¿Necesitás ayuda?
        </h3>
        <p className="mt-1 text-xs text-slate-500">Nuestro equipo está para ayudarte.</p>
        <button
          type="button"
          onClick={() => alert('El soporte todavía no está conectado.')}
          className="mt-2 w-full rounded-md bg-white py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
        >
          Contactar soporte
        </button>
      </div>
    </aside>
  )
}
