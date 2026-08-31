'use client'

import { useState } from 'react'
import { PlayCircle, FileText, PencilLine, ClipboardCheck, MapPin } from 'lucide-react'
import type { SubtemaPublico } from '@/lib/publico'
import type { Materia, ModuloConClases } from '@/lib/contenido'
import { useProgreso } from '@/hooks/useProgreso'
import { paletaDeMateria } from '@/lib/colores'
import { Sidebar } from './Sidebar'
import { TemarioMovil } from './TemarioMovil'
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
  subtemaId,
  materia,
  moduloNombre,
  temario,
}: {
  subtema: SubtemaPublico
  subtemaId: number
  materia: Materia
  moduloNombre: string
  temario: ModuloConClases[]
}) {
  // La solapa Lección solo existe si hay al menos un video. Sin esto, una clase
  // sin video abría en un reproductor vacío.
  const hayVideo = subtema.videos.length > 0

  const TABS = [
    ...(hayVideo ? [{ id: 'leccion' as const, label: 'Lección', icon: PlayCircle }] : []),
    { id: 'explicacion' as const, label: 'Explicación escrita', icon: FileText },
    { id: 'ejemplos' as const, label: 'Ejemplos resueltos', icon: PencilLine },
    { id: 'ejercicios' as const, label: 'Trabajos prácticos', icon: ClipboardCheck },
    { id: 'autoevaluacion' as const, label: 'Evaluaciones', icon: MapPin },
  ]

  const [tabActivo, setTabActivo] = useState<TabId>(hayVideo ? 'leccion' : 'explicacion')

  const { completados, alternar } = useProgreso(materia.slug, materia.id)
  const completado = completados.includes(subtema.slug)

  const total = temario.reduce((n, t) => n + t.clases.length, 0) || 1
  const paleta = paletaDeMateria(materia.slug)

  // Las dos solapas que corrigen necesitan la materia además de la clase: la
  // acción del servidor vuelve a leer el contenido para saber la respuesta, y
  // una clase se identifica por (materia, clase).
  const tabProps = { subtema, materiaSlug: materia.slug }

  return (
    // pb-28 en celular deja lugar para el botón flotante del temario, que si no
    // tapa el final del último bloque.
    <main className="mx-auto flex max-w-7xl flex-col items-start gap-6 p-4 pb-28 sm:p-6 lg:flex-row lg:pb-6">
      {/* El temario aparece de dos formas según el ancho, y nunca las dos a la
          vez. En escritorio, columna fija al costado. En celular, un botón
          flotante que abre un panel: apilado arriba del contenido obligaba a
          scrollear 700px de índice antes de llegar a la clase. */}
      <Sidebar
        materiaSlug={materia.slug}
        materiaNombre={materia.nombre}
        moduloNombre={moduloNombre}
        temario={temario}
        slugActual={subtema.slug}
        completados={completados}
        className="hidden w-72 shrink-0 lg:block"
      />

      <TemarioMovil
        materiaSlug={materia.slug}
        materiaNombre={materia.nombre}
        moduloNombre={moduloNombre}
        temario={temario}
        slugActual={subtema.slug}
        completados={completados}
      />

      <div className="min-w-0 flex-1 space-y-4">
        {/* Encabezado único de la clase. Antes cada solapa repetía su propio
            <h1>, así que la página tenía cinco (cuatro ocultos): Google espera
            uno solo y un lector de pantalla anunciaba cinco títulos distintos
            para la misma página. */}
        <header className={`rounded-2xl border border-linea p-5 sm:p-6 ${paleta.fondo}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-xs uppercase tracking-widest ${paleta.texto}`}>
                {moduloNombre}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-tinta sm:text-3xl">
                {subtema.titulo}
              </h1>
              {subtema.descripcion && (
                <p className="mt-2 max-w-2xl text-tinta-suave">{subtema.descripcion}</p>
              )}
            </div>
            <CompletarButton
              completado={completado}
              onClick={() => alternar(subtema.slug, subtemaId)}
            />
          </div>
        </header>

        <div
          role="tablist"
          className="flex flex-wrap gap-1 rounded-xl border border-linea bg-white p-1.5"
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tabActivo === tab.id}
              onClick={() => setTabActivo(tab.id)}
              className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                tabActivo === tab.id
                  ? `${paleta.solido} text-white shadow-sm`
                  : 'text-tinta-suave hover:bg-slate-50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-linea bg-white p-4 sm:p-6">
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
