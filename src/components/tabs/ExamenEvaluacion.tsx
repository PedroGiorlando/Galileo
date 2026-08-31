'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  LogIn,
  RotateCcw,
  Timer,
  XCircle,
} from 'lucide-react'
import type { EvaluacionPublica } from '@/lib/publico'
import { comoMinutos } from '@/lib/video'
import { Medios } from '../Medios'
import {
  comenzarExamen,
  entregarExamen,
  estadoExamen,
  guardarRespuestaExamen,
  type ResultadoExamen,
} from '@/app/acciones-examen'

/**
 * Rendir una evaluación con reglas: tiempo, intentos contados y devolución al
 * final.
 *
 * EL RELOJ DE ACÁ NO MIDE NADA. El servidor anotó la hora al empezar y es el
 * único que decide si el tiempo se acabó; este contador solo muestra el número
 * que el servidor mandó. Se vuelve a sincronizar con cada respuesta guardada,
 * así que si la pestaña estuvo dormida o el reloj de la máquina está cambiado,
 * la próxima respuesta lo acomoda.
 *
 * NO hay devolución pregunta por pregunta, a diferencia del modo práctica. Si
 * fuera corrigiendo sobre la marcha, la revisión del final no revisaría nada.
 */

/**
 * Verde, amarillo y rojo, que es lo que cualquiera lee sin explicación.
 *
 * Las clases van escritas enteras y no armadas con plantillas: Tailwind lee el
 * código como texto y una clase construida a pedazos no la genera nunca. Ya
 * nos pasó con 44 clases en 5 archivos que no pintaban nada.
 *
 * El color acompaña a la palabra, no la reemplaza: la etiqueta dice
 * "Dificultad: Intermedio". Quien no distingue verde de rojo lo lee igual.
 */
const COLOR_DIFICULTAD: Record<string, string> = {
  Básico: 'border-green-200 bg-green-50 text-green-800',
  Intermedio: 'border-amber-200 bg-amber-50 text-amber-800',
  Avanzado: 'border-red-200 bg-red-50 text-red-800',
}

type Etapa = 'cargando' | 'resumen' | 'rindiendo' | 'resultado'

interface Estado {
  usados: number
  mejor: number | null
  intentoAbierto: { intentoId: number; segundosRestantes: number | null } | null
}

export function ExamenEvaluacion({
  evaluacion,
  materiaSlug,
  claseSlug,
  evalIndice,
}: {
  evaluacion: EvaluacionPublica
  materiaSlug: string
  claseSlug: string
  evalIndice: number
}) {
  const [etapa, setEtapa] = useState<Etapa>('cargando')
  const [estado, setEstado] = useState<Estado | null>(null)
  const [sinCuenta, setSinCuenta] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const [intentoId, setIntentoId] = useState<number | null>(null)
  const [segundos, setSegundos] = useState<number | null>(null)
  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})

  const [resultado, setResultado] = useState<ResultadoExamen | null>(null)
  const [revisando, setRevisando] = useState(false)

  const total = evaluacion.preguntas.length
  const pregunta = evaluacion.preguntas[indice]

  // --- Cargar el estado inicial ---------------------------------------------

  useEffect(() => {
    let vigente = true
    estadoExamen(materiaSlug, claseSlug, evalIndice).then(r => {
      if (!vigente) return
      if (!r.ok) {
        if (r.necesitaCuenta) setSinCuenta(true)
        else setError(r.error)
        setEtapa('resumen')
        return
      }
      setEstado({ usados: r.usados, mejor: r.mejor, intentoAbierto: r.enCurso })
      setEtapa('resumen')
    })
    return () => {
      vigente = false
    }
  }, [materiaSlug, claseSlug, evalIndice])

  // --- Entregar --------------------------------------------------------------

  // En un ref para que el reloj de abajo pueda llamarla sin reiniciarse en
  // cada render.
  const entregar = useCallback(async () => {
    if (intentoId === null) return
    setOcupado(true)
    try {
      const r = await entregarExamen(intentoId)
      if (r.ok) {
        setResultado(r.resultado)
        setEtapa('resultado')
      } else {
        setError(r.error)
      }
    } catch {
      setError('No pudimos entregar. Revisá tu conexión.')
    } finally {
      setOcupado(false)
    }
  }, [intentoId])

  const entregarRef = useRef(entregar)
  entregarRef.current = entregar

  // --- El reloj --------------------------------------------------------------

  useEffect(() => {
    if (etapa !== 'rindiendo' || segundos === null) return

    if (segundos <= 0) {
      // Se acabó: se entrega con lo que haya. Las que faltan cuentan en blanco.
      entregarRef.current()
      return
    }

    const t = setTimeout(() => setSegundos(s => (s === null ? null : s - 1)), 1000)
    return () => clearTimeout(t)
  }, [etapa, segundos])

  // --- Acciones --------------------------------------------------------------

  async function comenzar() {
    setOcupado(true)
    setError(null)
    try {
      const r = await comenzarExamen(materiaSlug, claseSlug, evalIndice)
      if (!r.ok) {
        if (r.necesitaCuenta) setSinCuenta(true)
        else setError(r.error)
        return
      }
      setIntentoId(r.intentoId)
      setSegundos(r.segundosRestantes)
      setIndice(0)
      setRespuestas({})
      setEtapa('rindiendo')
    } finally {
      setOcupado(false)
    }
  }

  async function responder(elegida: number) {
    if (intentoId === null) return
    // Se marca en pantalla al instante y se guarda en segundo plano: esperar
    // la red para pintar la opción elegida haría que rendir se sienta pesado.
    setRespuestas(p => ({ ...p, [pregunta.id]: elegida }))

    const r = await guardarRespuestaExamen(intentoId, pregunta.id, elegida)
    if (r.ok) {
      setSegundos(r.segundosRestantes)
    } else if ('vencido' in r && r.vencido) {
      setSegundos(0)
    } else {
      setError(r.error)
    }
  }

  // --- Pantallas -------------------------------------------------------------

  if (etapa === 'cargando') {
    return (
      <p className="flex items-center justify-center gap-2 p-8 text-sm text-tinta-suave">
        <Loader2 size={16} className="animate-spin" /> Cargando…
      </p>
    )
  }

  if (sinCuenta) {
    return (
      <div className="rounded-xl border border-linea bg-white p-8 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-galileo/10">
          <LogIn size={22} className="text-galileo" />
        </span>
        <h2 className="font-display text-xl font-bold text-tinta">
          Esta evaluación se rinde con cuenta
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-tinta-suave">
          Tiene tiempo e intentos contados, así que necesitamos saber quién la rinde para guardar
          tu nota y que puedas volver a ver en qué te equivocaste. La teoría y los trabajos
          prácticos siguen abiertos sin cuenta.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            href="/registrarse"
            className="flex min-h-11 items-center rounded-lg bg-galileo px-5 text-sm font-medium text-white hover:bg-galileo-oscuro"
          >
            Crear una cuenta
          </Link>
          <Link
            href="/ingresar"
            className="flex min-h-11 items-center rounded-lg border border-linea px-5 text-sm font-medium text-tinta-suave hover:bg-slate-50"
          >
            Ya tengo una
          </Link>
        </div>
      </div>
    )
  }

  if (etapa === 'resultado' && resultado) {
    return (
      <Resultado
        resultado={resultado}
        revisando={revisando}
        onRevisar={() => setRevisando(true)}
        onVolver={() => setRevisando(false)}
        onOtroIntento={() => {
          setResultado(null)
          setRevisando(false)
          setEtapa('cargando')
          estadoExamen(materiaSlug, claseSlug, evalIndice).then(r => {
            if (r.ok) setEstado({ usados: r.usados, mejor: r.mejor, intentoAbierto: r.enCurso })
            setEtapa('resumen')
          })
        }}
      />
    )
  }

  if (etapa === 'rindiendo') {
    const elegida = respuestas[pregunta.id]
    const respondidas = evaluacion.preguntas.filter(p => respuestas[p.id] !== undefined).length

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-linea bg-white p-3">
          <span className="font-mono text-sm text-tinta-suave">
            Pregunta {indice + 1} de {total} · {respondidas} respondidas
          </span>
          {segundos !== null && <Reloj segundos={segundos} />}
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-linea">
          <div
            className="h-full rounded-full bg-galileo transition-all"
            style={{ width: `${((indice + 1) / total) * 100}%` }}
          />
        </div>

        <div className="rounded-xl border border-linea bg-white p-5">
          <p className="font-medium text-tinta">{pregunta.pregunta}</p>
          <Medios medios={pregunta.medios} className="mt-3" />

          <div className="mt-4 space-y-2">
            {pregunta.opciones.map((opcion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => responder(i)}
                className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                  elegida === i
                    ? 'border-galileo bg-galileo/10 font-medium text-tinta'
                    : 'border-linea text-tinta hover:bg-slate-50'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                    elegida === i
                      ? 'border-galileo bg-galileo text-white'
                      : 'border-slate-300 text-slate-500'
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opcion}
              </button>
            ))}
          </div>

          {/* Nada de "correcta" o "incorrecta" acá: la devolución va al final.
              Lo único que se dice es que quedó registrada. */}
          {elegida !== undefined && (
            <p className="mt-3 text-xs text-tinta-suave">Respuesta guardada. Podés cambiarla.</p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-between gap-3">
          <button
            type="button"
            disabled={indice === 0}
            onClick={() => setIndice(i => i - 1)}
            className="min-h-11 rounded-lg border border-linea px-4 text-sm text-tinta-suave disabled:opacity-40"
          >
            Anterior
          </button>

          {indice === total - 1 ? (
            <button
              type="button"
              disabled={ocupado}
              onClick={entregar}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-galileo px-5 text-sm font-medium text-white hover:bg-galileo-oscuro disabled:opacity-50"
            >
              {ocupado && <Loader2 size={15} className="animate-spin" />}
              Entregar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIndice(i => i + 1)}
              className="min-h-11 rounded-lg bg-galileo px-5 text-sm font-medium text-white hover:bg-galileo-oscuro"
            >
              Siguiente
            </button>
          )}
        </div>

        {respondidas < total && indice === total - 1 && (
          <p className="text-sm text-amber-700">
            Te {total - respondidas === 1 ? 'queda' : 'quedan'} {total - respondidas} sin
            responder. Si entregás así, {total - respondidas === 1 ? 'cuenta' : 'cuentan'} como
            incorrecta{total - respondidas === 1 ? '' : 's'}.
          </p>
        )}
      </div>
    )
  }

  // --- Resumen previo --------------------------------------------------------

  const quedan =
    evaluacion.intentos !== undefined && estado ? evaluacion.intentos - estado.usados : null
  const sinIntentos = quedan !== null && quedan <= 0

  return (
    <div className="rounded-xl border border-linea bg-white p-6">
      <h2 className="font-display text-xl font-bold text-tinta">
        {evaluacion.titulo ?? `Evaluación ${evalIndice + 1}`}
      </h2>
      <p className="mt-1 text-sm text-tinta-suave">Antes de empezar, mirá de qué se trata.</p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Dato icono={<ClipboardList size={15} />} etiqueta="Preguntas" valor={String(total)} />
        <Dato
          icono={<Clock size={15} />}
          etiqueta="Tiempo"
          valor={
            evaluacion.tiempoLimiteMinutos ? `${evaluacion.tiempoLimiteMinutos} min` : 'Sin límite'
          }
        />
        <Dato
          icono={<Timer size={15} />}
          etiqueta="Intentos"
          valor={
            evaluacion.intentos
              ? `${quedan ?? evaluacion.intentos} de ${evaluacion.intentos}`
              : 'Sin límite'
          }
        />
      </dl>

      {evaluacion.dificultad && (
        <p
          className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${COLOR_DIFICULTAD[evaluacion.dificultad]}`}
        >
          Dificultad: {evaluacion.dificultad}
        </p>
      )}

      {estado?.mejor !== null && estado?.mejor !== undefined && (
        <p className="mt-3 font-mono text-sm text-tinta-suave">
          Tu mejor resultado: {estado.mejor}/{total}
        </p>
      )}

      {evaluacion.tiempoLimiteMinutos && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          El reloj arranca al apretar Comenzar y <strong>no se pausa</strong>, ni cerrando la
          página. Cuando llegue a cero se entrega con lo que hayas respondido.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-5">
        {sinIntentos ? (
          <p className="text-sm text-tinta-suave">
            Ya usaste tus {evaluacion.intentos} intentos en esta evaluación.
          </p>
        ) : (
          <button
            type="button"
            disabled={ocupado}
            onClick={comenzar}
            className="flex min-h-11 items-center gap-2 rounded-lg bg-galileo px-6 text-sm font-medium text-white hover:bg-galileo-oscuro disabled:opacity-50"
          >
            {ocupado && <Loader2 size={15} className="animate-spin" />}
            {estado?.intentoAbierto ? 'Retomar donde ibas' : 'Comenzar'}
          </button>
        )}
      </div>
    </div>
  )
}

// --- Piezas -----------------------------------------------------------------

function Dato({
  icono,
  etiqueta,
  valor,
}: {
  icono: React.ReactNode
  etiqueta: string
  valor: string
}) {
  return (
    <div className="rounded-lg border border-linea p-3">
      <dt className="flex items-center gap-1.5 text-xs text-tinta-suave">
        {icono} {etiqueta}
      </dt>
      <dd className="mt-0.5 font-display text-lg font-bold text-tinta">{valor}</dd>
    </div>
  )
}

function Reloj({ segundos }: { segundos: number }) {
  const poco = segundos <= 300
  return (
    <span
      // aria-live para que un lector de pantalla avise, pero "polite" para que
      // no interrumpa la lectura de la pregunta cada segundo.
      aria-live={poco ? 'polite' : 'off'}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-medium ${
        poco ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-tinta-suave'
      }`}
    >
      <Clock size={14} /> {comoMinutos(segundos)}
    </span>
  )
}

function Resultado({
  resultado,
  revisando,
  onRevisar,
  onVolver,
  onOtroIntento,
}: {
  resultado: ResultadoExamen
  revisando: boolean
  onRevisar: () => void
  onVolver: () => void
  onOtroIntento: () => void
}) {
  const porcentaje = Math.round((resultado.puntaje / resultado.total) * 100)
  const aprobado = porcentaje >= 70

  if (revisando) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-tinta">Revisión</h2>
          <button
            type="button"
            onClick={onVolver}
            className="min-h-11 rounded-lg border border-linea px-4 text-sm text-tinta-suave hover:bg-slate-50"
          >
            Volver al resultado
          </button>
        </div>

        <ol className="space-y-4">
          {resultado.detalle.map((d, i) => (
            <li key={d.id} className="rounded-xl border border-linea bg-white p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    d.correcta ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {d.correcta ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-tinta">
                    <span className="font-mono text-xs text-tinta-suave">{i + 1}. </span>
                    {d.pregunta}
                  </p>
                  <Medios medios={d.medios} className="mt-3" />

                  <ul className="mt-3 space-y-1.5">
                    {d.opciones.map((op, j) => {
                      const esLaCorrecta = j === d.correctaIndex
                      const laTuya = j === d.elegida
                      return (
                        <li
                          key={j}
                          className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                            esLaCorrecta
                              ? 'border-green-300 bg-green-50 text-green-900'
                              : laTuya
                                ? 'border-amber-300 bg-amber-50 text-amber-900'
                                : 'border-linea text-tinta-suave'
                          }`}
                        >
                          <span className="min-w-0 flex-1">{op}</span>
                          {esLaCorrecta && (
                            <span className="shrink-0 text-xs font-medium">correcta</span>
                          )}
                          {laTuya && !esLaCorrecta && (
                            <span className="shrink-0 text-xs font-medium">tu respuesta</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>

                  {d.elegida === null && (
                    <p className="mt-2 text-sm text-amber-700">No llegaste a responderla.</p>
                  )}

                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-tinta-suave">
                    <p>{d.explicacion}</p>
                    <Medios medios={d.mediosExplicacion} className="mt-3" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border p-8 text-center ${
          aprobado ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
        }`}
      >
        {resultado.porVencimiento && (
          <p className="mb-3 text-sm font-medium text-amber-800">
            Se acabó el tiempo y se entregó con lo que habías respondido.
          </p>
        )}

        <p className="font-mono text-4xl font-medium text-tinta">
          {resultado.puntaje}
          <span className="text-tinta-suave">/{resultado.total}</span>
        </p>
        <p
          className={`mt-2 font-display text-lg font-bold ${
            aprobado ? 'text-green-800' : 'text-amber-800'
          }`}
        >
          {aprobado ? '¡Aprobaste!' : 'Todavía no alcanza'}
        </p>
        <p className="mt-1 text-sm text-tinta-suave">
          Sacaste {porcentaje}%. Se aprueba con 70%.
        </p>
        <p className="mt-1 flex items-center justify-center gap-1.5 font-mono text-xs text-tinta-suave">
          <Clock size={12} /> Tardaste {comoMinutos(resultado.segundos)}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onRevisar}
            className="flex min-h-11 items-center gap-2 rounded-lg bg-galileo px-5 text-sm font-medium text-white hover:bg-galileo-oscuro"
          >
            Ver la revisión
          </button>
          <button
            type="button"
            onClick={onOtroIntento}
            className="flex min-h-11 items-center gap-2 rounded-lg border border-linea bg-white px-5 text-sm font-medium text-tinta-suave hover:bg-slate-50"
          >
            <RotateCcw size={15} /> Volver al resumen
          </button>
        </div>
      </div>
    </div>
  )
}
