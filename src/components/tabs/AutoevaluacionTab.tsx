'use client'

import { useState } from 'react'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import type { SubtemaCompleto } from '../../data/topicData'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const PORCENTAJE_APROBACION = 70

/**
 * Evaluaciones.
 *
 * Cada evaluación es un conjunto de preguntas que se rinden juntas, como en la
 * cursada. Se numeran por posición.
 *
 * Solo se guarda el mejor puntaje de cada una, no un historial de intentos:
 * lo que el alumno quiere saber es si ya la aprobó, y guardar cada intento
 * sería una tabla más para responder la misma pregunta.
 */
export function AutoevaluacionTab({ subtema }: { subtema: SubtemaCompleto }) {
  const [evalActiva, setEvalActiva] = useState(0)
  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})
  const [terminado, setTerminado] = useState(false)
  const [mejores, setMejores] = useLocalStorage<Record<string, number>>(
    `galileo:evaluaciones:${subtema.slug}`,
    {},
  )

  if (subtema.evaluaciones.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-linea p-8 text-center text-tinta-suave">
        Esta clase todavía no tiene evaluaciones cargadas.
      </p>
    )
  }

  const evaluacion = subtema.evaluaciones[evalActiva]
  const total = evaluacion.preguntas.length
  const pregunta = evaluacion.preguntas[indice]
  const seleccion = respuestas[pregunta.id]
  const respondida = seleccion !== undefined
  const puntaje = evaluacion.preguntas.filter(
    q => respuestas[q.id] === q.respuestaCorrectaIndex,
  ).length

  function reiniciar(nuevaEval = evalActiva) {
    setEvalActiva(nuevaEval)
    setIndice(0)
    setRespuestas({})
    setTerminado(false)
  }

  function terminar() {
    const porcentaje = Math.round((puntaje / total) * 100)
    setMejores(prev => ({
      ...prev,
      [String(evalActiva)]: Math.max(prev[String(evalActiva)] ?? 0, porcentaje),
    }))
    setTerminado(true)
  }

  const selector = subtema.evaluaciones.length > 1 && (
    <div className="flex flex-wrap gap-2">
      {subtema.evaluaciones.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => reiniciar(i)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            i === evalActiva
              ? 'bg-galileo text-white'
              : 'border border-linea text-tinta-suave hover:bg-slate-50'
          }`}
        >
          Evaluación {i + 1}
          {mejores[String(i)] !== undefined && (
            <span className="ml-1.5 font-mono text-xs opacity-80">{mejores[String(i)]}%</span>
          )}
        </button>
      ))}
    </div>
  )

  if (terminado) {
    const porcentaje = Math.round((puntaje / total) * 100)
    const aprobado = porcentaje >= PORCENTAJE_APROBACION

    return (
      <div className="space-y-5">
        {selector}
        <div
          className={`rounded-xl border p-8 text-center ${
            aprobado ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
          }`}
        >
          <p className="font-mono text-4xl font-medium text-tinta">
            {puntaje}
            <span className="text-tinta-suave">/{total}</span>
          </p>
          <p className={`mt-2 font-display text-lg font-bold ${aprobado ? 'text-green-800' : 'text-amber-800'}`}>
            {aprobado ? '¡Aprobaste!' : 'Todavía no alcanza'}
          </p>
          <p className="mt-1 text-sm text-tinta-suave">
            Necesitás {PORCENTAJE_APROBACION}% para aprobar. Sacaste {porcentaje}%.
          </p>
          <p className="mt-1 font-mono text-xs text-tinta-suave">
            Tu mejor puntaje: {mejores[String(evalActiva)] ?? porcentaje}%
          </p>
          <button
            type="button"
            onClick={() => reiniciar()}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-galileo px-5 py-2.5 text-sm font-medium text-white hover:bg-galileo-oscuro"
          >
            <RotateCcw size={15} /> Volver a intentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {selector}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-tinta">
          Evaluación {evalActiva + 1}
          {evaluacion.titulo && <span className="text-tinta-suave"> · {evaluacion.titulo}</span>}
        </h2>
        <span className="font-mono text-xs text-tinta-suave">
          Pregunta {indice + 1}/{total} · {puntaje} bien
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-linea">
        <div
          className="h-full rounded-full bg-galileo transition-all"
          style={{ width: `${((indice + 1) / total) * 100}%` }}
        />
      </div>

      <div className="rounded-xl border border-linea bg-white p-5">
        <p className="font-medium text-tinta">{pregunta.pregunta}</p>

        <div className="mt-4 space-y-2">
          {pregunta.opciones.map((opcion, i) => {
            const elegida = seleccion === i
            const esCorrecta = i === pregunta.respuestaCorrectaIndex
            const mostrar = respondida && (elegida || esCorrecta)

            return (
              <button
                key={i}
                type="button"
                disabled={respondida}
                onClick={() => setRespuestas(p => ({ ...p, [pregunta.id]: i }))}
                className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                  mostrar && esCorrecta
                    ? 'border-green-300 bg-green-50 text-green-900'
                    : mostrar && elegida
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-linea text-tinta hover:bg-slate-50 disabled:hover:bg-transparent'
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {mostrar && esCorrecta ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : mostrar && elegida ? (
                    <XCircle size={16} className="text-amber-600" />
                  ) : (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 font-mono text-[10px] text-slate-500">
                      {String.fromCharCode(65 + i)}
                    </span>
                  )}
                </span>
                {opcion}
              </button>
            )
          })}
        </div>

        {respondida && (
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-tinta-suave">
            {pregunta.explicacion}
          </p>
        )}
      </div>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          disabled={indice === 0}
          onClick={() => setIndice(i => i - 1)}
          className="rounded-lg border border-linea px-4 py-2 text-sm text-tinta-suave disabled:opacity-40"
        >
          Anterior
        </button>

        {indice === total - 1 ? (
          <button
            type="button"
            disabled={!respondida}
            onClick={terminar}
            className="rounded-lg bg-galileo px-5 py-2 text-sm font-medium text-white hover:bg-galileo-oscuro disabled:opacity-40"
          >
            Ver resultado
          </button>
        ) : (
          <button
            type="button"
            disabled={!respondida}
            onClick={() => setIndice(i => i + 1)}
            className="rounded-lg bg-galileo px-5 py-2 text-sm font-medium text-white hover:bg-galileo-oscuro disabled:opacity-40"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  )
}
