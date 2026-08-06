import { CheckCircle2, Circle, Lock } from 'lucide-react'
import { temarioSidebar, tema } from '../data/topicData'

export function Sidebar() {
  return (
    <aside className="w-72 shrink-0 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">{tema.categoria}</p>
      <h2 className="mb-1 text-lg font-bold text-slate-800">Temario del curso</h2>
      <p className="mb-4 text-sm text-slate-500">
        Tema {tema.id} de {temarioSidebar.length}
      </p>

      <ul className="space-y-1">
        {temarioSidebar.map(item => (
          <li
            key={item.id}
            className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
              item.actual ? 'bg-green-50 font-medium text-green-700' : 'text-slate-600'
            }`}
          >
            {item.completado ? (
              <CheckCircle2 size={16} className="shrink-0 text-green-600" />
            ) : item.actual ? (
              <Circle size={16} className="shrink-0 text-green-600" />
            ) : (
              <Lock size={14} className="shrink-0 text-slate-300" />
            )}
            <span>{item.id}. {item.titulo}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-md border border-slate-200 py-2 text-sm text-slate-400"
      >
        Ver todos los temas
      </button>
    </aside>
  )
}
