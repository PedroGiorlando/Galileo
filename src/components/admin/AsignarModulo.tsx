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
      <p className="mt-3 rounded-xl border border-dashed border-linea p-3 text-sm text-tinta-suave">
        Esta materia todavía no se dicta en ninguna carrera, así que este módulo no lo va a ver
        nadie. Se arregla desde <strong className="font-medium">Panel → Estructura</strong>.
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
    // Caja propia con título. Antes esto era una línea de "Aparece en:" en
    // letra chica con casillas de 14px, apretada entre el nombre del módulo y
    // la lista de clases: la primera persona que usó el panel no la vio, y vino
    // a pedir como funcionalidad nueva algo que ya estaba acá. Un control que
    // parece decoración es un control que no existe.
    <fieldset className="mt-3 rounded-xl border border-linea bg-slate-50/60 p-3">
      <legend className="flex items-center gap-2 px-1 text-sm font-medium text-tinta">
        ¿En qué carreras se dicta este módulo?
        {guardando && <Loader2 size={13} className="animate-spin text-tinta-suave" />}
      </legend>

      <div className="mt-1 flex flex-wrap gap-2">
        {opciones.map(o => {
          const incluido = marcados.includes(o.cursoId)
          return (
            <label
              key={o.cursoId}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
                incluido
                  ? 'border-galileo bg-galileo/10 font-medium text-galileo-oscuro'
                  : 'border-linea bg-white text-tinta-suave hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-galileo"
                checked={incluido}
                onChange={e => alternar(o.cursoId, e.target.checked)}
              />
              {o.etiqueta}
            </label>
          )
        })}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {marcados.length === 0 && (
        <p className="mt-2 text-sm text-amber-700">
          Ninguna: {moduloNombre} no lo va a ver ningún alumno.
        </p>
      )}
    </fieldset>
  )
}
