'use client'

import { useState } from 'react'
import { PlayCircle, FileText, PencilLine, ClipboardCheck, MapPin } from 'lucide-react'
import type { SubtemaCompleto } from '@/data/topicData'
import type { Curso, TemaConSubtemas } from '@/lib/contenido'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import { LeccionTab } from './tabs/LeccionTab'
import { ExplicacionTab } from './tabs/ExplicacionTab'
import { EjemplosTab } from './tabs/EjemplosTab'
import { EjerciciosTab } from './tabs/EjerciciosTab'
import { AutoevaluacionTab } from './tabs/AutoevaluacionTab'

const TABS = [
  { id: 'leccion', label: 'Lección', icon: PlayCircle },
  { id: 'explicacion', label: 'Explicación escrita', icon: FileText },
  { id: 'ejemplos', label: 'Ejemplos resueltos', icon: PencilLine },
  { id: 'ejercicios', label: 'Ejercicios', icon: ClipboardCheck },
  { id: 'autoevaluacion', label: 'Autoevaluación', icon: MapPin },
] as const

type TabId = (typeof TABS)[number]['id']

/**
 * Client Component: es dueño del estado compartido del subtema (solapa activa y
 * qué subtemas están completados), que necesitan a la vez el Sidebar (los
 * checks), el RightPanel (el contador) y las solapas (el botón). Por eso el
 * límite cliente/servidor cae acá y no más adentro.
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
  const [tabActivo, setTabActivo] = useState<TabId>('leccion')

  // Una sola lista de slugs completados por curso, en vez de una clave por
  // subtema: el contador de progreso la necesita entera. En la Fase 2 esto pasa
  // a ser una consulta a la tabla `progreso`.
  const [completados, setCompletados] = useLocalStorage<string[]>(
    `galileo:completados:${curso.gradoSlug}`,
    [],
  )
  const completado = completados.includes(subtema.slug)

  const total = temario.reduce((n, t) => n + t.subtemas.length, 0) || 1
  const courseProgressPercent = (completados.length / total) * 100

  const tabProps = {
    subtema,
    completado,
    onMarcarCompletado: () =>
      setCompletados(prev =>
        prev.includes(subtema.slug)
          ? prev.filter(s => s !== subtema.slug)
          : [...prev, subtema.slug],
      ),
  }

  return (
    <main className="mx-auto flex max-w-7xl items-start gap-6 p-6">
      <Sidebar
        gradoSlug={curso.gradoSlug}
        gradoNombre={curso.gradoNombre}
        temaNombre={temaNombre}
        temario={temario}
        slugActual={subtema.slug}
        completados={completados}
      />

      <div className="min-w-0 flex-1 space-y-4">
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
          <div className={tabActivo === 'leccion' ? '' : 'hidden'}>
            <LeccionTab {...tabProps} />
          </div>
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
        courseProgressPercent={courseProgressPercent}
        completedCount={completados.length}
        totalCount={total}
      />
    </main>
  )
}
