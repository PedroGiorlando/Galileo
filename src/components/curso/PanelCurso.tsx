'use client'

import { useProgreso } from '@/hooks/useProgreso'
import type { Paleta } from '@/lib/colores'

/**
 * Resumen de avance, como banda horizontal debajo del encabezado.
 *
 * Antes era una columna a la derecha. Con barra lateral a la izquierda y panel
 * a la derecha, la columna del medio quedaba tan angosta que el temario no
 * entraba y aparecía la barra de desplazamiento horizontal. Sacar una de las
 * dos columnas es lo que resuelve el problema de raíz; ponerlo acá arriba
 * además lo hace lo primero que se ve al entrar.
 */
export function PanelCurso({
  cursoSlug,
  totalClases,
  paleta,
}: {
  cursoSlug: string
  totalClases: number
  paleta: Paleta
}) {
  const { completados, hayUsuario } = useProgreso(cursoSlug)
  const hechas = completados.length
  const porcentaje = totalClases > 0 ? Math.round((hechas / totalClases) * 100) : 0

  return (
    <div className="rounded-2xl border border-linea bg-white/80 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="font-display text-sm font-semibold text-tinta">Tu avance</p>
        <p className="font-mono text-sm text-tinta-suave">
          <span className="text-xl font-medium text-tinta">{hechas}</span>
          <span className="mx-1">/</span>
          {totalClases} clases
          <span className={`ml-3 font-medium ${paleta.texto}`}>{porcentaje}%</span>
        </p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-linea">
        <div
          className={`h-full rounded-full transition-all duration-700 ${paleta.barra}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      {hechas === 0 ? (
        <p className="mt-2 text-xs text-tinta-suave">
          Empezá por la primera clase de la primera unidad.
        </p>
      ) : (
        !hayUsuario && (
          <p className="mt-2 text-xs text-tinta-suave">
            Este avance vive solo en este navegador.{' '}
            <a href="/registrarse" className="font-medium text-galileo hover:underline">
              Creá una cuenta
            </a>{' '}
            para no perderlo.
          </p>
        )
      )}
    </div>
  )
}
