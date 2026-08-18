import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { SubtemaCompleto } from '../../data/topicData'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { CompletarButton } from '../CompletarButton'

interface AutoevaluacionTabProps {
  subtema: SubtemaCompleto
  completado: boolean
  onMarcarCompletado: () => void
}

const PORCENTAJE_APROBACION = 70

export function AutoevaluacionTab({ subtema, completado, onMarcarCompletado }: AutoevaluacionTabProps) {
  // Depende del tema, que ahora llega por props: no puede ser constante de módulo.
  const TOTAL_PREGUNTAS = subtema.quiz.length
  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})
  const [terminado, setTerminado] = useState(false)
  const [mejorPuntaje, setMejorPuntaje] = useLocalStorage(`galileo:quiz:${subtema.slug}`, 0)

  const pregunta = subtema.quiz[indice]
  const seleccionActual = respuestas[pregunta.id]
  const yaRespondida = seleccionActual !== undefined
  const esUltima = indice === TOTAL_PREGUNTAS - 1

  const puntaje = Object.entries(respuestas).reduce((total, [id, opcionElegida]) => {
    const p = subtema.quiz.find(q => q.id === Number(id))
    return p && p.respuestaCorrectaIndex === opcionElegida ? total + 1 : total
  }, 0)

  function elegirOpcion(opcionIndex: number) {
    if (yaRespondida) return
    setRespuestas(prev => ({ ...prev, [pregunta.id]: opcionIndex }))
  }

  function siguiente() {
    if (esUltima) {
      setMejorPuntaje(prev => Math.max(prev, puntaje))
      setTerminado(true)
    } else {
      setIndice(i => i + 1)
    }
  }

  function anterior() {
    setIndice(i => Math.max(0, i - 1))
  }

  function reintentar() {
    setIndice(0)
    setRespuestas({})
    setTerminado(false)
  }

  if (terminado) {
    const porcentaje = Math.round((puntaje / TOTAL_PREGUNTAS) * 100)
    const aprobado = porcentaje >= PORCENTAJE_APROBACION
    return (
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Resultado de la autoevaluación</h1>
        <p className={`text-4xl font-bold ${aprobado ? 'text-green-600' : 'text-red-500'}`}>
          {puntaje} / {TOTAL_PREGUNTAS}
        </p>
        <p className="text-slate-600">
          {aprobado
            ? `¡Aprobaste con ${porcentaje}%!`
            : `Sacaste ${porcentaje}%. Necesitás ${PORCENTAJE_APROBACION}% para aprobar.`}
        </p>
        <p className="text-sm text-slate-400">Tu mejor puntaje guardado: {mejorPuntaje} / {TOTAL_PREGUNTAS}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reintentar}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white"
          >
            Reintentar
          </button>
          <CompletarButton completado={completado} onClick={onMarcarCompletado} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{subtema.titulo}</h1>
        <CompletarButton completado={completado} onClick={onMarcarCompletado} />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
        <span>Pregunta {indice + 1} / {TOTAL_PREGUNTAS}</span>
        <span>Puntaje: {puntaje} / {TOTAL_PREGUNTAS}</span>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-slate-800">{pregunta.pregunta}</h2>
        <div className="space-y-2">
          {pregunta.opciones.map((opcion, i) => {
            const esCorrecta = i === pregunta.respuestaCorrectaIndex
            const esElegida = seleccionActual === i
            let estilos = 'border-slate-200'
            if (yaRespondida && esCorrecta) estilos = 'border-green-500 bg-green-50'
            else if (yaRespondida && esElegida && !esCorrecta) estilos = 'border-red-400 bg-red-50'

            return (
              <button
                key={i}
                type="button"
                onClick={() => elegirOpcion(i)}
                disabled={yaRespondida}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${estilos}`}
              >
                {opcion}
                {yaRespondida && esCorrecta && <CheckCircle2 size={16} className="text-green-600" />}
                {yaRespondida && esElegida && !esCorrecta && <XCircle size={16} className="text-red-500" />}
              </button>
            )
          })}
        </div>

        {yaRespondida && (
          <p className="mt-3 text-sm text-slate-500">{pregunta.explicacion}</p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          disabled={indice === 0}
          onClick={anterior}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pregunta anterior
        </button>
        <button
          type="button"
          disabled={!yaRespondida}
          onClick={siguiente}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {esUltima ? 'Finalizar autoevaluación' : 'Siguiente pregunta'}
        </button>
      </div>
    </div>
  )
}
