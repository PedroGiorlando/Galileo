'use client'

import { useState } from 'react'
import { PlayCircle, FileText, PencilLine, ClipboardCheck, MapPin } from 'lucide-react'
import type { SubtemaCompleto } from '@/data/topicData'
import type { Curso, TemaConSubtemas } from '@/lib/contenido'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import { CompletarButton } from './CompletarButton'
import { LeccionTab } from './tabs/LeccionTab'
import { ExplicacionTab } from './tabs/ExplicacionTab'
import { EjemplosTab } from './tabs/EjemplosTab'
import { EjerciciosTab } from './tabs/EjerciciosTab'
import { AutoevaluacionTab } from './tabs/AutoevaluacionTab'

type TabId = 'leccion' | 'explicacion' | 'ejemplos' | 'ejercicios' | 'autoevaluacion'

/**
 * Client Component: es dueño del estado compartido de la clase (solapa activa y
 * qué clases están completadas), que necesitan a la vez el Sidebar (los checks),
 * el RightPanel (el contador) y el botón de completar.
 *
 * Ojo: 'use client' NO significa "no se renderiza en el servidor". Next igual
 * genera el HTML de esto en el servidor y después lo hidrata — el texto de la
 * explicación viaja en el HTML inicial, que es lo que indexa Google.
 */
export function SubtemaVista({
  subtema,
  curso,
  temaNombre,
  temario,
}: {
  subtema: SubtemaCompleto
  curso: Curso
  temaNombre: string
  temario: TemaConSubtemas[]
}) {
  // La solapa Lección solo existe si hay video cargado. Sin esto, una clase sin
  // video abría en un reproductor vacío.
  const hayVideo = Boolean(subtema.videoUrl)

  const TABS = [
    ...(hayVideo ? [{ id: 'leccion' as const, label: 'Lección', icon: PlayCircle }] : []),
    { id: 'explicacion' as const, label: 'Explicación escrita', icon: FileText },
    { id: 'ejemplos' as const, label: 'Ejemplos resueltos', icon: PencilLine },
    { id: 'ejercicios' as const, label: 'Ejercicios', icon: ClipboardCheck },
    { id: 'autoevaluacion' as const, label: 'Autoevaluación', icon: MapPin },
  ]

  const [tabActivo, setTabActivo] = useState<TabId>(hayVideo ? 'leccion' : 'explicacion')

  // Una sola lista de slugs completados por materia, en vez de una clave por
  // clase: el contador de progreso la necesita entera. En la Fase 2 esto pasa a
  // ser una consulta a la tabla `progreso`.
  const [completados, setCompletados] = useLocalStorage<string[]>(
    `galileo:completados:${curso.slug}`,
    [],
  )
  const completado = completados.includes(subtema.slug)

  const total = temario.reduce((n, t) => n + t.subtemas.length, 0) || 1

  const tabProps = { subtema }

  return (
    <main className="mx-auto flex max-w-7xl flex-col items-start gap-6 p-6 lg:flex-row">
      <Sidebar
        cursoSlug={curso.slug}
        cursoNombre={curso.nombre}
        temaNombre={temaNombre}
        temario={temario}
        slugActual={subtema.slug}
        completados={completados}
      />

      <div className="min-w-0 flex-1 space-y-4">
        {/* Encabezado único de la clase. Antes cada solapa repetía su propio
            <h1>, así que la página tenía cinco (cuatro ocultos): Google espera
            uno solo y un lector de pantalla anunciaba cinco títulos distintos
            para la misma página. */}
        <header className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase text-orange-500">{temaNombre}</p>
              <h1 className="mt-0.5 text-2xl font-bold text-slate-900">{subtema.titulo}</h1>
              {subtema.descripcion && (
                <p className="mt-1 max-w-2xl text-slate-600">{subtema.descripcion}</p>
              )}
            </div>
            <CompletarButton
              completado={completado}
              onClick={() =>
                setCompletados(prev =>
                  prev.includes(subtema.slug)
                    ? prev.filter(s => s !== subtema.slug)
                    : [...prev, subtema.slug],
                )
              }
            />
          </div>
        </header>

        <div
          role="tablist"
          className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1"
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tabActivo === tab.id}
              onClick={() => setTabActivo(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
                tabActivo === tab.id
                  ? 'bg-green-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          {hayVideo && (
            <div className={tabActivo === 'leccion' ? '' : 'hidden'}>
              <LeccionTab {...tabProps} />
            </div>
          )}
          <div className={tabActivo === 'explicacion' ? '' : 'hidden'}>
            <ExplicacionTab {...tabProps} />
          </div>
          <div className={tabActivo === 'ejemplos' ? '' : 'hidden'}>
            <EjemplosTab {...tabProps} />
          </div>
          <div className={tabActivo === 'ejercicios' ? '' : 'hidden'}>
            <EjerciciosTab {...tabProps} />
          </div>
          <div className={tabActivo === 'autoevaluacion' ? '' : 'hidden'}>
            <AutoevaluacionTab {...tabProps} />
          </div>
        </div>
      </div>

      <RightPanel
        courseProgressPercent={(completados.length / total) * 100}
        completedCount={completados.length}
        totalCount={total}
      />
    </main>
  )
}
