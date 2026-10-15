'use client'

import { useRef, useState, useTransition } from 'react'
import { Clapperboard, ImagePlus, Loader2, Trash2, Video } from 'lucide-react'
import {
  imagenVacia,
  medioAGuardar,
  poleaVacia,
  videoMedioVacio,
  type MedioBorrador,
  type PoleaBorrador,
} from '@/lib/borrador'
import { MedioSchema } from '@/lib/schemas'
import { idDeYouTube } from '@/lib/video'
import { subirImagen } from '@/app/admin/acciones-medios'
import { AnimacionPolea } from '../AnimacionPolea'
import { Campo, Casilla, Texto } from './campos'

/**
 * Imágenes, videos y animaciones que acompañan a un texto.
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

  const reemplazar = (i: number, nuevo: MedioBorrador) =>
    onChange(medios.map((m, k) => (k === i ? nuevo : m)))

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
                  {m.tipo === 'video' ? (
                    <Video size={22} className="text-slate-400" />
                  ) : (
                    <Clapperboard size={22} className="text-slate-400" />
                  )}
                </span>
              )}

              <div className="min-w-0 flex-1 space-y-2">
                {m.tipo === 'imagen' && (
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
                )}
                {m.tipo === 'video' && (
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
                {m.tipo === 'polea-mesa' && (
                  <EditorPolea medio={m} onChange={nuevo => reemplazar(i, nuevo)} />
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

        <button
          type="button"
          onClick={() => onChange([...medios, poleaVacia()])}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Clapperboard size={15} /> Agregar animación
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

type CampoNumerico = 'm1' | 'm2' | 'muEstatico' | 'muCinetico' | 'gravedad'

/**
 * Los datos de la animación y, debajo, la animación misma.
 *
 * Los errores salen del mismo schema que valida al guardar: no hay una segunda
 * copia de las reglas que se pueda desincronizar. Y la vista previa es el
 * mismo componente que ve el alumno, así que lo que se ve acá es lo que se
 * publica.
 */
function EditorPolea({
  medio,
  onChange,
}: {
  medio: PoleaBorrador
  onChange: (nuevo: PoleaBorrador) => void
}) {
  const r = MedioSchema.safeParse(medioAGuardar(medio))
  const error = (campo: CampoNumerico) =>
    r.success ? undefined : r.error.issues.find(i => i.path[0] === campo)?.message

  const numero = (campo: CampoNumerico, label: string, placeholder?: string) => (
    <Campo label={label} error={error(campo)}>
      <Texto
        value={medio[campo]}
        onChange={v => onChange({ ...medio, [campo]: v })}
        placeholder={placeholder}
      />
    </Campo>
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {numero('m1', 'm₁ (kg)', '50')}
        {numero('m2', 'm₂ (kg)', '20')}
        {numero('muEstatico', 'μe', 'opcional')}
        {numero('muCinetico', 'μc', 'opcional')}
        {numero('gravedad', 'g (m/s²)')}
      </div>
      <p className="text-xs text-slate-500">
        Los μ son opcionales: si cargás uno solo, vale para los dos. Coma o punto, da igual.
      </p>
      <Casilla
        label="Mostrar valores (a y T)"
        checked={medio.mostrarValores}
        onChange={v => onChange({ ...medio, mostrarValores: v })}
      />
      <p className="text-xs text-slate-500">
        Prendelo solo en la explicación: en el enunciado le da la respuesta al alumno.
      </p>

      {r.success && r.data.tipo === 'polea-mesa' ? (
        <AnimacionPolea {...r.data} />
      ) : (
        <p className="rounded-md bg-white px-3 py-6 text-center text-sm text-slate-500">
          Completá los datos para ver la animación.
        </p>
      )}
    </div>
  )
}
