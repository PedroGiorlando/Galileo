'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import type { Respuesta } from '@/lib/correccion'
import type { EjercicioPublico, SubtemaPublico } from '@/lib/publico'
import type { Medio } from '@/lib/schemas'
import { Medios } from '../Medios'
import { corregirEjercicio } from '@/app/acciones-correccion'
import { useLocalStorage } from '@/hooks/useLocalStorage'

type Resultado = {
  respuesta: Respuesta
  correcto: boolean
  explicacion: string
  /** Imágenes de la devolución: llegan del servidor junto con la corrección. */
  medios?: Medio[]
}
type Resultados = Record<string, Resultado>

/**
 * Trabajos prácticos.
 *
 * Cada TP es un conjunto de ejercicios que se entregan juntos, como en la
 * cursada. Se numeran por posición, así nadie tiene que llevar la cuenta al
 * cargarlos.
 *
 * No hay archivo que bajar: eso es a la vez mejor para el alumno, que sabe al
 * instante si le fue bien, y la única protección real contra que el TP termine
 * en un grupo de WhatsApp.
 *
 * LA CORRECCIÓN PASA EN EL SERVIDOR. Antes se comparaba acá, lo que obligaba a
 * mandarle al navegador la respuesta correcta de cada ejercicio: estaban en el
 * HTML, legibles con Ctrl+U. Ahora este componente no las conoce — ni la
 * respuesta ni la explicación llegan hasta que el alumno responde. El precio es
 * una ida y vuelta por ejercicio, de ahí el estado "corrigiendo".
 *
 * La clave del resultado combina el número de TP con el id del ejercicio: dos
 * TPs distintos pueden tener un ejercicio con el mismo id.
 */
export function EjerciciosTab({
  subtema,
  materiaSlug,
}: {
  subtema: SubtemaPublico
  materiaSlug: string
}) {
  const [tpActivo, setTpActivo] = useState(0)
  const [resultados, setResultados] = useLocalStorage<Resultados>(
    `galileo:practicos:${subtema.slug}`,
    {},
  )
  const [borrador, setBorrador] = useState<Record<string, Respuesta>>({})
  const [corrigiendo, setCorrigiendo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (subtema.practicos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-linea p-8 text-center text-tinta-suave">
        Esta clase todavía no tiene trabajos prácticos cargados.
      </p>
    )
  }

  const practico = subtema.practicos[tpActivo]
  const clave = (ej: EjercicioPublico) => `${tpActivo}:${ej.id}`

  async function verificar(ej: EjercicioPublico) {
    const k = clave(ej)
    const respuesta = borrador[k] ?? (ej.tipo === 'multiple' ? [] : '')

    setCorrigiendo(k)
    setError(null)
    try {
      const r = await corregirEjercicio(materiaSlug, subtema.slug, tpActivo, ej.id, respuesta)
      if (!r.ok) {
        setError(r.error)
        return
      }
      setResultados(prev => ({
        ...prev,
        [k]: {
          respuesta,
          correcto: r.correcta,
          explicacion: r.explicacion,
          ...(r.medios ? { medios: r.medios } : {}),
        },
      }))
    } catch {
      // Si se cortó internet, decirlo. Antes esto no podía fallar porque se
      // corregía en la misma máquina; ahora sí, y quedarse sin respuesta y sin
      // aviso es la peor versión.
      setError('No pudimos corregir. Revisá tu conexión y probá de nuevo.')
    } finally {
      setCorrigiendo(null)
    }
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
        <span className="text-xs text-tinta-suave">
          {hechos}/{practico.ejercicios.length} resueltos
          {hechos > 0 && ` · ${bien} bien`}
        </span>
      </div>

      {error && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900" role="alert">
          {error}
        </p>
      )}

      <ol className="space-y-4">
        {practico.ejercicios.map((ej, i) => {
          const k = clave(ej)
          const resultado = resultados[k]
          const valor = borrador[k] ?? resultado?.respuesta ?? (ej.tipo === 'multiple' ? [] : '')

          return (
            <li key={ej.id} className="rounded-xl border border-linea bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-tinta">{ej.enunciado}</p>

                  <Medios medios={ej.medios} className="mt-3" />

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
                    disabled={corrigiendo === k}
                    className="mt-3 flex min-h-11 items-center gap-2 rounded-lg border border-linea px-3 text-sm font-medium text-tinta-suave hover:bg-slate-50 disabled:opacity-60"
                  >
                    {corrigiendo === k && <Loader2 size={14} className="animate-spin" />}
                    {corrigiendo === k ? 'Corrigiendo…' : 'Verificar respuesta'}
                  </button>

                  {resultado && (
                    <div
                      className={`mt-3 rounded-lg p-3 text-sm ${
                        resultado.correcto
                          ? 'bg-green-50 text-green-900'
                          : 'bg-amber-50 text-amber-900'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {resultado.correcto ? (
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />
                        ) : (
                          <XCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                        )}
                        <span>
                          <strong>{resultado.correcto ? 'Correcta.' : 'Todavía no.'}</strong>{' '}
                          {resultado.explicacion}
                        </span>
                      </div>

                      {/* La resolución dibujada. No estaba en la página hasta
                          este momento: vino del servidor con la corrección. */}
                      <Medios medios={resultado.medios} className="mt-3" />
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
