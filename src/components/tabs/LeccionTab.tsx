import type { SubtemaCompleto } from '../../data/topicData'

/**
 * Solo se renderiza cuando la clase tiene `videoUrl`: SubtemaVista ni siquiera
 * muestra la solapa si no hay video. Por eso acá no hay caso "sin video".
 *
 * ponytail: se usa el reproductor nativo del navegador. Una librería de video
 * traería controles propios, analítica y peso; hasta que haga falta medir
 * cuánto se mira cada clase, <video> hace exactamente lo mismo con cero
 * dependencias.
 */
export function LeccionTab({ subtema }: { subtema: SubtemaCompleto }) {
  return (
    <div className="space-y-4">
      {subtema.videoUrl && (
        <video
          controls
          preload="metadata"
          className="w-full rounded-lg bg-slate-900"
          src={subtema.videoUrl}
        >
          Tu navegador no puede reproducir este video.
        </video>
      )}

    </div>
  )
}
