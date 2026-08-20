/**
 * Color por materia y por unidad.
 *
 * Con 39 clases en pantalla, el color es lo que separa una unidad de otra sin
 * que haya que leer los títulos. No es decoración: es la diferencia entre un
 * listado que se recorre y uno que se abandona.
 *
 * Las clases de Tailwind están escritas completas a propósito. Tailwind lee el
 * código fuente para saber qué CSS generar, así que un `bg-${color}-100` armado
 * en tiempo de ejecución no existiría en la hoja de estilos final.
 */

export interface Paleta {
  /** Fondo suave, para tarjetas y cajas. */
  fondo: string
  /** Fondo saturado, para insignias y números. */
  solido: string
  /** Texto sobre fondo suave. */
  texto: string
  /** Borde en reposo y al pasar el mouse. */
  borde: string
  bordeActivo: string
  /** Barra de acento a la izquierda de una sección. */
  barra: string
}

const PALETAS: Record<string, Paleta> = {
  violeta: {
    fondo: 'bg-violet-50',
    solido: 'bg-violet-600',
    texto: 'text-violet-700',
    borde: 'border-violet-200',
    bordeActivo: 'hover:border-violet-400',
    barra: 'bg-violet-500',
  },
  cian: {
    fondo: 'bg-cyan-50',
    solido: 'bg-cyan-600',
    texto: 'text-cyan-700',
    borde: 'border-cyan-200',
    bordeActivo: 'hover:border-cyan-400',
    barra: 'bg-cyan-500',
  },
  ambar: {
    fondo: 'bg-amber-50',
    solido: 'bg-amber-500',
    texto: 'text-amber-700',
    borde: 'border-amber-200',
    bordeActivo: 'hover:border-amber-400',
    barra: 'bg-amber-500',
  },
  rosa: {
    fondo: 'bg-rose-50',
    solido: 'bg-rose-500',
    texto: 'text-rose-700',
    borde: 'border-rose-200',
    bordeActivo: 'hover:border-rose-400',
    barra: 'bg-rose-500',
  },
  esmeralda: {
    fondo: 'bg-emerald-50',
    solido: 'bg-emerald-600',
    texto: 'text-emerald-700',
    borde: 'border-emerald-200',
    bordeActivo: 'hover:border-emerald-400',
    barra: 'bg-emerald-500',
  },
  indigo: {
    fondo: 'bg-indigo-50',
    solido: 'bg-indigo-600',
    texto: 'text-indigo-700',
    borde: 'border-indigo-200',
    bordeActivo: 'hover:border-indigo-400',
    barra: 'bg-indigo-500',
  },
  naranja: {
    fondo: 'bg-orange-50',
    solido: 'bg-orange-500',
    texto: 'text-orange-700',
    borde: 'border-orange-200',
    bordeActivo: 'hover:border-orange-400',
    barra: 'bg-orange-500',
  },
}

/** Cada materia tiene su color fijo, como las carpetas de cada asignatura. */
const POR_MATERIA: Record<string, keyof typeof PALETAS> = {
  fisica: 'violeta',
  quimica: 'cian',
  matematica: 'ambar',
}

export function paletaDeMateria(slug: string): Paleta {
  return PALETAS[POR_MATERIA[slug] ?? 'esmeralda']
}

// El orden del ciclo arranca en el color de la materia y sigue por el resto,
// así la primera unidad se siente parte de su materia y las siguientes se
// distinguen entre sí.
const CICLO: (keyof typeof PALETAS)[] = [
  'violeta',
  'cian',
  'ambar',
  'esmeralda',
  'rosa',
  'indigo',
  'naranja',
]

/** Color de una unidad según su posición dentro de la materia. */
export function paletaDeUnidad(materiaSlug: string, orden: number): Paleta {
  const inicio = CICLO.indexOf(POR_MATERIA[materiaSlug] ?? 'esmeralda')
  const i = (Math.max(0, inicio) + Math.max(0, orden - 1)) % CICLO.length
  return PALETAS[CICLO[i]]
}
