import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { SubtemaCompleto } from '../../data/topicData'
import { esCorrecta, type Respuesta } from '@/lib/correccion'
import type { Ejercicio } from '@/lib/schemas'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { CompletarButton } from '../CompletarButton'

interface EjerciciosTabProps {
  subtema: SubtemaCompleto
  completado: boolean
  onMarcarCompletado: () => void
}

type Resultado = { respuesta: Respuesta; correcto: boolean }
type Resultados = Record<number, Resultado>

const SUBTABS = ['Ejercicios', 'Mis respuestas', 'Resueltos'] as const
type Subtab = (typeof SUBTABS)[number]

export function EjerciciosTab({ subtema, completado, onMarcarCompletado }: EjerciciosTabProps) {
  const [subtab, setSubtab] = useState<Subtab>('Ejercicios')
  const [resultados, setResultados] = useLocalStorage<Resultados>(`galileo:ejercicios:${subtema.slug}`, {})
  const [respuestasBorrador, setRespuestasBorrador] = useState<Record<number, Respuesta>>(() =>
    Object.fromEntries(Object.entries(resultados).map(([id, r]) => [id, r.respuesta])),
  )

  function verificar(ejercicio: Ejercicio) {
    const respuesta = respuestasBorrador[ejercicio.id] ?? (ejercicio.tipo === 'multiple' ? [] : '')
    const correcto = esCorrecta(ejercicio, respuesta)
    setResultados(prev => ({ ...prev, [ejercicio.id]: { respuesta, correcto } }))
  }

  const totalCorrectas = Object.values(resultados).filter(r => r.correcto).length
  const puntosTotales = subtema.ejercicios.reduce((sum, ej) => sum + ej.puntos, 0)
  const puntosGanados = subtema.ejercicios.reduce(
    (sum, ej) => sum + (resultados[ej.id]?.correcto ? ej.puntos : 0),
    0,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{subtema.titulo}</h1>
        <CompletarButton completado={completado} onClick={onMarcarCompletado} />
      </div>

      <div role="tablist" className="flex gap-2 border-b border-slate-200">
        {SUBTABS.map(s => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={subtab === s}
            onClick={() => setSubtab(s)}
            className={`px-3 py-2 text-sm font-medium ${
              subtab === s ? 'border-b-2 border-green-600 text-green-700' : 'text-slate-500'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {subtab === 'Ejercicios' && (
        <div className="space-y-4">
          {subtema.ejercicios.map(ej => (
            <div key={ej.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-start justify-between">
                <p className="font-medium text-slate-800">
                  {ej.id}. {ej.enunciado}
                </p>
                <span className="shrink-0 text-xs text-slate-400">{ej.puntos} puntos</span>
              </div>

              {ej.tipo === 'libre' && (
                <input
                  type="text"
                  placeholder="Escribí aquí tu respuesta..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={(respuestasBorrador[ej.id] as string) ?? ''}
                  onChange={e =>
                    setRespuestasBorrador(prev => ({ ...prev, [ej.id]: e.target.value }))
                  }
                />
              )}

              {ej.tipo === 'multiple' && (
                <div className="flex flex-wrap gap-3">
                  {ej.opciones.map(opcion => {
                    const seleccionadas = (respuestasBorrador[ej.id] as string[]) ?? []
                    const marcada = seleccionadas.includes(opcion)
                    return (
                      <label key={opcion} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={marcada}
                          onChange={() =>
                            setRespuestasBorrador(prev => {
                              const actuales = (prev[ej.id] as string[]) ?? []
                              const siguientes = marcada
                                ? actuales.filter(o => o !== opcion)
                                : [...actuales, opcion]
                              return { ...prev, [ej.id]: siguientes }
                            })
                          }
                        />
                        {opcion}
                      </label>
                    )
                  })}
                </div>
              )}

              {ej.tipo === 'si-no' && (
                <div className="flex gap-4">
                  {(['Sí', 'No'] as const).map(opcion => (
                    <label key={opcion} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="radio"
                        name={`ejercicio-${ej.id}`}
                        checked={respuestasBorrador[ej.id] === opcion}
                        onChange={() =>
                          setRespuestasBorrador(prev => ({ ...prev, [ej.id]: opcion }))
                        }
                      />
                      {opcion}
                    </label>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => verificar(ej)}
                className="mt-3 rounded-md border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
              >
                Verificar respuesta
              </button>

              {resultados[ej.id] && (
                <p
                  className={`mt-2 text-sm ${
                    resultados[ej.id].correcto ? 'text-green-700' : 'text-red-600'
                  }`}
                >
                  {resultados[ej.id].correcto ? 'Correcta.' : `Incorrecta. ${ej.explicacion}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {subtab === 'Mis respuestas' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Llevás {totalCorrectas} ejercicios correctos de {subtema.ejercicios.length} ({puntosGanados} de{' '}
            {puntosTotales} puntos).
          </p>
          {subtema.ejercicios.map(ej => {
            const resultado = resultados[ej.id]
            return (
              <div key={ej.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium text-slate-800">{ej.enunciado}</p>
                  {resultado ? (
                    resultado.correcto ? (
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        <CheckCircle2 size={14} /> Correcta
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        <XCircle size={14} /> Incorrecta
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">Sin responder</span>
                  )}
                </div>
                {resultado && (
                  <p className="text-sm text-slate-500">
                    Tu respuesta:{' '}
                    {Array.isArray(resultado.respuesta) ? resultado.respuesta.join(', ') : resultado.respuesta}
                  </p>
                )}
                {resultado && !resultado.correcto && (
                  <p className="mt-1 text-sm text-red-600">{ej.explicacion}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {subtab === 'Resueltos' && (
        <div className="space-y-3">
          {subtema.ejercicios.map(ej => (
            <div key={ej.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="mb-1 font-medium text-slate-800">{ej.enunciado}</p>
              <p className="text-sm text-slate-600">
                Respuesta correcta:{' '}
                {ej.tipo === 'multiple' ? ej.respuestaCorrecta.join(', ') : ej.respuestaCorrecta}
              </p>
              <p className="mt-1 text-sm text-slate-500">{ej.explicacion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
