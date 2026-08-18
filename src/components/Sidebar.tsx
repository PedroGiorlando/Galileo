import { Check, Lock, LifeBuoy } from 'lucide-react'
import type { ItemTemario } from '@/lib/temas'

interface SidebarProps {
  temario: ItemTemario[]
  slugActual: string
  categoria: string
  completados: string[]
}

export function Sidebar({ temario, slugActual, categoria, completados }: SidebarProps) {
  const ordenActual = temario.find(t => t.slug === slugActual)?.orden

  return (
    <aside className="w-72 shrink-0 rounded-lg border border-slate-200 bg-white p-4">
      <span className="mb-2 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-green-700">
        {categoria}
      </span>
      <h2 className="mb-1 text-lg font-bold text-slate-800">Temario del curso</h2>
      <p className="mb-4 text-sm text-slate-500">
        Tema {ordenActual ?? '—'} de {temario.length}
      </p>

      <ul className="space-y-1">
        {temario.map(item => {
          const actual = item.slug === slugActual
          const completo = completados.includes(item.slug)
          return (
            <li
              key={item.id}
              className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                actual ? 'bg-green-50 font-medium text-green-700' : 'text-slate-600'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  completo
                    ? 'bg-green-500 text-white'
                    : actual
                      ? 'border-2 border-green-500 text-green-600'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {completo ? <Check size={14} /> : actual ? item.orden : <Lock size={12} />}
              </span>
              <span>
                {item.orden}. {item.titulo}
              </span>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={() => alert('El temario completo llega cuando estén cargados todos los temas.')}
        className="mt-4 w-full rounded-md border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        Ver todos los temas
      </button>

      <div className="mt-4 rounded-lg bg-slate-50 p-3">
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
