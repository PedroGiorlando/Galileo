/**
 * Física de la escena "polea sobre mesa": una caja de masa m1 apoyada en una
 * mesa, unida por una cuerda que pasa por una polea a una bola de masa m2 que
 * cuelga. Cuerda y polea ideales: sin masa y sin rozamiento en el eje.
 *
 * Está separada del dibujo a propósito: la física se testea sola, y el
 * componente solo traduce estos números a movimiento.
 */

export const GRAVEDAD = 9.8

/** Metros que representa el recorrido completo en pantalla. */
const RECORRIDO_M = 1.5

/**
 * Cuántas veces más lento que la realidad se muestra. Es siempre la misma, así
 * que comparar entre ejercicios es honesto: con más rozamiento se ve más lento.
 */
const CAMARA_LENTA = 2

/**
 * ponytail: tolerancia relativa para el caso límite. Con m1 = 3, m2 = 2,1 y
 * μ = 0,7 la cuenta a mano da 2,1 > 2,1 (falso, queda quieto), pero la compu
 * calcula 0,7 · 3 = 2,0999999999999996 y el sistema "arrancaba" con una
 * aceleración de 1e-16. Una parte en mil millones está muy por debajo de
 * cualquier dato de un ejercicio.
 */
const TOLERANCIA = 1e-9

export interface DatosPolea {
  m1: number
  m2: number
  muEstatico?: number
  muCinetico?: number
  gravedad?: number
}

export interface ResultadoPolea {
  seMueve: boolean
  /** m/s² */
  aceleracion: number
  /** N */
  tension: number
  /** Segundos que dura la animación; 0 si no se mueve. */
  duracion: number
}

export function resolverPolea({
  m1,
  m2,
  muEstatico,
  muCinetico,
  gravedad = GRAVEDAD,
}: DatosPolea): ResultadoPolea {
  // Si se cargó un solo coeficiente vale para los dos: así lo dan los
  // ejercicios de ingreso ("coeficiente de rozamiento 0,2").
  const muE = muEstatico ?? muCinetico ?? 0
  const muC = muCinetico ?? muEstatico ?? 0

  // Arranca si el peso de la bola le gana al rozamiento estático máximo:
  // m2·g > μe·m1·g. La g se cancela.
  if (!(m2 > muE * m1 * (1 + TOLERANCIA))) {
    return { seMueve: false, aceleracion: 0, tension: m2 * gravedad, duracion: 0 }
  }

  // Segunda ley de Newton para las dos masas juntas: el peso de la bola menos
  // el rozamiento cinético es lo que las acelera.
  const aceleracion = (gravedad * (m2 - muC * m1)) / (m1 + m2)

  return {
    seMueve: true,
    aceleracion,
    // Para la bola sola: m2·g − T = m2·a
    tension: m2 * (gravedad - aceleracion),
    // x = ½·a·t²  →  t = √(2x/a)
    duracion: CAMARA_LENTA * Math.sqrt((2 * RECORRIDO_M) / aceleracion),
  }
}

/** Coma decimal y hasta dos decimales: 2.857 → "2,86". */
export const formatear = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 2 })

export function textoValores(r: ResultadoPolea): string {
  return `a = ${formatear(r.aceleracion)} m/s² · T = ${formatear(r.tension)} N`
}

/**
 * Lo que lee en voz alta un lector de pantalla. Nunca incluye a ni T: con la
 * animación en el enunciado, eso sería darle la respuesta.
 */
export function describirPolea({ m1, m2, muEstatico, muCinetico }: DatosPolea): string {
  const escena = `Caja de ${formatear(m1)} kg sobre una mesa, unida por una cuerda que pasa por una polea a una bola de ${formatear(m2)} kg que cuelga.`
  if (muEstatico === undefined && muCinetico === undefined) return `${escena} Sin rozamiento.`

  const coeficientes = [
    muEstatico !== undefined ? `estático ${formatear(muEstatico)}` : null,
    muCinetico !== undefined ? `cinético ${formatear(muCinetico)}` : null,
  ].filter(Boolean)

  return `${escena} Coeficiente de rozamiento ${coeficientes.join(' y ')}.`
}
