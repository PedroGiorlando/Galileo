'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Plus, Trash2 } from 'lucide-react'
import {
  alternarCursoPublicado,
  alternarMateriaActiva,
  borrarCarrera,
  borrarMateria,
  crearCarrera,
  crearMateria,
  crearPrograma,
  dejarDeDictar,
  dictarMateria,
} from '@/app/admin/acciones-estructura'

/**
 * Las piezas de la pantalla de estructura.
 *
 * Son tres formas genéricas y no seis formularios parecidos: alta, botón que
 * ejecuta una acción, e interruptor. Las seis operaciones cambian solo en qué
 * acción llaman y qué campos extra piden.
 *
 * Ninguna pide confirmación. No hace falta: el servidor niega toda baja que
 * arrastre contenido, y el error que vuelve dice exactamente qué falta. Un
 * "¿estás seguro?" que se puede contestar que sí sin leer no protege nada.
 */

type Resultado = { ok: true } | { ok: false; error: string }

function Error({ texto }: { texto: string | null }) {
  if (!texto) return null
  return (
    <p role="alert" className="mt-2 text-xs font-medium text-red-600">
      {texto}
    </p>
  )
}

const claseSelect =
  'min-w-0 rounded-lg border border-linea bg-white px-3 py-2 text-sm focus:border-galileo focus:outline-none'

/** Formulario de alta: campos extra opcionales + un nombre + botón. */
export function Alta({
  etiqueta,
  placeholder,
  ayuda,
  extra,
  onEnviar,
}: {
  etiqueta: string
  placeholder: string
  ayuda?: string
  extra?: React.ReactNode
  onEnviar: (texto: string) => Promise<Resultado>
}) {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, empezar] = useTransition()
  const router = useRouter()

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    empezar(async () => {
      const r = await onEnviar(texto)
      if (r.ok) {
        setTexto('')
        router.refresh()
      } else {
        setError(r.error)
      }
    })
  }

  return (
    <form onSubmit={enviar} className="rounded-2xl border border-dashed border-linea p-4">
      <p className="text-sm font-medium text-tinta">{etiqueta}</p>
      {ayuda && <p className="mt-0.5 text-xs text-tinta-suave">{ayuda}</p>}

      <div className="mt-2 flex flex-wrap gap-2">
        {extra}
        <input
          type="text"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder={placeholder}
          className="min-w-40 flex-1 rounded-lg border border-linea px-3 py-2 text-sm focus:border-galileo focus:outline-none"
        />
        <button
          type="submit"
          disabled={enviando || texto.trim().length < 3}
          className="flex min-h-11 items-center gap-1.5 rounded-lg bg-galileo px-4 text-sm font-medium text-white hover:bg-galileo-oscuro disabled:opacity-50"
        >
          {enviando ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Agregar
        </button>
      </div>
      <Error texto={error} />
    </form>
  )
}

export function Select({
  valor,
  onChange,
  opciones,
  etiqueta,
}: {
  valor: number
  onChange: (v: number) => void
  opciones: { id: number; nombre: string }[]
  etiqueta: string
}) {
  return (
    <select
      aria-label={etiqueta}
      value={valor}
      onChange={e => onChange(Number(e.target.value))}
      className={claseSelect}
    >
      {opciones.map(o => (
        <option key={o.id} value={o.id}>
          {o.nombre}
        </option>
      ))}
    </select>
  )
}

/** Botón que ejecuta una acción y refresca. Para bajas y para interruptores. */
export function Accion({
  onEjecutar,
  titulo,
  children,
  className = '',
}: {
  onEjecutar: () => Promise<Resultado>
  titulo: string
  children: React.ReactNode
  className?: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [enviando, empezar] = useTransition()
  const router = useRouter()

  return (
    <>
      <button
        type="button"
        title={titulo}
        aria-label={titulo}
        disabled={enviando}
        onClick={() =>
          empezar(async () => {
            setError(null)
            const r = await onEjecutar()
            if (r.ok) router.refresh()
            else setError(r.error)
          })
        }
        className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm disabled:opacity-50 ${className}`}
      >
        {enviando ? <Loader2 size={15} className="animate-spin" /> : children}
      </button>
      <Error texto={error} />
    </>
  )
}

export function Borrar({ onEjecutar, titulo }: { onEjecutar: () => Promise<Resultado>; titulo: string }) {
  return (
    <Accion
      onEjecutar={onEjecutar}
      titulo={titulo}
      className="text-slate-400 hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 size={15} />
    </Accion>
  )
}

/** Interruptor de visible / oculto, con el estado escrito en palabras. */
export function Visibilidad({
  visible,
  onCambiar,
  etiquetaVisible,
  etiquetaOculto,
}: {
  visible: boolean
  onCambiar: (nuevo: boolean) => Promise<Resultado>
  etiquetaVisible: string
  etiquetaOculto: string
}) {
  return (
    <Accion
      onEjecutar={() => onCambiar(!visible)}
      titulo={visible ? `Ocultar (ahora: ${etiquetaVisible})` : `Mostrar (ahora: ${etiquetaOculto})`}
      className={
        visible
          ? 'border border-galileo/30 bg-galileo/10 font-medium text-galileo-oscuro'
          : 'border border-linea text-tinta-suave hover:bg-slate-50'
      }
    >
      {visible ? <Eye size={14} /> : <EyeOff size={14} />}
      {visible ? etiquetaVisible : etiquetaOculto}
    </Accion>
  )
}

// --- La pantalla ------------------------------------------------------------

export interface DatosEstructura {
  programas: { id: number; nombre: string }[]
  carreras: { id: number; programaId: number; nombre: string }[]
  materias: {
    id: number
    nombre: string
    slug: string
    activa: boolean
    modulos: number
    clases: number
  }[]
  cursos: { id: number; carreraId: number; materiaId: number; titulo: string; publicado: boolean }[]
}

function Seccion({
  titulo,
  ayuda,
  children,
}: {
  titulo: string
  ayuda: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold text-tinta">{titulo}</h2>
        <p className="mt-0.5 text-sm text-tinta-suave">{ayuda}</p>
      </div>
      {children}
    </section>
  )
}

export function PanelEstructura({ datos }: { datos: DatosEstructura }) {
  const { programas, carreras, materias, cursos } = datos

  const [programaElegido, setProgramaElegido] = useState(programas[0]?.id ?? 0)
  const [carreraElegida, setCarreraElegida] = useState(carreras[0]?.id ?? 0)
  const [materiaElegida, setMateriaElegida] = useState(materias[0]?.id ?? 0)

  const nombreDe = (id: number, lista: { id: number; nombre: string }[]) =>
    lista.find(x => x.id === id)?.nombre ?? ''

  // Las carreras se muestran con su programa adelante: hay una "Ingeniería" por
  // universidad y sin el prefijo el select es indistinguible.
  const carrerasConPrograma = carreras.map(c => ({
    id: c.id,
    nombre: `${nombreDe(c.programaId, programas)} · ${c.nombre}`,
  }))

  return (
    <div className="space-y-10">
      <Seccion
        titulo="Materias"
        ayuda="El contenido. Se escribe una sola vez y después se dicta en las carreras que haga falta."
      >
        <ul className="space-y-2">
          {materias.map(m => {
            const dictadaEn = cursos.filter(c => c.materiaId === m.id).length
            const vacia = m.modulos === 0 && dictadaEn === 0

            return (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-linea bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-tinta">{m.nombre}</p>
                  <p className="font-mono text-xs text-tinta-suave">
                    /{m.slug} · {m.modulos} módulos · {m.clases} clases · se dicta en {dictadaEn}{' '}
                    {dictadaEn === 1 ? 'carrera' : 'carreras'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Visibilidad
                    visible={m.activa}
                    onCambiar={activa => alternarMateriaActiva(m.id, activa)}
                    etiquetaVisible="Activa"
                    etiquetaOculto="Apagada"
                  />
                  {/* Solo se ofrece borrar lo que está vacío. Con contenido, el
                      botón sería una trampa: el servidor lo negaría igual. */}
                  {vacia && (
                    <Borrar
                      onEjecutar={() => borrarMateria(m.id)}
                      titulo={`Borrar ${m.nombre}`}
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <Alta
          etiqueta="Nueva materia"
          ayuda="Nace vacía y apagada del sitio hasta que tenga contenido."
          placeholder="Química"
          onEnviar={crearMateria}
        />
      </Seccion>

      <Seccion
        titulo="Programas y carreras"
        ayuda="Dónde se dicta. Un programa es la institución; una carrera, lo que se estudia ahí."
      >
        <ul className="space-y-3">
          {programas.map(p => (
            <li key={p.id} className="rounded-2xl border border-linea bg-white p-4">
              <h3 className="font-display font-bold text-tinta">{p.nombre}</h3>

              <ul className="mt-3 space-y-3">
                {carreras
                  .filter(c => c.programaId === p.id)
                  .map(c => {
                    const suyos = cursos.filter(k => k.carreraId === c.id)
                    return (
                      <li key={c.id} className="rounded-xl bg-slate-50 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-tinta">{c.nombre}</p>
                          {suyos.length === 0 && (
                            <Borrar
                              onEjecutar={() => borrarCarrera(c.id)}
                              titulo={`Borrar ${c.nombre}`}
                            />
                          )}
                        </div>

                        {suyos.length === 0 ? (
                          <p className="mt-1 text-xs text-tinta-suave">
                            Todavía no dicta ninguna materia.
                          </p>
                        ) : (
                          <ul className="mt-2 space-y-1.5">
                            {suyos.map(k => (
                              <li
                                key={k.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2"
                              >
                                <span className="min-w-0 text-sm text-tinta">
                                  {nombreDe(k.materiaId, materias)}
                                  <span className="text-tinta-suave"> · {k.titulo}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <Visibilidad
                                    visible={k.publicado}
                                    onCambiar={pub => alternarCursoPublicado(k.id, pub)}
                                    etiquetaVisible="Publicada"
                                    etiquetaOculto="Oculta"
                                  />
                                  <Borrar
                                    onEjecutar={() => dejarDeDictar(k.id)}
                                    titulo="Dejar de dictar esta materia acá"
                                  />
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
              </ul>
            </li>
          ))}
        </ul>

        <Alta
          etiqueta="Nueva carrera"
          placeholder="Ingeniería"
          extra={
            <Select
              etiqueta="Programa"
              valor={programaElegido}
              onChange={setProgramaElegido}
              opciones={programas}
            />
          }
          onEnviar={t => crearCarrera(programaElegido, t)}
        />

        <Alta
          etiqueta="Nuevo programa"
          ayuda="Una institución más: otra universidad, otro instituto."
          placeholder="Universidad de Mendoza"
          onEnviar={crearPrograma}
        />
      </Seccion>

      <Seccion
        titulo="Dictar una materia en una carrera"
        ayuda="Esto crea la página del temario. La materia sigue siendo la misma: el contenido no se duplica."
      >
        <Alta
          etiqueta="Dictar"
          ayuda="El título es lo que se ve como encabezado del temario."
          placeholder="Física — Ingreso UTN FRM"
          extra={
            <>
              <Select
                etiqueta="Carrera"
                valor={carreraElegida}
                onChange={setCarreraElegida}
                opciones={carrerasConPrograma}
              />
              <Select
                etiqueta="Materia"
                valor={materiaElegida}
                onChange={setMateriaElegida}
                opciones={materias}
              />
            </>
          }
          onEnviar={t => dictarMateria(carreraElegida, materiaElegida, t)}
        />
      </Seccion>
    </div>
  )
}
