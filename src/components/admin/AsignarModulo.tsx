'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { asignarModulo } from '@/app/admin/acciones'

/**
 * En qué carreras aparece un módulo.
 *
 * Es la pieza que motivó todo el rediseño del modelo: Cinemática se escribe una
 * vez y con estas casillas se decide si va a Ingeniería de UNCuyo, a la de UTN
 * o a las dos. Antes había que escribirla dos veces y mantener las dos copias
 * sincronizadas a mano, cosa que nunca pasa.
 */
export function AsignarModulo({
  moduloId,
  moduloNombre,
  opciones,
  asignados,
}: {
  moduloId: number
  moduloNombre: string
  opciones: { cursoId: number; etiqueta: string }[]
  asignados: number[]
}) {
  const [marcados, setMarcados] = useState<number[]>(asignados)
  const [guardando, empezar] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (opciones.length === 0) {
    return (
      <p className="mt-3 text-xs text-tinta-suave">
        Esta materia todavía no está ofrecida en ninguna carrera.
      </p>
    )
  }

  function alternar(cursoId: number, incluir: boolean) {
    const anterior = marcados
    const siguiente = incluir ? [...marcados, cursoId] : marcados.filter(id => id !== cursoId)

    setMarcados(siguiente)
    setError(null)

    empezar(async () => {
      const r = await asignarModulo(moduloId, cursoId, incluir)
      if (!r.ok) {
        // Volver atrás en vez de dejar en pantalla algo que la base no tiene.
        setMarcados(anterior)
        setError(r.error)
      }
    })
  }

  return (
    <div className="mt-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-medium text-tinta-suave">
        Aparece en:
        {guardando && <Loader2 size={12} className="animate-spin" />}
      </p>

      <div className="flex flex-wrap gap-2">
        {opciones.map(o => {
          const incluido = marcados.includes(o.cursoId)
          return (
            <label
              key={o.cursoId}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                incluido
                  ? 'border-galileo bg-galileo/10 font-medium text-galileo'
                  : 'border-linea text-tinta-suave hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-galileo"
                checked={incluido}
                onChange={e => alternar(o.cursoId, e.target.checked)}
              />
              {o.etiqueta}
            </label>
          )
        })}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {marcados.length === 0 && (
        <p className="mt-2 text-xs text-amber-700">
          {moduloNombre} no aparece en ninguna carrera: ningún alumno lo va a ver.
        </p>
      )}
    </div>
  )
}
