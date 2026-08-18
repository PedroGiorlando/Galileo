import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Tema } from '../../data/topicData'
import { CompletarButton } from '../CompletarButton'

interface EjemplosTabProps {
  tema: Tema
  completado: boolean
  onMarcarCompletado: () => void
}

export function EjemplosTab({ tema, completado, onMarcarCompletado }: EjemplosTabProps) {
  const [indice, setIndice] = useState(0)
  const ejemplo = tema.ejemplos[indice]
  const esPrimero = indice === 0
  const esUltimo = indice === tema.ejemplos.length - 1

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{tema.titulo}</h1>
        <CompletarButton completado={completado} onClick={onMarcarCompletado} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="mb-1 text-xs font-semibold text-green-600">
          EJEMPLO {indice + 1} DE {tema.ejemplos.length}
        </p>
        <h2 className="mb-4 text-lg font-bold text-slate-800">{ejemplo.enunciado}</h2>

        <p className="mb-2 text-sm font-semibold text-slate-500">Solución:</p>
        <ol className="space-y-2">
          {ejemplo.pasos.map((paso, i) => (
            <li key={i} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              {paso}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          disabled={esPrimero}
          onClick={() => setIndice(i => i - 1)}
          className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Ejemplo anterior
        </button>
        <button
          type="button"
          disabled={esUltimo}
          onClick={() => setIndice(i => i + 1)}
          className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente ejemplo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
