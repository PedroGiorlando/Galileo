'use client'

import { PlayCircle } from 'lucide-react'
import type { SubtemaCompleto } from '../../data/topicData'
import { comoMinutos } from '@/lib/video'

/**
 * Los ejemplos se muestran todos, uno debajo del otro, y no de a uno con
 * botones. Tres razones: se pueden comparar entre sí, se puede volver a mirar
 * el anterior mientras se lee el siguiente, y todo el texto queda en el HTML
 * en vez de aparecer recién al hacer click.
 */
export function EjemplosTab({
  subtema,
  onIrAlVideo,
}: {
  subtema: SubtemaCompleto
  onIrAlVideo?: (videoId: number, segundo: number) => void
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Mirá cómo se resuelve cada situación paso a paso antes de pasar a los ejercicios.
      </p>

      {subtema.ejemplos.map((ejemplo, i) => (
        <article
          key={ejemplo.id}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
              {i + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase text-green-600">Ejemplo {i + 1}</p>
              <h2 className="mt-0.5 text-lg font-bold text-slate-900">{ejemplo.enunciado}</h2>

              {ejemplo.video && onIrAlVideo && (
                <button
                  type="button"
                  onClick={() => onIrAlVideo(ejemplo.video!.videoId, ejemplo.video!.segundo)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-galileo/10 px-3 py-1 text-xs font-medium text-galileo hover:bg-galileo/20"
                >
                  <PlayCircle size={13} />
                  Verlo explicado en el video, minuto {comoMinutos(ejemplo.video.segundo)}
                </button>
              )}

              <p className="mt-4 mb-2 text-sm font-semibold text-slate-500">Solución:</p>
              <ol className="space-y-2">
                {ejemplo.pasos.map((paso, j) => {
                  const esUltimo = j === ejemplo.pasos.length - 1
                  return (
                    <li
                      key={j}
                      // El último paso es el resultado: se destaca para que no
                      // se pierda entre los pasos intermedios.
                      className={`flex gap-3 rounded-md p-3 text-sm leading-relaxed ${
                        esUltimo
                          ? 'border border-green-200 bg-green-50 font-medium text-green-900'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`shrink-0 font-bold ${
                          esUltimo ? 'text-green-600' : 'text-slate-400'
                        }`}
                      >
                        {j + 1}.
                      </span>
                      <span className="whitespace-pre-wrap">{paso}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
