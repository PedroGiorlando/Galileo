'use client'

import Link from 'next/link'
import { ArrowRight, Check, Clock, Lock } from 'lucide-react'
import { useProgreso } from '@/hooks/useProgreso'
import { paletaDeUnidad } from '@/lib/colores'
import type { TemaConSubtemas } from '@/lib/contenido'

/**
 * El temario, como una línea de tiempo por unidad.
 *
 * Antes era una tabla con ancho mínimo fijo, que obligaba a deslizar en
 * horizontal en cualquier pantalla que no fuera enorme. Una tabla necesita que
 * todas las columnas entren a la vez; una lista se acomoda sola, y en un
 * teléfono —que es donde estos alumnos estudian— se lee mucho mejor.
 *
 * El conector vertical entre clases no es adorno: muestra que las clases de una
 * unidad tienen un orden, y se va llenando de verde a medida que se completan.
 *
 * Es Client Component solo por el progreso, que se resuelve en el navegador
 * para que esta página siga siendo estática. Todo el texto igual se renderiza
 * en el servidor y viaja en el HTML.
 */
export function TemarioTabla({
  cursoSlug,
  cursoId,
  temario,
}: {
  cursoSlug: string
  cursoId: number
  temario: TemaConSubtemas[]
}) {
  const { completados } = useProgreso(cursoSlug, cursoId)

  return (
    <div className="min-w-0 flex-1 space-y-10">
      {temario.map(unidad => {
        const paleta = paletaDeUnidad(cursoSlug, unidad.orden)
        const hechas = unidad.subtemas.filter(s => completados.includes(s.slug)).length
        const avance = unidad.subtemas.length ? (hechas / unidad.subtemas.length) * 100 : 0

        return (
          <section key={unidad.id} id={unidad.slug} className="scroll-mt-6">
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-medium text-white ${paleta.solido}`}
              >
                {unidad.orden}
              </span>
              <h2 className="font-display text-xl font-bold text-tinta">
                {unidad.nombre}
              </h2>
              <span className="font-mono text-xs text-tinta-suave">
                {hechas}/{unidad.subtemas.length}
              </span>

              <div className="h-1.5 w-full max-w-32 overflow-hidden rounded-full bg-linea">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${paleta.barra}`}
                  style={{ width: `${avance}%` }}
                />
              </div>
            </div>

            <ol className="space-y-1.5">
              {unidad.subtemas.map((clase, i) => {
                const completa = completados.includes(clase.slug)
                const esUltima = i === unidad.subtemas.length - 1

                const contenido = (
                  <>
                    <span
                      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium ring-4 ring-papel ${
                        completa
                          ? 'bg-galileo text-white'
                          : clase.tieneContenido
                            ? `${paleta.solido} text-white`
                            : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {completa ? <Check size={16} /> : clase.orden}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-tinta">{clase.titulo}</span>
                      {clase.descripcion && (
                        <span className="mt-0.5 block text-sm text-tinta-suave">
                          {clase.descripcion}
                        </span>
                      )}
                      {clase.duracionLabel && (
                        <span className="mt-1 flex items-center gap-1 font-mono text-xs text-tinta-suave">
                          <Clock size={12} />
                          {clase.duracionLabel}
                        </span>
                      )}
                    </span>
                  </>
                )

                // Conector hacia la clase siguiente. El color va como estilo en
                // línea y no como clase: es un valor derivado del estado, y con
                // clases de Tailwind este elemento resolvía al color equivocado
                // sin que la regla generada ni la variable lo expliquen. Un
                // estilo en línea no deja lugar a dudas.
                const conector = !esUltima && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[1.83rem] top-9 bottom-[-0.375rem] w-0.5"
                    style={{
                      backgroundColor: completa
                        ? 'var(--color-galileo)'
                        : 'var(--color-linea)',
                    }}
                  />
                )

                if (!clase.tieneContenido) {
                  return (
                    <li
                      key={clase.id}
                      className="relative flex items-start gap-3 rounded-xl px-3 py-3 opacity-60"
                    >
                      {conector}
                      {contenido}
                      <span className="mt-1 flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                        <Lock size={11} /> Pronto
                      </span>
                    </li>
                  )
                }

                return (
                  <li key={clase.id} className="relative">
                    {conector}
                    <Link
                      href={`/preuniversitario/${cursoSlug}/${clase.slug}`}
                      className={`group flex items-start gap-3 rounded-xl border border-transparent bg-white/70 px-3 py-3 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm ${paleta.bordeActivo}`}
                    >
                      {contenido}
                      <span
                        className={`mt-1 flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${paleta.fondo} ${paleta.texto}`}
                      >
                        {completa ? 'Repasar' : 'Empezar'}
                        <ArrowRight
                          size={13}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
