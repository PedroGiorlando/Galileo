import { MedioSchema, type Medio } from '@/lib/schemas'
import { urlDeVideo } from '@/lib/video'
import { AnimacionPolea } from './AnimacionPolea'

/**
 * Las imágenes, videos y animaciones que acompañan a un texto.
 *
 * Se usa en la teoría, en el enunciado de un ejercicio, en una pregunta de
 * evaluación y en las devoluciones. Siempre igual: si no hay nada, no ocupa
 * lugar ni deja un hueco.
 *
 * Las imágenes van con `loading="lazy"`: una clase de Física puede tener quince
 * diagramas repartidos en cinco solapas de las que se ve una sola, y bajarlos
 * todos al abrir la página castiga justo al alumno con peor conexión.
 */
export function Medios({ medios, className = '' }: { medios?: Medio[]; className?: string }) {
  if (!medios || medios.length === 0) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {medios.map((m, i) => {
        if (m.tipo === 'imagen') {
          return (
            <figure key={i}>
              <img
                src={m.url}
                alt={m.alt}
                loading="lazy"
                className="max-h-[28rem] w-full rounded-xl border border-linea bg-white object-contain"
              />
            </figure>
          )
        }
        if (m.tipo === 'video') {
          return (
            <div key={i} className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
              <iframe
                src={urlDeVideo(m.youtubeId, m.segundo)}
                title="Video explicativo"
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          )
        }
        // Una clase sin publicar se guarda sin validar, así que una animación
        // a medio cargar puede llegar acá sin masas. Se valida antes de
        // dibujar: la vista previa existe justamente para esas clases, y sin
        // esto se caía la página entera.
        const polea = MedioSchema.safeParse(m)
        if (polea.success && polea.data.tipo === 'polea-mesa') {
          return <AnimacionPolea key={i} {...polea.data} />
        }
        return (
          <p
            key={i}
            className="rounded-xl border border-dashed border-linea px-4 py-6 text-center text-sm text-tinta-suave"
          >
            Animación incompleta: faltan datos para dibujarla.
          </p>
        )
      })}
    </div>
  )
}
