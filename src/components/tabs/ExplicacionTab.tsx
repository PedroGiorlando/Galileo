import { Lightbulb } from 'lucide-react'
import { tema } from '../../data/topicData'
import { CompletarButton } from '../CompletarButton'

interface ExplicacionTabProps {
  completado: boolean
  onMarcarCompletado: () => void
}

export function ExplicacionTab({ completado, onMarcarCompletado }: ExplicacionTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{tema.titulo}</h1>
        <CompletarButton completado={completado} onClick={onMarcarCompletado} />
      </div>

      {tema.explicacion.map(seccion => (
        <section key={seccion.titulo}>
          <h2 className="mb-2 text-lg font-bold text-slate-800">{seccion.titulo}</h2>
          <p className="mb-3 text-slate-600">{seccion.parrafo}</p>
          {seccion.caja && (
            <div
              className={`rounded-lg border p-4 text-sm ${
                seccion.caja.tipo === 'tip'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-green-200 bg-green-50 text-green-800'
              }`}
            >
              {seccion.caja.tipo === 'tip' && <Lightbulb size={16} className="mb-1" />}
              <pre className="whitespace-pre-wrap font-sans">{seccion.caja.contenido}</pre>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
