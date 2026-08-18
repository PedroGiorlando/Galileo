import { useState } from 'react'
import { Play, Pause, CheckCircle2 } from 'lucide-react'
import type { Tema } from '../../data/topicData'
import { CompletarButton } from '../CompletarButton'

interface LeccionTabProps {
  tema: Tema
  completado: boolean
  onMarcarCompletado: () => void
}

// El video es un placeholder: no hay archivo real, solo un botón que
// alterna un ícono play/pausa y una barra fija. Alcanza para probar la
// interacción sin tener que servir un video real en el prototipo.
export function LeccionTab({ tema, completado, onMarcarCompletado }: LeccionTabProps) {
  const [reproduciendo, setReproduciendo] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-500">TEMA {tema.id}</p>
          <h1 className="text-2xl font-bold text-slate-800">{tema.titulo}</h1>
        </div>
        <CompletarButton completado={completado} onClick={onMarcarCompletado} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-900 p-8 text-center text-white">
        <button
          type="button"
          onClick={() => setReproduciendo(r => !r)}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600"
        >
          {reproduciendo ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <div className="h-1.5 w-full rounded-full bg-slate-700">
          <div className="h-1.5 w-1/3 rounded-full bg-green-500" />
        </div>
        <p className="mt-2 text-xs text-slate-400">03:42 / {tema.duracionLabel}</p>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="mb-2 text-sm font-semibold text-green-800">En esta lección aprenderás:</p>
        <ul className="space-y-1 text-sm text-green-700">
          {tema.objetivos.map(obj => (
            <li key={obj} className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              {obj}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
