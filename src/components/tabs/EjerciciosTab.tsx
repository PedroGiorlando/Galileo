'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { SubtemaCompleto } from '../../data/topicData'
import { esCorrecta, type Respuesta } from '@/lib/correccion'
import type { Ejercicio } from '@/lib/schemas'
import { useLocalStorage } from '@/hooks/useLocalStorage'

type Resultado = { respuesta: Respuesta; correcto: boolean }
type Resultados = Record<string, Resultado>

/**
 * Trabajos prácticos.
 *
 * Cada TP es un conjunto de ejercicios que se entregan juntos, como en la
 * cursada. Se numeran por posición, así nadie tiene que llevar la cuenta al
 * cargarlos.
 *
 * La corrección es la misma de siempre, pero no hay archivo que bajar: eso es
 * a la vez mejor para el alumno, que sabe al instante si le fue bien, y la
 * única protección real contra que el TP termine en un grupo de WhatsApp.
 *
 * La clave del resultado combina el número de TP con el id del ejercicio: dos
 * TPs distintos pueden tener un ejercicio con el mismo id.
 */
export function EjerciciosTab({ subtema }: { subtema: SubtemaCompleto }) {
  const [tpActivo, setTpActivo] = useState(0)
  const [resultados, setResultados] = useLocalStorage<Resultados>(
    `galileo:practicos:${subtema.slug}`,
    {},
  )
  const [borrador, setBorrador] = useState<Record<string, Respuesta>>({})

  if (subtema.practicos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-linea p-8 text-center text-tinta-suave">
        Esta clase todavía no tiene trabajos prácticos cargados.
      </p>
    )
  }

  const practico = subtema.practicos[tpActivo]
  const clave = (ej: Ejercicio) => `${tpActivo}:${ej.id}`

  function verificar(ej: Ejercicio) {
    const k = clave(ej)
    const respuesta = borrador[k] ?? (ej.tipo === 'multiple' ? [] : '')
    setResultados(prev => ({ ...prev, [k]: { respuesta, correcto: esCorrecta(ej, respuesta) } }))
  }

  const hechos = practico.ejercicios.filter(ej => resultados[clave(ej)]).length
  const bien = practico.ejercicios.filter(ej => resultados[clave(ej)]?.correcto).length

  return (
    <div className="space-y-5">
      {subtema.practicos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {subtema.practicos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setTpActivo(i)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                i === tpActivo
                  ? 'bg-galileo text-white'
                  : 'border border-linea text-tinta-suave hover:bg-slate-50'
              }`}
            >
              TP {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-tinta">
          Trabajo práctico {tpActivo + 1}
          {practico.titulo && <span className="text-tinta-suave"> · {practico.titulo}</span>}
        </h2>
        <span className="font-mono text-xs text-tinta-suave">
          {hechos}/{practico.ejercicios.length} resueltos
          {hechos > 0 && ` · ${bien} bien`}
        </span>
      </div>

      <ol className="space-y-4">
        {practico.ejercicios.map((ej, i) => {
          const k = clave(ej)
          const resultado = resultados[k]
          const valor = borrador[k] ?? resultado?.respuesta ?? (ej.tipo === 'multiple' ? [] : '')

          return (
            <li key={ej.id} className="rounded-xl border border-linea bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-xs text-slate-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-tinta">{ej.enunciado}</p>

                  <div className="mt-3">
                    {ej.tipo === 'libre' && (
                      <input
                        type="text"
                        value={valor as string}
                        onChange={e => setBorrador(p => ({ ...p, [k]: e.target.value }))}
                        placeholder="Tu respuesta"
                        className="w-full rounded-lg border border-linea px-3 py-2 text-sm focus:border-galileo focus:outline-none"
                      />
                    )}

                    {ej.tipo === 'multiple' && (
                      <div className="space-y-1.5">
                        {ej.opciones.map(op => {
                          const marcadas = (valor as string[]) ?? []
                          return (
                            <label key={op} className="flex items-start gap-2 text-sm text-tinta">
                              <input
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 accent-galileo"
                                checked={marcadas.includes(op)}
                                onChange={e =>
                                  setBorrador(p => ({
                                    ...p,
                                    [k]: e.target.checked
                                      ? [...marcadas, op]
                                      : marcadas.filter(x => x !== op),
                                  }))
                                }
                              />
                              {op}
                            </label>
                          )
                        })}
                      </div>
                    )}

                    {ej.tipo === 'si-no' && (
                      <div className="flex gap-4">
                        {(['Sí', 'No'] as const).map(op => (
                          <label key={op} className="flex items-center gap-2 text-sm text-tinta">
                            <input
                              type="radio"
                              name={`ej-${k}`}
                              className="h-4 w-4 accent-galileo"
                              checked={valor === op}
                              onChange={() => setBorrador(p => ({ ...p, [k]: op }))}
                            />
                            {op}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => verificar(ej)}
                    className="mt-3 rounded-lg border border-linea px-3 py-1.5 text-sm font-medium text-tinta-suave hover:bg-slate-50"
                  >
                    Verificar respuesta
                  </button>

                  {resultado && (
                    <div
                      className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-sm ${
                        resultado.correcto
                          ? 'bg-green-50 text-green-900'
                          : 'bg-amber-50 text-amber-900'
                      }`}
                    >
                      {resultado.correcto ? (
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />
                      ) : (
                        <XCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                      )}
                      <span>
                        <strong>{resultado.correcto ? 'Correcta.' : 'Todavía no.'}</strong>{' '}
                        {ej.explicacion}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
