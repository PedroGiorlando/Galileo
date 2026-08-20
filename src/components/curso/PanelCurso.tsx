'use client'

import { FileText, FileSpreadsheet, LifeBuoy, Printer } from 'lucide-react'
import { ProgressRing } from '../ProgressRing'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const RECURSOS = [
  { icon: FileText, label: 'Formulario de fórmulas', accion: 'Descargar', color: 'bg-blue-100 text-blue-600' },
  { icon: FileSpreadsheet, label: 'Tablas de apoyo', accion: 'Ver recursos', color: 'bg-green-100 text-green-600' },
  { icon: Printer, label: 'Ejercicios imprimibles', accion: 'Descargar', color: 'bg-orange-100 text-orange-600' },
]

/**
 * Panel derecho del temario. Es Client Component porque el progreso sale de
 * localStorage; cuando exista la tabla `progreso` en la base, el dato llegará
 * por props desde el servidor y esto vuelve a ser estático.
 */
export function PanelCurso({ cursoSlug, cursoNombre, totalClases }: {
  cursoSlug: string
  cursoNombre: string
  totalClases: number
}) {
  const [completados] = useLocalStorage<string[]>(`galileo:completados:${cursoSlug}`, [])
  const porcentaje = totalClases > 0 ? (completados.length / totalClases) * 100 : 0

  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-72">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Tu progreso en {cursoNombre}</h3>
        <div className="flex items-center gap-4">
          <ProgressRing percent={porcentaje} size={80} />
          <p className="text-sm text-slate-600">
            <strong className="text-slate-800">
              {completados.length} de {totalClases}
            </strong>
            <br />
            clases completadas
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Recursos adicionales</h3>
        <ul className="space-y-3">
          {RECURSOS.map(r => (
            <li key={r.label} className="flex items-center gap-3 text-sm">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${r.color}`}>
                <r.icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-slate-700">{r.label}</p>
                <button
                  type="button"
                  onClick={() =>
                    alert(`"${r.label}" es una demo visual: todavía no hay archivos cargados.`)
                  }
                  className="text-xs font-medium text-green-700 hover:underline"
                >
                  {r.accion}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
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
