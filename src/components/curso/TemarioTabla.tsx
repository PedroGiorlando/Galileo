'use client'

import Link from 'next/link'
import { Check, Clock, Lock } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { TemaConSubtemas } from '@/lib/contenido'

/**
 * La tabla es Client Component solo porque la columna de progreso sale de
 * localStorage. Todo el texto —títulos, descripciones, duraciones— igual se
 * renderiza en el servidor y viaja en el HTML, que es lo que indexa Google.
 *
 * Cada unidad lleva `id` para que la barra lateral pueda anclar sin JavaScript.
 */
export function TemarioTabla({
  cursoSlug,
  temario,
}: {
  cursoSlug: string
  temario: TemaConSubtemas[]
}) {
  const [completados] = useLocalStorage<string[]>(`galileo:completados:${cursoSlug}`, [])

  return (
    <div className="min-w-0 flex-1 space-y-8">
      {temario.map(unidad => (
        <section key={unidad.id} id={unidad.slug} className="scroll-mt-4">
          <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-slate-200 pb-2">
            <h2 className="text-xl font-bold text-slate-900">{unidad.nombre}</h2>
            <span className="shrink-0 text-sm text-orange-600">
              {unidad.subtemas.length} {unidad.subtemas.length === 1 ? 'clase' : 'clases'}
            </span>
          </div>

          {/* La tabla desborda en horizontal en pantallas chicas en vez de
              apretar las columnas hasta que no se lean. */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full min-w-[42rem] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                  <th className="px-4 py-2 font-medium">Clase</th>
                  <th className="px-4 py-2 font-medium">Contenido</th>
                  <th className="px-4 py-2 font-medium whitespace-nowrap">Duración</th>
                  <th className="px-4 py-2 font-medium">Progreso</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {unidad.subtemas.map(s => {
                  const completo = completados.includes(s.slug)
                  return (
                    <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              completo
                                ? 'bg-green-500 text-white'
                                : s.tieneContenido
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {completo ? <Check size={14} /> : s.orden}
                          </span>
                          <span className="font-medium text-slate-800">{s.titulo}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {s.descripcion ?? <span className="text-slate-300">—</span>}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {s.duracionLabel ? (
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            {s.duracionLabel}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: completo ? '100%' : '0%' }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{completo ? '100%' : '0%'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        {s.tieneContenido ? (
                          <Link
                            href={`/preuniversitario/${cursoSlug}/${s.slug}`}
                            className="inline-block rounded-md border border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50"
                          >
                            Ver clase
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-slate-100 px-2.5 py-1.5 text-xs text-slate-400">
                            <Lock size={11} /> Próximamente
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
