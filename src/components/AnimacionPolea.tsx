'use client'

import { useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import type { MedioPolea } from '@/lib/schemas'
import { describirPolea, formatearDato, resolverPolea, textoValores } from '@/lib/polea'

/*
 * Geometría del dibujo, en unidades del viewBox (480 × 320). Replica la imagen
 * de referencia: mesa a la derecha, polea en la esquina, bola colgando a la
 * izquierda.
 */
const POLEA = { x: 150, y: 80, r: 14 }
const CAJA = { x: 300, y: 40, ancho: 72, alto: 56 }
const BOLA = { x: POLEA.x - POLEA.r, y: 170, r: 18 }
const MESA = { x: 168, y: 96 }

/**
 * Cuánto se corren la caja (a la izquierda) y la bola (hacia abajo). La caja
 * termina a 20 unidades de la polea y la bola dentro del dibujo.
 */
const RECORRIDO = 116

const CUERDA_HORIZONTAL = CAJA.x - POLEA.x
const CUERDA_VERTICAL = BOLA.y - BOLA.r - POLEA.y

/** La cuerda no patina: la polea gira lo que avanza la cuerda (θ = s / r). */
const GIRO_GRADOS = (RECORRIDO / POLEA.r) * (180 / Math.PI)

/** Adónde llega cada pieza. La curva y la duración son las mismas para todas. */
const hasta = (transformacion: string, origen = 'center') =>
  ({ '--hasta': transformacion, transformOrigin: origen }) as React.CSSProperties

/**
 * Caja sobre una mesa, unida por una polea a una bola que cuelga. Al apretar
 * Reproducir, la bola cae y arrastra la caja con la aceleración real.
 *
 * El movimiento lo hace una animación CSS (ver `.polea-anda` en globals.css):
 * acá solo se elige la duración y adónde llega cada pieza.
 */
export function AnimacionPolea(datos: MedioPolea) {
  const r = resolverPolea(datos)
  const [anda, setAnda] = useState(false)

  return (
    <figure className="overflow-hidden rounded-xl border border-linea bg-white">
      <svg
        viewBox="0 0 480 320"
        role="img"
        aria-label={describirPolea(datos)}
        className={`max-h-[28rem] w-full ${anda && r.seMueve ? 'polea-anda' : ''}`}
        style={{ '--duracion': `${r.duracion}s` } as React.CSSProperties}
      >
        {/* Mesa: tablero y pata */}
        <rect x={MESA.x} y={MESA.y} width={480 - MESA.x} height={8} className="fill-slate-200 stroke-slate-500" />
        <rect x={MESA.x} y={MESA.y + 8} width={8} height={320 - MESA.y - 8} className="fill-slate-200 stroke-slate-500" />

        {/* Soporte de la polea, del eje a la esquina de la mesa */}
        <line x1={POLEA.x} y1={POLEA.y} x2={MESA.x + 2} y2={MESA.y + 2} strokeWidth={5} className="stroke-slate-500" />

        {/* Cuerdas. Van antes que la polea para que ella tape dónde empiezan. */}
        <rect
          x={POLEA.x}
          y={POLEA.y - POLEA.r - 1}
          width={CUERDA_HORIZONTAL}
          height={2}
          className="polea-pieza fill-amber-700"
          style={hasta(`scaleX(${(CUERDA_HORIZONTAL - RECORRIDO) / CUERDA_HORIZONTAL})`, 'left center')}
        />
        <rect
          x={BOLA.x - 1}
          y={POLEA.y}
          width={2}
          height={CUERDA_VERTICAL}
          className="polea-pieza fill-amber-700"
          style={hasta(`scaleY(${(CUERDA_VERTICAL + RECORRIDO) / CUERDA_VERTICAL})`, 'center top')}
        />

        {/* Polea, con rayos para que se note el giro */}
        <g className="polea-pieza" style={hasta(`rotate(${-GIRO_GRADOS}deg)`)}>
          <circle cx={POLEA.x} cy={POLEA.y} r={POLEA.r} strokeWidth={2} className="fill-slate-300 stroke-slate-600" />
          <line x1={POLEA.x - POLEA.r} y1={POLEA.y} x2={POLEA.x + POLEA.r} y2={POLEA.y} strokeWidth={1.5} className="stroke-slate-600" />
          <line x1={POLEA.x} y1={POLEA.y - POLEA.r} x2={POLEA.x} y2={POLEA.y + POLEA.r} strokeWidth={1.5} className="stroke-slate-600" />
          <circle cx={POLEA.x} cy={POLEA.y} r={3} className="fill-slate-600" />
        </g>

        {/* Caja, con su etiqueta: se mueven juntas */}
        <g className="polea-pieza" style={hasta(`translateX(-${RECORRIDO}px)`)}>
          <rect x={CAJA.x} y={CAJA.y} width={CAJA.ancho} height={CAJA.alto} rx={2} strokeWidth={1.5} className="fill-sky-400 stroke-sky-700" />
          <Etiqueta x={CAJA.x + CAJA.ancho / 2} y={CAJA.y - 10} indice="1" kg={datos.m1} ancla="middle" />
        </g>

        {/* Bola, con su etiqueta */}
        <g className="polea-pieza" style={hasta(`translateY(${RECORRIDO}px)`)}>
          <circle cx={BOLA.x} cy={BOLA.y} r={BOLA.r} strokeWidth={1.5} className="fill-green-500 stroke-green-700" />
          <Etiqueta x={BOLA.x - BOLA.r - 8} y={BOLA.y + 5} indice="2" kg={datos.m2} ancla="end" />
        </g>
      </svg>

      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-linea px-2 py-1">
        <button
          type="button"
          onClick={() => setAnda(!anda)}
          className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-tinta hover:bg-slate-50"
        >
          {anda ? <RotateCcw size={16} /> : <Play size={16} />}
          {anda ? 'Reiniciar' : 'Reproducir'}
        </button>
        {datos.mostrarValores && <span className="text-sm text-tinta-suave">{textoValores(r)}</span>}
        <p aria-live="polite" className="text-sm font-medium text-tinta">
          {anda && !r.seMueve ? 'El sistema queda en reposo' : ''}
        </p>
      </figcaption>
    </figure>
  )
}

/** "m₁ = 50 kg", con el subíndice armado a mano: no toda fuente tiene ₁ y ₂. */
function Etiqueta({
  x,
  y,
  indice,
  kg,
  ancla,
}: {
  x: number
  y: number
  indice: string
  kg: number
  ancla: 'middle' | 'end'
}) {
  return (
    <text x={x} y={y} textAnchor={ancla} fontSize={15} className="fill-tinta">
      <tspan fontStyle="italic">m</tspan>
      <tspan dy={4} fontSize={10}>
        {indice}
      </tspan>
      <tspan dy={-4}> = {formatearDato(kg)} kg</tspan>
    </text>
  )
}
