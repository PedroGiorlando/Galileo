'use client'

import { useState } from 'react'
import { AlertCircle, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { SubtemaForm } from './SubtemaForm'
import { guardarClase } from '@/app/admin/acciones'
import type { ContenidoBorrador } from '@/lib/borrador'
import type { TemaMeta } from '@/lib/schemas'

export function EditorSubtema({
  materiaId,
  materiaSlug,
  rutaClase,
  metaInicial,
  contenidoInicial,
  desdeLaBase,
}: {
  materiaId: number
  /** Para armar la carpeta donde se guardan las imágenes que se suban. */
  materiaSlug: string
  rutaClase: string
  metaInicial: TemaMeta
  contenidoInicial: ContenidoBorrador
  desdeLaBase: boolean
}) {
  const [estado, setEstado] = useState<{ ok: boolean; mensaje: string; slug?: string } | null>(null)

  return (
    <div className="space-y-5">
      {!desdeLaBase && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Esta clase todavía no tiene contenido guardado. Completá el formulario y guardá.
        </p>
      )}

      {estado && (
        <div
          role="alert"
          className={`flex items-start gap-2 rounded-lg border p-4 text-sm ${
            estado.ok
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {estado.ok ? (
            <Check size={16} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
          )}
          <div className="space-y-1">
            <p className="font-semibold">{estado.mensaje}</p>
            {estado.ok && estado.slug && (
              <Link
                href={`${rutaClase}/${estado.slug}`}
                className="inline-flex items-center gap-1 font-medium underline"
              >
                Ver la clase publicada <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>
      )}

      <SubtemaForm
        materiaSlug={materiaSlug}
        metaInicial={metaInicial}
        contenidoInicial={contenidoInicial}
        onGuardar={async (meta, contenido) => {
          const r = await guardarClase(materiaId, meta, contenido)
          setEstado(
            r.ok
              ? { ok: true, mensaje: 'Clase guardada.', slug: meta.slug }
              : { ok: false, mensaje: r.error },
          )
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    </div>
  )
}
