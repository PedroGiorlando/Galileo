'use client'

import { useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  ListChecks,
  PencilLine,
  PlayCircle,
  Save,
  Target,
} from 'lucide-react'
import {
  aContenido,
  ejemploVacio,
  ejercicioVacio,
  evaluacionVacia,
  practicoVacio,
  preguntaVacia,
  seccionVacia,
  videoVacio,
  type ContenidoBorrador,
  type Dificultad,
  type TipoCaja,
} from '@/lib/borrador'
import {
  TemaContenidoBorradorSchema,
  TemaContenidoSchema,
  TemaMetaBorradorSchema,
  TemaMetaSchema,
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
import { EditorEjercicio, EditorPregunta } from './EditorEjercicio'
import { EditorMedios } from './EditorMedios'
import { idDeYouTube } from '@/lib/video'

const TIPOS_CAJA: TipoCaja[] = ['ejemplo', 'tip', 'nota']
const DIFICULTADES: Dificultad[] = ['Básico', 'Intermedio', 'Avanzado']

const claseSelect =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'

/**
 * Las siete partes del formulario, en un solo lugar.
 *
 * De acá salen el índice lateral Y los encabezados de cada sección, así no se
 * pueden desincronizar: agregar una sección es agregar una fila.
 */
const SECCIONES = [
  { id: 'ficha', titulo: 'Ficha de la clase', icono: FileText },
  { id: 'objetivos', titulo: 'Objetivos', icono: Target },
  { id: 'videos', titulo: 'Videos', icono: PlayCircle },
  { id: 'explicacion', titulo: 'Explicación escrita', icono: BookOpen },
  { id: 'ejemplos', titulo: 'Ejemplos resueltos', icono: PencilLine },
  { id: 'practicos', titulo: 'Trabajos prácticos', icono: ClipboardCheck },
  { id: 'evaluaciones', titulo: 'Evaluaciones', icono: GraduationCap },
] as const

type SeccionId = (typeof SECCIONES)[number]['id']

/**
 * Una parte del formulario.
 *
 * ANTES ERAN SIETE TARJETAS IDÉNTICAS: mismo borde, mismo fondo, mismo título.
 * Para saber en cuál estabas había que leer. Ahora cada una tiene su ícono y su
 * número, y el encabezado está separado del cuerpo por una línea: con eso solo
 * se distinguen de un vistazo, sin recurrir a siete colores distintos que
 * quedarían de circo.
 *
 * `scroll-mt-20` deja aire arriba al saltar desde el índice, para que el
 * encabezado no quede tapado por la cabecera del sitio.
 */
function Seccion({
  id,
  ayuda,
  cuenta,
  children,
}: {
  id: SeccionId
  ayuda?: string
  /** Cuántos ítems tiene cargados. Se muestra al costado del título. */
  cuenta?: string
  children: React.ReactNode
}) {
  const i = SECCIONES.findIndex(s => s.id === id)
  const { titulo, icono: Icono } = SECCIONES[i]

  return (
    <section
      id={id}
      className="scroll-mt-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
          <Icono size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-slate-800">
            <span className="text-slate-400">{i + 1}.</span> {titulo}
          </h3>
          {ayuda && <p className="mt-0.5 text-sm text-slate-500">{ayuda}</p>}
        </div>

        {cuenta && (
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
            {cuenta}
          </span>
        )}
      </header>

      <div className="space-y-4 p-5">{children}</div>
    </section>
  )
}

/**
 * Índice al costado, pegado a la pantalla.
 *
 * El formulario mide varios miles de píxeles y se recorre a ciegas: no se sabe
 * dónde se está ni cuánto falta, y eso es la mitad del cansancio de cargar una
 * clase. Acá se ve todo de un vistazo, con lo que hay cargado en cada parte, y
 * se salta directo.
 *
 * Solo en pantallas anchas: en un celular ocuparía más de lo que ayuda, y el
 * panel se usa desde una computadora.
 */
function Indice({ cuentas }: { cuentas: Record<SeccionId, string | undefined> }) {
  return (
    <nav aria-label="Partes de la clase" className="hidden lg:block">
      <ol className="sticky top-6 space-y-0.5">
        {SECCIONES.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-slate-900"
            >
              <s.icono size={15} className="shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate">
                <span className="text-slate-400">{i + 1}.</span> {s.titulo}
              </span>
              {cuentas[s.id] && (
                <span className="shrink-0 text-xs text-slate-400">{cuentas[s.id]}</span>
              )}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Traduce el `path` de un error de Zod a algo legible por quien carga contenido. */
function rutaLegible(path: PropertyKey[]): string {
  return path.map(p => (typeof p === 'number' ? '#' + (p + 1) : String(p))).join(' → ')
}

export function SubtemaForm({
  materiaSlug,
  metaInicial,
  contenidoInicial,
  onGuardar,
}: {
  materiaSlug: string
  metaInicial: TemaMeta
  contenidoInicial: ContenidoBorrador
  /**
   * El contenido va como `unknown`: un borrador no es un TemaContenido válido
   * todavía, y ese es justamente el punto. El servidor lo revisa con el rigor
   * que corresponda según se publique o no.
   */
  onGuardar: (meta: TemaMeta, contenido: unknown) => void | Promise<void>
}) {
  const [meta, setMeta] = useState<TemaMeta>(metaInicial)
  const [c, setC] = useState<ContenidoBorrador>(contenidoInicial)
  const [errores, setErrores] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)

  const campoMeta = <K extends keyof TemaMeta>(k: K, v: TemaMeta[K]) =>
    setMeta(prev => ({ ...prev, [k]: v }))

  // Adónde van las imágenes que se suban: se guardan en el bucket bajo
  // materia/clase, así el depósito se puede mirar desde Supabase y se entiende
  // qué es cada archivo.
  const ubicacion = { materiaSlug, claseSlug: meta.slug }

  // Un solo helper para todas las listas del contenido: reemplazar el ítem i.
  function editar<K extends keyof ContenidoBorrador>(
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

  function quitar(clave: keyof ContenidoBorrador, i: number) {
    setC(prev => ({ ...prev, [clave]: (prev[clave] as unknown[]).filter((_, j) => j !== i) }))
  }

  function agregar(clave: keyof ContenidoBorrador, item: unknown) {
    setC(prev => ({ ...prev, [clave]: [...(prev[clave] as unknown[]), item] }))
  }

  const contenidoArmado = aContenido(c)

  // Lo que muestra el índice al costado de cada parte. Se omite cuando no hay
  // nada: un "0" al lado de cada sección de una clase recién creada es ruido,
  // no información.
  const cuenta = (n: number) => (n > 0 ? String(n) : undefined)

  const cuentas: Record<SeccionId, string | undefined> = {
    ficha: undefined,
    objetivos: cuenta(c.objetivos.filter(Boolean).length),
    videos: cuenta(c.videos.length),
    explicacion: cuenta(c.explicacion.length),
    ejemplos: cuenta(c.ejemplos.length),
    practicos: cuenta(c.practicos.length),
    evaluaciones: cuenta(c.evaluaciones.length),
  }

  /**
   * Todo lo que falta para que esta clase se pueda publicar.
   *
   * Se calcula en cada render, no solo al guardar: mientras la clase esté sin
   * publicar la lista se muestra como pendientes, no como errores. Escribir una
   * clase lleva horas y no se hace de una sentada; que el formulario no deje
   * guardar hasta tener todo obliga a terminarlo de un tirón o a inventar
   * relleno para que pase, y ese relleno después se publica.
   */
  const faltaParaPublicar = (() => {
    const rMeta = TemaMetaSchema.safeParse(meta)
    const rContenido = TemaContenidoSchema.safeParse(contenidoArmado)
    return [
      ...(rMeta.success
        ? []
        : rMeta.error.issues.map(i => 'Ficha → ' + rutaLegible(i.path) + ': ' + i.message)),
      ...(rContenido.success
        ? []
        : rContenido.error.issues.map(i => rutaLegible(i.path) + ': ' + i.message)),
    ]
  })()

  async function guardar(e: React.FormEvent) {
    e.preventDefault()

    // Publicar exige todo. Guardar sin publicar solo exige que la forma sea
    // sana, con las mismas reglas que aplica el servidor: si algo se cuela acá,
    // allá se rechaza igual.
    const bloqueantes = meta.publicado
      ? faltaParaPublicar
      : [
          ...(TemaMetaBorradorSchema.safeParse(meta).error?.issues ?? []).map(
            i => 'Ficha → ' + rutaLegible(i.path) + ': ' + i.message,
          ),
          ...(TemaContenidoBorradorSchema.safeParse(contenidoArmado).error?.issues ?? []).map(
            i => rutaLegible(i.path) + ': ' + i.message,
          ),
        ]

    setErrores(bloqueantes)
    if (bloqueantes.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setGuardando(true)
    try {
      await onGuardar(meta, contenidoArmado)
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

      {/* Sin publicar, lo que falta es información y no un error: se puede
          guardar igual. Se muestra para que nadie descubra recién al querer
          publicar que le faltan seis cosas de hace tres semanas. */}
      {!meta.publicado && faltaParaPublicar.length > 0 && (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <ListChecks size={16} />
            Guardás como borrador. Falta{faltaParaPublicar.length === 1 ? '' : 'n'}{' '}
            {faltaParaPublicar.length}{' '}
            {faltaParaPublicar.length === 1 ? 'cosa' : 'cosas'} para poder publicarla
          </p>
          <ul className="ml-6 list-disc space-y-1 text-sm text-amber-800">
            {faltaParaPublicar.slice(0, 10).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          {faltaParaPublicar.length > 10 && (
            <p className="ml-6 text-sm text-amber-700">
              …y {faltaParaPublicar.length - 10} más.
            </p>
          )}
        </div>
      )}

      {/* Índice a la izquierda, secciones a la derecha. En pantallas angostas
          el índice no se muestra y esto colapsa a una sola columna. */}
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
        <Indice cuentas={cuentas} />

        <div className="space-y-5">
      <Seccion id="ficha">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Título">
            <Texto value={meta.titulo} onChange={v => campoMeta('titulo', v)} />
          </Campo>
          <Campo label="Dirección web (slug)" ayuda="No se puede cambiar desde acá.">
            <Texto value={meta.slug} onChange={() => {}} />
          </Campo>
          <Campo label="Unidad">
            <Texto value={meta.categoria} onChange={v => campoMeta('categoria', v)} />
          </Campo>
          <Campo label="Duración total" ayuda="Formato mm:ss. Si no hay video, poné 00:00.">
            <Texto value={meta.duracionLabel} onChange={v => campoMeta('duracionLabel', v)} />
          </Campo>
        </div>

        <Campo
          label="Descripción corta"
          ayuda="Una línea. Aparece bajo el título y en la columna Contenido del temario."
        >
          <TextoLargo
            value={meta.descripcion}
            onChange={v => campoMeta('descripcion', v)}
            rows={2}
          />
        </Campo>

        <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-3">
          <Casilla
            label="Clase gratis (visible sin comprar)"
            checked={meta.gratis}
            onChange={v => campoMeta('gratis', v)}
          />
          <Casilla
            label="Publicada"
            checked={meta.publicado}
            onChange={v => campoMeta('publicado', v)}
          />
        </div>
      </Seccion>

      <Seccion
        id="objetivos"
        cuenta={cuentas.objetivos}
        ayuda="Qué se lleva el alumno al terminar. Entre 3 y 5, una línea cada uno."
      >
        <ListaDeTextos
          items={c.objetivos}
          onChange={objetivos => setC(prev => ({ ...prev, objetivos }))}
          etiquetaAgregar="Agregar objetivo"
        />
      </Seccion>

      <Seccion
        id="videos"
        cuenta={cuentas.videos}
        ayuda="Los de la solapa Lección. Si no hay ninguno, esa solapa no aparece."
      >
        <div className="space-y-3">
          {c.videos.map((v, i) => (
            <Bloque key={i} titulo={`Video ${i + 1}`} onQuitar={() => quitar('videos', i)}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo label="Título">
                  <Texto
                    value={v.titulo}
                    onChange={val => editar('videos', i, { titulo: val })}
                    placeholder="Suma de vectores, parte 1"
                  />
                </Campo>
                <Campo label="Subtítulo" ayuda="Opcional.">
                  <Texto
                    value={v.subtitulo}
                    onChange={val => editar('videos', i, { subtitulo: val })}
                    placeholder="Método analítico paso a paso"
                  />
                </Campo>
                <Campo
                  label="Enlace de YouTube"
                  ayuda="Pegá la dirección del video tal como la copiaste."
                  // El aviso sale mientras se escribe, no recién al guardar:
                  // enterarse de que el enlace estaba mal después de cargar
                  // veinte ejercicios es la forma más rápida de odiar el panel.
                  error={
                    v.enlace.trim() && !idDeYouTube(v.enlace)
                      ? 'No se reconoce como un enlace de YouTube.'
                      : undefined
                  }
                >
                  <Texto
                    value={v.enlace}
                    onChange={val => editar('videos', i, { enlace: val })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </Campo>
                <Campo label="Duración" ayuda="Formato mm:ss. Opcional.">
                  <Texto
                    value={v.duracionLabel}
                    onChange={val => editar('videos', i, { duracionLabel: val })}
                    placeholder="12:40"
                  />
                </Campo>
              </div>
            </Bloque>
          ))}
          <BotonAgregar onClick={() => agregar('videos', videoVacio())}>Agregar video</BotonAgregar>
        </div>
      </Seccion>

      <Seccion
        id="explicacion"
        cuenta={cuentas.explicacion}
        ayuda="Título en forma de pregunta, párrafo corto, y una caja opcional."
      >
        <div className="space-y-3">
          {c.explicacion.map((s, i) => (
            <Bloque
              key={i}
              titulo={`Sección ${i + 1}`}
              puedeQuitar={c.explicacion.length > 1}
              onQuitar={() => quitar('explicacion', i)}
            >
              <Campo label="Título">
                <Texto value={s.titulo} onChange={v => editar('explicacion', i, { titulo: v })} />
              </Campo>
              <Campo label="Párrafo" ayuda="3 a 5 líneas, claras y sin dar por sabido el tema.">
                <TextoLargo
                  value={s.parrafo}
                  onChange={v => editar('explicacion', i, { parrafo: v })}
                  rows={4}
                />
              </Campo>
              <EditorMedios
                etiqueta="Imágenes y videos de esta sección"
                ayuda="Van debajo del párrafo. En Física, el gráfico suele explicar más que el texto."
                medios={s.medios}
                onChange={medios => editar('explicacion', i, { medios })}
                {...ubicacion}
              />

              <Casilla
                label="Incluir caja destacada"
                checked={s.conCaja}
                onChange={v => editar('explicacion', i, { conCaja: v })}
              />
              {s.conCaja && (
                <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                  <Campo label="Tipo de caja">
                    <select
                      className={claseSelect}
                      value={s.cajaTipo}
                      onChange={e =>
                        editar('explicacion', i, { cajaTipo: e.target.value as TipoCaja })
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
                      onChange={v => editar('explicacion', i, { cajaContenido: v })}
                      rows={3}
                    />
                  </Campo>
                </div>
              )}
            </Bloque>
          ))}
          <BotonAgregar onClick={() => agregar('explicacion', seccionVacia())}>
            Agregar sección
          </BotonAgregar>
        </div>
      </Seccion>

      <Seccion
        id="ejemplos"
        cuenta={cuentas.ejemplos}
        ayuda="El alumno los lee antes de intentar los prácticos: no puede haber saltos entre pasos."
      >
        <div className="space-y-3">
          {c.ejemplos.map((e, i) => (
            <Bloque
              key={i}
              titulo={`Ejemplo ${i + 1}`}
              puedeQuitar={c.ejemplos.length > 1}
              onQuitar={() => quitar('ejemplos', i)}
            >
              <Campo label="Enunciado">
                <Texto value={e.enunciado} onChange={v => editar('ejemplos', i, { enunciado: v })} />
              </Campo>

              {c.videos.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                  <Campo label="Se explica en el video" ayuda="Opcional.">
                    <select
                      className={claseSelect}
                      value={e.videoIndice}
                      onChange={ev =>
                        editar('ejemplos', i, { videoIndice: Number(ev.target.value) })
                      }
                    >
                      <option value={-1}>Ninguno</option>
                      {c.videos.map((v, j) => (
                        <option key={j} value={j}>
                          {j + 1}. {v.titulo || 'Sin título'}
                        </option>
                      ))}
                    </select>
                  </Campo>
                  {e.videoIndice >= 0 && (
                    <Campo label="En el segundo" ayuda="4:15 son 255.">
                      <Numero
                        min={0}
                        value={e.videoSegundo}
                        onChange={v => editar('ejemplos', i, { videoSegundo: v || 0 })}
                      />
                    </Campo>
                  )}
                </div>
              )}

              <Campo label="Pasos" ayuda="Estrategia, cuenta, resultado.">
                <ListaDeTextos
                  items={e.pasos}
                  onChange={pasos => editar('ejemplos', i, { pasos })}
                  etiquetaAgregar="Agregar paso"
                  largo
                />
              </Campo>
            </Bloque>
          ))}
          <BotonAgregar onClick={() => agregar('ejemplos', ejemploVacio())}>
            Agregar ejemplo
          </BotonAgregar>
        </div>
      </Seccion>

      <Seccion
        id="practicos"
        cuenta={cuentas.practicos}
        ayuda="Cada TP se numera solo. La computadora corrige, así que la respuesta tiene que ser exacta."
      >
        <div className="space-y-4">
          {c.practicos.map((tp, iTp) => (
            <div key={iTp} className="rounded-lg border border-slate-300 bg-slate-50/60 p-4">
              <div className="mb-3 flex flex-wrap items-end gap-3">
                <div className="min-w-0 flex-1">
                  <Campo label={`Trabajo práctico ${iTp + 1} — título`} ayuda="Opcional.">
                    <Texto
                      value={tp.titulo}
                      onChange={v => editar('practicos', iTp, { titulo: v })}
                      placeholder="Componentes y resultante"
                    />
                  </Campo>
                </div>
                <button
                  type="button"
                  onClick={() => quitar('practicos', iTp)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
                >
                  Quitar TP
                </button>
              </div>

              <div className="space-y-3">
                {tp.ejercicios.map((ej, iEj) => (
                  <EditorEjercicio
                    key={iEj}
                    ejercicio={ej}
                    indice={iEj}
                    puedeQuitar={tp.ejercicios.length > 1}
                    ubicacion={ubicacion}
                    onCambiar={cambio =>
                      editar('practicos', iTp, {
                        ejercicios: tp.ejercicios.map((x, k) =>
                          k === iEj ? { ...x, ...cambio } : x,
                        ),
                      })
                    }
                    onQuitar={() =>
                      editar('practicos', iTp, {
                        ejercicios: tp.ejercicios.filter((_, k) => k !== iEj),
                      })
                    }
                  />
                ))}
                <BotonAgregar
                  onClick={() =>
                    editar('practicos', iTp, { ejercicios: [...tp.ejercicios, ejercicioVacio()] })
                  }
                >
                  Agregar ejercicio al TP {iTp + 1}
                </BotonAgregar>
              </div>
            </div>
          ))}
          <BotonAgregar onClick={() => agregar('practicos', practicoVacio())}>
            Agregar trabajo práctico
          </BotonAgregar>
        </div>
      </Seccion>

      <Seccion
        id="evaluaciones"
        cuenta={cuentas.evaluaciones}
        ayuda="Cuatro opciones y una sola correcta. Las incorrectas tienen que ser errores típicos, no relleno."
      >
        <div className="space-y-4">
          {c.evaluaciones.map((ev, iEv) => (
            <div key={iEv} className="rounded-lg border border-slate-300 bg-slate-50/60 p-4">
              <div className="mb-3 flex flex-wrap items-end gap-3">
                <div className="min-w-0 flex-1">
                  <Campo label={`Evaluación ${iEv + 1} — título`} ayuda="Opcional.">
                    <Texto
                      value={ev.titulo}
                      onChange={v => editar('evaluaciones', iEv, { titulo: v })}
                    />
                  </Campo>
                </div>
                <button
                  type="button"
                  onClick={() => quitar('evaluaciones', iEv)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
                >
                  Quitar evaluación
                </button>
              </div>

              {/* Lo que el alumno ve ANTES de empezar, para saber a qué se
                  mete. Los tres en cero o vacío significan "sin límite". */}
              <div className="mb-3 grid gap-3 sm:grid-cols-3">
                <Campo label="Dificultad" ayuda="Opcional. Se muestra antes de empezar.">
                  <select
                    className={claseSelect}
                    value={ev.dificultad}
                    onChange={e =>
                      editar('evaluaciones', iEv, {
                        dificultad: e.target.value as Dificultad | '',
                      })
                    }
                  >
                    <option value="">Sin indicar</option>
                    {DIFICULTADES.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo
                  label="Tiempo límite (minutos)"
                  ayuda="0 = sin reloj. Por ahora es orientativo: falta que el servidor lo controle."
                >
                  <Numero
                    min={0}
                    value={ev.tiempoLimiteMinutos}
                    onChange={v => editar('evaluaciones', iEv, { tiempoLimiteMinutos: v })}
                  />
                </Campo>

                <Campo label="Intentos permitidos" ayuda="0 = las veces que quiera.">
                  <Numero
                    min={0}
                    value={ev.intentos}
                    onChange={v => editar('evaluaciones', iEv, { intentos: v })}
                  />
                </Campo>
              </div>

              <div className="space-y-3">
                {ev.preguntas.map((p, iP) => (
                  <EditorPregunta
                    key={iP}
                    pregunta={p}
                    indice={iP}
                    nombreRadio={`correcta-${iEv}-${iP}`}
                    puedeQuitar={ev.preguntas.length > 1}
                    ubicacion={ubicacion}
                    onCambiar={cambio =>
                      editar('evaluaciones', iEv, {
                        preguntas: ev.preguntas.map((x, k) => (k === iP ? { ...x, ...cambio } : x)),
                      })
                    }
                    onQuitar={() =>
                      editar('evaluaciones', iEv, {
                        preguntas: ev.preguntas.filter((_, k) => k !== iP),
                      })
                    }
                  />
                ))}
                <BotonAgregar
                  onClick={() =>
                    editar('evaluaciones', iEv, { preguntas: [...ev.preguntas, preguntaVacia()] })
                  }
                >
                  Agregar pregunta a la evaluación {iEv + 1}
                </BotonAgregar>
              </div>
            </div>
          ))}
          <BotonAgregar onClick={() => agregar('evaluaciones', evaluacionVacia())}>
            Agregar evaluación
          </BotonAgregar>
        </div>
      </Seccion>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {c.videos.length} videos · {c.explicacion.length} secciones · {c.ejemplos.length}{' '}
            ejemplos · {c.practicos.length} TP · {c.evaluaciones.length} evaluaciones
          </p>
          {/* El botón dice qué va a pasar. "Guardar clase" con la casilla
              destildada no aclara que eso NO la deja visible para nadie. */}
          <button
            type="submit"
            disabled={guardando}
            className="flex min-h-11 items-center gap-2 rounded-md bg-green-600 px-5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={16} />
            {guardando
              ? 'Guardando…'
              : meta.publicado
                ? 'Guardar y publicar'
                : 'Guardar borrador'}
          </button>
        </div>
      </div>
    </form>
  )
}
