'use client'

import { useState } from 'react'
import { AlertCircle, Save } from 'lucide-react'
import {
  aContenido,
  ejemploVacio,
  ejercicioVacio,
  preguntaVacia,
  seccionVacia,
  type ContenidoBorrador,
  type TipoCaja,
  type TipoEjercicio,
} from '@/lib/borrador'
import {
  TemaContenidoSchema,
  TemaMetaSchema,
  type TemaContenido,
  type TemaMeta,
} from '@/lib/schemas'
import {
  Bloque,
  BotonAgregar,
  Campo,
  Casilla,
  ListaDeTextos,
  Numero,
  Texto,
  TextoLargo,
} from './campos'

const TIPOS_EJERCICIO: { valor: TipoEjercicio; label: string; ayuda: string }[] = [
  {
    valor: 'libre',
    label: 'Respuesta libre',
    ayuda: 'Lista separada por comas. El orden y los espacios no importan al corregir.',
  },
  { valor: 'multiple', label: 'Selección múltiple', ayuda: 'El alumno tilda una o varias opciones.' },
  { valor: 'si-no', label: 'Sí / No', ayuda: 'Respuesta binaria.' },
]

const TIPOS_CAJA: TipoCaja[] = ['ejemplo', 'tip', 'nota']

const claseSelect =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'

function Seccion({
  titulo,
  ayuda,
  children,
}: {
  titulo: string
  ayuda?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <h3 className="font-semibold text-slate-800">{titulo}</h3>
        {ayuda && <p className="mt-0.5 text-sm text-slate-500">{ayuda}</p>}
      </div>
      {children}
    </section>
  )
}

/** Traduce el `path` de un error de Zod a algo legible por quien carga contenido. */
function rutaLegible(path: PropertyKey[]): string {
  return path.map(p => (typeof p === 'number' ? '#' + (p + 1) : String(p))).join(' → ')
}

export function TemaForm({
  metaInicial,
  contenidoInicial,
  onGuardar,
}: {
  metaInicial: TemaMeta
  contenidoInicial: ContenidoBorrador
  onGuardar: (meta: TemaMeta, contenido: TemaContenido) => void | Promise<void>
}) {
  const [meta, setMeta] = useState<TemaMeta>(metaInicial)
  const [c, setC] = useState<ContenidoBorrador>(contenidoInicial)
  const [errores, setErrores] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)

  const campoMeta = <K extends keyof TemaMeta>(k: K, v: TemaMeta[K]) =>
    setMeta(prev => ({ ...prev, [k]: v }))

  // Un solo helper para todas las listas del contenido: reemplazar el ítem i.
  function editarLista<K extends keyof ContenidoBorrador>(
    clave: K,
    i: number,
    cambio: Partial<ContenidoBorrador[K][number]>,
  ) {
    setC(prev => ({
      ...prev,
      [clave]: (prev[clave] as unknown[]).map((item, j) =>
        j === i ? { ...(item as object), ...cambio } : item,
      ),
    }))
  }

  function quitarDe(clave: keyof ContenidoBorrador, i: number) {
    setC(prev => ({ ...prev, [clave]: (prev[clave] as unknown[]).filter((_, j) => j !== i) }))
  }

  function agregarA(clave: keyof ContenidoBorrador, item: unknown) {
    setC(prev => ({ ...prev, [clave]: [...(prev[clave] as unknown[]), item] }))
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()

    // Se valida contra el mismo schema que protege la base: lo que no pase acá,
    // tampoco se habría podido guardar.
    const rMeta = TemaMetaSchema.safeParse(meta)
    const rContenido = TemaContenidoSchema.safeParse(aContenido(c))

    const problemas = [
      ...(rMeta.success
        ? []
        : rMeta.error.issues.map(i => 'Ficha → ' + rutaLegible(i.path) + ': ' + i.message)),
      ...(rContenido.success
        ? []
        : rContenido.error.issues.map(i => rutaLegible(i.path) + ': ' + i.message)),
    ]

    setErrores(problemas)
    if (!rMeta.success || !rContenido.success) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setGuardando(true)
    try {
      await onGuardar(rMeta.data, rContenido.data)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-5 pb-24">
      {errores.length > 0 && (
        <div role="alert" className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <AlertCircle size={16} /> Hay {errores.length}{' '}
            {errores.length === 1 ? 'problema' : 'problemas'} para corregir
          </p>
          <ul className="ml-6 list-disc space-y-1 text-sm text-red-700">
            {errores.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <Seccion titulo="Ficha del tema">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Título">
            <Texto
              value={meta.titulo}
              onChange={v => campoMeta('titulo', v)}
              placeholder="Múltiplos y divisores"
            />
          </Campo>
          <Campo label="Dirección web (slug)" ayuda="Minúsculas, sin tildes ni espacios. Va en la URL.">
            <Texto
              value={meta.slug}
              onChange={v => campoMeta('slug', v)}
              placeholder="multiplos-y-divisores"
            />
          </Campo>
          <Campo label="Categoría">
            <Texto
              value={meta.categoria}
              onChange={v => campoMeta('categoria', v)}
              placeholder="Números y Operaciones"
            />
          </Campo>
          <Campo label="Orden en el temario">
            <Numero value={meta.orden} onChange={v => campoMeta('orden', v)} />
          </Campo>
          <Campo label="Duración del video" ayuda="Formato mm:ss. Si no hay video, poné 00:00.">
            <Texto
              value={meta.duracionLabel}
              onChange={v => campoMeta('duracionLabel', v)}
              placeholder="10:15"
            />
          </Campo>
          <Campo label="Link del video" ayuda="Vacío: el tema no muestra el tab Lección.">
            <Texto
              value={meta.videoUrl ?? ''}
              onChange={v => campoMeta('videoUrl', v)}
              placeholder="https://..."
            />
          </Campo>
        </div>
        <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-3">
          <Casilla
            label="Tema gratis (visible sin comprar)"
            checked={meta.gratis}
            onChange={v => campoMeta('gratis', v)}
          />
          <Casilla
            label="Publicado"
            checked={meta.publicado}
            onChange={v => campoMeta('publicado', v)}
          />
        </div>
      </Seccion>

      <Seccion
        titulo="Objetivos"
        ayuda="Qué se lleva el alumno al terminar. Entre 3 y 5, una línea cada uno."
      >
        <ListaDeTextos
          items={c.objetivos}
          onChange={objetivos => setC(prev => ({ ...prev, objetivos }))}
          etiquetaAgregar="Agregar objetivo"
          placeholder={() => 'Qué son los múltiplos y cómo encontrarlos.'}
        />
      </Seccion>

      <Seccion
        titulo="Teoría"
        ayuda="Tres secciones. Título en forma de pregunta, párrafo corto, y una caja opcional."
      >
        <div className="space-y-3">
          {c.explicacion.map((s, i) => (
            <Bloque
              key={i}
              titulo={'Sección ' + (i + 1)}
              puedeQuitar={c.explicacion.length > 1}
              onQuitar={() => quitarDe('explicacion', i)}
            >
              <Campo label="Título">
                <Texto
                  value={s.titulo}
                  onChange={v => editarLista('explicacion', i, { titulo: v })}
                  placeholder="¿Qué son los múltiplos?"
                />
              </Campo>
              <Campo label="Párrafo" ayuda="3 a 5 líneas, en lenguaje de primaria.">
                <TextoLargo
                  value={s.parrafo}
                  onChange={v => editarLista('explicacion', i, { parrafo: v })}
                  rows={4}
                />
              </Campo>
              <Casilla
                label="Incluir caja destacada"
                checked={s.conCaja}
                onChange={v => editarLista('explicacion', i, { conCaja: v })}
              />
              {s.conCaja && (
                <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                  <Campo label="Tipo de caja">
                    <select
                      className={claseSelect}
                      value={s.cajaTipo}
                      onChange={e =>
                        editarLista('explicacion', i, { cajaTipo: e.target.value as TipoCaja })
                      }
                    >
                      {TIPOS_CAJA.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <Campo label="Contenido de la caja">
                    <TextoLargo
                      value={s.cajaContenido}
                      onChange={v => editarLista('explicacion', i, { cajaContenido: v })}
                      rows={3}
                    />
                  </Campo>
                </div>
              )}
            </Bloque>
          ))}
          <BotonAgregar onClick={() => agregarA('explicacion', seccionVacia())}>
            Agregar sección
          </BotonAgregar>
        </div>
      </Seccion>

      <Seccion
        titulo="Ejemplos resueltos"
        ayuda="Tres. El alumno los lee antes de intentar los ejercicios: no puede haber saltos entre pasos."
      >
        <div className="space-y-3">
          {c.ejemplos.map((e, i) => (
            <Bloque
              key={i}
              titulo={'Ejemplo ' + (i + 1)}
              puedeQuitar={c.ejemplos.length > 1}
              onQuitar={() => quitarDe('ejemplos', i)}
            >
              <Campo label="Enunciado">
                <Texto
                  value={e.enunciado}
                  onChange={v => editarLista('ejemplos', i, { enunciado: v })}
                  placeholder="Escribir los 10 primeros múltiplos de 8."
                />
              </Campo>
              <Campo label="Pasos" ayuda="Estrategia, cuenta, resultado.">
                <ListaDeTextos
                  items={e.pasos}
                  onChange={pasos => editarLista('ejemplos', i, { pasos })}
                  etiquetaAgregar="Agregar paso"
                  largo
                />
              </Campo>
            </Bloque>
          ))}
          <BotonAgregar onClick={() => agregarA('ejemplos', ejemploVacio())}>
            Agregar ejemplo
          </BotonAgregar>
        </div>
      </Seccion>

      <Seccion
        titulo="Ejercicios"
        ayuda="Cinco. La computadora los corrige sola, así que la respuesta correcta tiene que ser exacta."
      >
        <div className="space-y-3">
          {c.ejercicios.map((e, i) => {
            const tipo = TIPOS_EJERCICIO.find(t => t.valor === e.tipo)
            return (
              <Bloque
                key={i}
                titulo={'Ejercicio ' + (i + 1)}
                puedeQuitar={c.ejercicios.length > 1}
                onQuitar={() => quitarDe('ejercicios', i)}
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                  <Campo label="Tipo" ayuda={tipo?.ayuda}>
                    <select
                      className={claseSelect}
                      value={e.tipo}
                      onChange={ev =>
                        editarLista('ejercicios', i, { tipo: ev.target.value as TipoEjercicio })
                      }
                    >
                      {TIPOS_EJERCICIO.map(t => (
                        <option key={t.valor} value={t.valor}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <Campo label="Puntos">
                    <Numero
                      value={e.puntos}
                      onChange={v => editarLista('ejercicios', i, { puntos: v })}
                    />
                  </Campo>
                </div>

                <Campo label="Enunciado">
                  <TextoLargo
                    value={e.enunciado}
                    onChange={v => editarLista('ejercicios', i, { enunciado: v })}
                    rows={2}
                  />
                </Campo>

                {e.tipo === 'libre' && (
                  <Campo
                    label="Respuesta correcta"
                    ayuda="Separada por comas: 0,7,14,21. No uses este tipo para respuestas en palabras."
                  >
                    <Texto
                      value={e.respuestaLibre}
                      onChange={v => editarLista('ejercicios', i, { respuestaLibre: v })}
                    />
                  </Campo>
                )}

                {e.tipo === 'multiple' && (
                  <>
                    <Campo label="Opciones">
                      <ListaDeTextos
                        items={e.opciones}
                        minimo={2}
                        onChange={opciones => editarLista('ejercicios', i, { opciones })}
                        etiquetaAgregar="Agregar opción"
                      />
                    </Campo>
                    <Campo label="Cuáles son correctas">
                      <div className="flex flex-wrap gap-3">
                        {e.opciones.filter(Boolean).map(op => (
                          <Casilla
                            key={op}
                            label={op}
                            checked={e.correctasMultiple.includes(op)}
                            onChange={v =>
                              editarLista('ejercicios', i, {
                                correctasMultiple: v
                                  ? [...e.correctasMultiple, op]
                                  : e.correctasMultiple.filter(x => x !== op),
                              })
                            }
                          />
                        ))}
                        {e.opciones.every(o => !o) && (
                          <p className="text-sm text-slate-400">Escribí las opciones primero.</p>
                        )}
                      </div>
                    </Campo>
                  </>
                )}

                {e.tipo === 'si-no' && (
                  <Campo label="Respuesta correcta">
                    <select
                      className={claseSelect}
                      value={e.correctaSiNo}
                      onChange={ev =>
                        editarLista('ejercicios', i, {
                          correctaSiNo: ev.target.value as 'Sí' | 'No',
                        })
                      }
                    >
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </Campo>
                )}

                <Campo
                  label="Explicación"
                  ayuda="Se le muestra al alumno cuando se equivoca. Decí por qué, no repitas la respuesta."
                >
                  <TextoLargo
                    value={e.explicacion}
                    onChange={v => editarLista('ejercicios', i, { explicacion: v })}
                    rows={2}
                  />
                </Campo>
              </Bloque>
            )
          })}
          <BotonAgregar onClick={() => agregarA('ejercicios', ejercicioVacio())}>
            Agregar ejercicio
          </BotonAgregar>
        </div>
      </Seccion>

      <Seccion
        titulo="Autoevaluación"
        ayuda="Diez preguntas, cuatro opciones, una sola correcta. Las incorrectas tienen que ser errores típicos, no relleno."
      >
        <div className="space-y-3">
          {c.quiz.map((p, i) => (
            <Bloque
              key={i}
              titulo={'Pregunta ' + (i + 1)}
              puedeQuitar={c.quiz.length > 1}
              onQuitar={() => quitarDe('quiz', i)}
            >
              <Campo label="Pregunta">
                <TextoLargo
                  value={p.pregunta}
                  onChange={v => editarLista('quiz', i, { pregunta: v })}
                  rows={2}
                />
              </Campo>
              <Campo label="Opciones" ayuda="Marcá el punto de la que es correcta.">
                <div className="space-y-2">
                  {p.opciones.map((op, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={'correcta-' + i}
                        className="h-4 w-4 shrink-0 accent-green-600"
                        checked={p.respuestaCorrectaIndex === j}
                        onChange={() => editarLista('quiz', i, { respuestaCorrectaIndex: j })}
                        aria-label={'Marcar la opción ' + (j + 1) + ' como correcta'}
                      />
                      <div className="flex-1">
                        <Texto
                          value={op}
                          onChange={v =>
                            editarLista('quiz', i, {
                              opciones: p.opciones.map((x, k) => (k === j ? v : x)),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Campo>
              <Campo label="Explicación">
                <TextoLargo
                  value={p.explicacion}
                  onChange={v => editarLista('quiz', i, { explicacion: v })}
                  rows={2}
                />
              </Campo>
            </Bloque>
          ))}
          <BotonAgregar onClick={() => agregarA('quiz', preguntaVacia())}>
            Agregar pregunta
          </BotonAgregar>
        </div>
      </Seccion>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {c.explicacion.length} secciones · {c.ejemplos.length} ejemplos ·{' '}
            {c.ejercicios.length} ejercicios · {c.quiz.length} preguntas
          </p>
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar tema'}
          </button>
        </div>
      </div>
    </form>
  )
}
