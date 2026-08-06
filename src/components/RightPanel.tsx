import { FileText, FileSpreadsheet, Printer, MessageCircleQuestion } from 'lucide-react'
import { ProgressRing } from './ProgressRing'

interface RightPanelProps {
  courseProgressPercent: number
  completedCount: number
  totalCount: number
}

const RECURSOS = [
  { icon: FileText, label: 'Resumen del tema', accion: 'Descargar (PDF)' },
  { icon: FileSpreadsheet, label: 'Ficha de ejemplos', accion: 'Descargar (PDF)' },
  { icon: Printer, label: 'Ejercicios imprimibles', accion: 'Descargar (PDF)' },
]

// Los recursos y el soporte son decorativos: no hay archivos ni backend
// detrás, así que un click solo confirma visualmente que "no está conectado".
function avisoDecorativo(label: string) {
  window.alert(`"${label}" es solo una demo visual, no descarga nada todavía.`)
}

export function RightPanel({ courseProgressPercent, completedCount, totalCount }: RightPanelProps) {
  return (
    <aside className="w-72 shrink-0 space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Tu progreso en el curso</h3>
        <div className="flex items-center gap-4">
          <ProgressRing percent={courseProgressPercent} size={80} />
          <p className="text-sm text-slate-600">
            {completedCount} de {totalCount} temas completados
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Recursos del tema</h3>
        <ul className="space-y-3">
          {RECURSOS.map(r => (
            <li key={r.label} className="flex items-center gap-3 text-sm">
              <r.icon size={18} className="text-green-600" />
              <div>
                <p className="text-slate-700">{r.label}</p>
                <button
                  type="button"
                  onClick={() => avisoDecorativo(r.label)}
                  className="text-green-600 hover:underline"
                >
                  {r.accion}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <MessageCircleQuestion size={16} /> ¿Dudas sobre este tema?
        </h3>
        <p className="mb-3 text-sm text-slate-500">Dejanos tu consulta y te respondemos.</p>
        <button
          type="button"
          onClick={() => avisoDecorativo('Hacer una pregunta')}
          className="w-full rounded-md border border-slate-200 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Hacer una pregunta
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Notas personales</h3>
        <textarea
          className="w-full rounded-md border border-slate-200 p-2 text-sm"
          rows={3}
          placeholder="Escribí aquí tus apuntes..."
        />
        <p className="mt-1 text-xs text-slate-400">Estas notas son privadas y solo visibles para vos.</p>
      </div>
    </aside>
  )
}
