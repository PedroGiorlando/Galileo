import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { TemaConSubtemas } from '@/lib/contenido'

/**
 * Anterior y siguiente dentro de la materia completa, no de la unidad: al
 * terminar la última clase de Vectores lo que sigue es la primera de
 * Cinemática, no un callejón sin salida.
 */
export function NavegacionClases({
  cursoSlug,
  temario,
  slugActual,
}: {
  cursoSlug: string
  temario: TemaConSubtemas[]
  slugActual: string
}) {
  const todas = temario.flatMap(t => t.subtemas.map(s => ({ ...s, unidad: t.nombre })))
  const i = todas.findIndex(s => s.slug === slugActual)
  if (i < 0) return null

  const anterior = todas[i - 1]
  const siguiente = todas[i + 1]
  if (!anterior && !siguiente) return null

  return (
    <nav
      aria-label="Clase anterior y siguiente"
      className="mx-auto flex max-w-7xl flex-wrap gap-3 px-6 pb-8"
    >
      {anterior ? (
        <Link
          href={`/preuniversitario/${cursoSlug}/${anterior.slug}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-green-400 hover:bg-green-50"
        >
          <ArrowLeft size={18} className="shrink-0 text-slate-400" />
          <span className="min-w-0">
            <span className="block text-xs text-slate-500">Clase anterior</span>
            <span className="block truncate font-medium text-slate-800">{anterior.titulo}</span>
          </span>
        </Link>
      ) : (
        // Hueco invisible para que "siguiente" quede a la derecha en la primera
        // clase, sin recurrir a otra clase de posicionamiento.
        <span className="flex-1" aria-hidden="true" />
      )}

      {siguiente && (
        <Link
          href={`/preuniversitario/${cursoSlug}/${siguiente.slug}`}
          className="flex min-w-0 flex-1 items-center justify-end gap-3 rounded-lg border border-slate-200 bg-white p-4 text-right hover:border-green-400 hover:bg-green-50"
        >
          <span className="min-w-0">
            <span className="block text-xs text-slate-500">Siguiente clase</span>
            <span className="block truncate font-medium text-slate-800">{siguiente.titulo}</span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-slate-400" />
        </Link>
      )}
    </nav>
  )
}
