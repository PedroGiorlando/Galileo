'use client'

import { useState } from 'react'
import { CheckCircle2, PlayCircle } from 'lucide-react'
import type { SubtemaPublico } from '@/lib/publico'
import { urlDeVideo } from '@/lib/video'

/**
 * Los videos de la clase.
 *
 * Solo se renderiza cuando hay al menos uno: SubtemaVista ni muestra la solapa
 * si la lista está vacía, así que acá no hay caso "sin video".
 *
 * Se carga un solo reproductor, el del video elegido. Poner N iframes de
 * YouTube en la misma página descargaría N reproductores para mirar uno.
 */
export function LeccionTab({ subtema }: { subtema: SubtemaPublico }) {
  const [actual, setActual] = useState(0)
  const video = subtema.videos[actual]

  return (
    <div className="space-y-4">
      {video ? (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
          <iframe
            // La `key` fuerza a React a crear un iframe nuevo al cambiar de
            // video en vez de reusar el anterior: sin esto el reproductor
            // puede quedarse mostrando el video viejo.
            key={video.youtubeId}
            src={urlDeVideo(video.youtubeId)}
            title={video.titulo}
            loading="lazy"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-linea p-8 text-center text-sm text-tinta-suave">
          Todavía no hay videos cargados en esta clase.
        </p>
      )}

      {video && (
        <div>
          <h2 className="font-display text-lg font-bold text-tinta">{video.titulo}</h2>
          {video.subtitulo && <p className="text-sm text-tinta-suave">{video.subtitulo}</p>}
        </div>
      )}

      {subtema.videos.length > 1 && (
        <ol className="space-y-1.5">
          {subtema.videos.map((v, i) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setActual(i)}
                aria-current={i === actual ? 'true' : undefined}
                className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  i === actual
                    ? 'border-galileo bg-galileo/5'
                    : 'border-linea hover:bg-slate-50'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
                    i === actual ? 'bg-galileo text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i === actual ? <PlayCircle size={14} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-tinta">{v.titulo}</span>
                  {v.subtitulo && (
                    <span className="block text-xs text-tinta-suave">{v.subtitulo}</span>
                  )}
                </span>
                {v.duracionLabel && (
                  <span className="shrink-0 font-mono text-xs text-tinta-suave">
                    {v.duracionLabel}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="mb-2 text-sm font-semibold text-green-800">En esta clase vas a aprender:</p>
        <ul className="space-y-1.5 text-sm text-green-900">
          {subtema.objetivos.map((obj, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-600" />
              {obj}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
