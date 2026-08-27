'use client'

import { useRef, useState, useTransition } from 'react'
import { ImagePlus, Loader2, Trash2, Video } from 'lucide-react'
import { imagenVacia, videoMedioVacio, type MedioBorrador } from '@/lib/borrador'
import { idDeYouTube } from '@/lib/video'
import { subirImagen } from '@/app/admin/acciones-medios'
import { Campo, Texto } from './campos'

/**
 * Imágenes y videos que acompañan a un texto.
 *
 * Se usa en cuatro lugares —teoría, enunciado del ejercicio, pregunta de la
 * evaluación y devolución— y en todos hace lo mismo, así que es un componente
 * y no cuatro formularios parecidos.
 *
 * La imagen se sube apenas se elige el archivo, antes de guardar la clase. Es a
 * propósito: subir al guardar significaría que un error de red a los cuarenta
 * minutos de trabajo se lleva puesto todo. Así, cuando aparece la miniatura, el
 * archivo ya está a salvo.
 *
 * ponytail: se usa <img> y no next/image. Es el panel, lo ve una persona, y
 * next/image pediría configurar el dominio de Supabase para optimizar lo que
 * nadie va a mirar dos veces.
 */
export function EditorMedios({
  medios,
  onChange,
  materiaSlug,
  claseSlug,
  etiqueta,
  ayuda,
}: {
  medios: MedioBorrador[]
  onChange: (medios: MedioBorrador[]) => void
  materiaSlug: string
  claseSlug: string
  etiqueta: string
  ayuda?: string
}) {
  const archivoRef = useRef<HTMLInputElement>(null)
  const [subiendo, empezar] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const cambiar = (i: number, cambio: Partial<MedioBorrador>) =>
    onChange(medios.map((m, k) => (k === i ? ({ ...m, ...cambio } as MedioBorrador) : m)))

  const quitar = (i: number) => onChange(medios.filter((_, k) => k !== i))

  function elegirArchivo(archivo: File | undefined) {
    if (!archivo) return
    setError(null)

    empezar(async () => {
      const datos = new FormData()
      datos.set('archivo', archivo)
      datos.set('materia', materiaSlug)
      datos.set('clase', claseSlug)

      const r = await subirImagen(datos)
      if (r.ok) onChange([...medios, imagenVacia(r.url)])
      else setError(r.error)
    })

    // Se limpia para que elegir el MISMO archivo otra vez vuelva a disparar el
    // evento. Sin esto, un reintento después de un error no hace nada.
    if (archivoRef.current) archivoRef.current.value = ''
  }

  return (
    <fieldset className="rounded-lg border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium text-slate-700">{etiqueta}</legend>
      {ayuda && <p className="mb-2 text-xs text-slate-500">{ayuda}</p>}

      {medios.length > 0 && (
        <ul className="mb-3 space-y-3">
          {medios.map((m, i) => (
            <li key={i} className="flex gap-3 rounded-lg bg-slate-50 p-2">
              {m.tipo === 'imagen' ? (
                <img
                  src={m.url}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-md border border-slate-200 bg-white object-contain"
                />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white">
                  <Video size={22} className="text-slate-400" />
                </span>
              )}

              <div className="min-w-0 flex-1 space-y-2">
                {m.tipo === 'imagen' ? (
                  <Campo
                    label="Qué se ve en la imagen"
                    ayuda="Obligatorio. Lo lee en voz alta el lector de pantalla de un alumno que no ve el dibujo."
                    error={m.alt.trim() ? undefined : 'Falta describir la imagen'}
                  >
                    <Texto
                      value={m.alt}
                      onChange={v => cambiar(i, { alt: v })}
                      placeholder="Bloque sobre un plano inclinado con tres fuerzas marcadas"
                    />
                  </Campo>
                ) : (
                  <Campo
                    label="Enlace de YouTube"
                    error={
                      m.enlace.trim() && !idDeYouTube(m.enlace)
                        ? 'No se reconoce como un enlace de YouTube.'
                        : undefined
                    }
                  >
                    <Texto
                      value={m.enlace}
                      onChange={v => cambiar(i, { enlace: v })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </Campo>
                )}
              </div>

              <button
                type="button"
                onClick={() => quitar(i)}
                aria-label="Quitar"
                className="flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={archivoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => elegirArchivo(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={subiendo}
          onClick={() => archivoRef.current?.click()}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {subiendo ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {subiendo ? 'Subiendo…' : 'Subir imagen'}
        </button>

        <button
          type="button"
          onClick={() => onChange([...medios, videoMedioVacio()])}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Video size={15} /> Agregar video
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  )
}
