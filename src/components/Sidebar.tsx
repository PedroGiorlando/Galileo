import { Check, Lock, LifeBuoy } from 'lucide-react'
import { temarioSidebar, tema, TOTAL_TEMAS_GRADO } from '../data/topicData'

interface SidebarProps {
  temaActualCompletado: boolean
}

export function Sidebar({ temaActualCompletado }: SidebarProps) {
  return (
    <aside className="w-72 shrink-0 rounded-lg border border-slate-200 bg-white p-4">
      <span className="mb-2 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-green-700">
        {tema.categoria}
      </span>
      <h2 className="mb-1 text-lg font-bold text-slate-800">Temario del curso</h2>
      <p className="mb-4 text-sm text-slate-500">
        Tema {tema.id} de {TOTAL_TEMAS_GRADO}
      </p>

      <ul className="space-y-1">
        {temarioSidebar.map(item => {
          const completo = item.completado || (item.actual && temaActualCompletado)
          return (
            <li
              key={item.id}
              className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                item.actual ? 'bg-green-50 font-medium text-green-700' : 'text-slate-600'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  completo
                    ? 'bg-green-500 text-white'
                    : item.actual
                      ? 'border-2 border-green-500 text-green-600'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {completo ? <Check size={13} /> : item.actual ? item.id : <Lock size={11} />}
              </span>
              <span>{item.titulo}</span>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-md border border-slate-200 py-2 text-sm text-slate-400"
      >
        Ver todos los temas
      </button>

      <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-800">
          <LifeBuoy size={16} className="text-teal-600" /> ¿Necesitás ayuda?
        </h3>
        <p className="mb-3 text-sm text-teal-700">Nuestro equipo está para ayudarte.</p>
        <button
          type="button"
          onClick={() => window.alert('"Contactar soporte" es solo una demo visual, no abre nada todavía.')}
          className="w-full rounded-md bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Contactar soporte
        </button>
      </div>
    </aside>
  )
}
