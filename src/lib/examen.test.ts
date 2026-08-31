import { describe, expect, it } from 'vitest'
import {
  calificar,
  restantes,
  seAcaboElTiempo,
  transcurrido,
  vencido,
  GRACIA_SEGUNDOS,
} from './examen'
import type { Evaluacion } from './schemas'

/**
 * Las cuentas del examen.
 *
 * Un error de un segundo acá no da ningún síntoma hasta que le pasa a una
 * persona real rindiendo: si `vencido` se adelanta, alguien se queda afuera
 * habiendo entregado a tiempo; si se atrasa, el reloj no significa nada.
 *
 * Todo se prueba con un reloj de mentira. Sin poder elegir la hora, verificar
 * un límite de 45 minutos llevaría 45 minutos.
 */

const INICIO = '2026-08-30T10:00:00.000Z'
const t = (segundos: number) => new Date(INICIO).getTime() + segundos * 1000

describe('el reloj', () => {
  it('cuenta hacia atrás desde el límite', () => {
    expect(restantes(INICIO, 45, t(0))).toBe(45 * 60)
    expect(restantes(INICIO, 45, t(60))).toBe(45 * 60 - 60)
    expect(restantes(INICIO, 45, t(45 * 60))).toBe(0)
  })

  it('no muestra números negativos', () => {
    // El alumno dejó la pestaña abierta una hora. Ve 0:00, no -15:00.
    expect(restantes(INICIO, 45, t(60 * 60))).toBe(0)
  })

  it('sin límite de tiempo no hay reloj', () => {
    expect(restantes(INICIO, undefined, t(999))).toBe(null)
    expect(vencido(INICIO, undefined, t(99999))).toBe(false)
  })

  it('el reloj del alumno adelantado no da tiempo negativo', () => {
    // Si el navegador manda una hora anterior al inicio, transcurrido es 0 y
    // no un número negativo que le regale tiempo.
    expect(transcurrido(INICIO, t(-500))).toBe(0)
  })
})

describe('el vencimiento y su margen de gracia', () => {
  it('no está vencido antes del límite', () => {
    expect(vencido(INICIO, 45, t(45 * 60 - 1))).toBe(false)
  })

  it('justo al llegar a cero todavía se acepta', () => {
    // El alumno ve 0:00 y aprieta entregar. Esa entrega tiene que entrar: el
    // margen existe para el viaje por la red, no para hacer trampa.
    expect(restantes(INICIO, 45, t(45 * 60))).toBe(0)
    expect(vencido(INICIO, 45, t(45 * 60))).toBe(false)
  })

  it('dentro del margen todavía se acepta', () => {
    expect(vencido(INICIO, 45, t(45 * 60 + GRACIA_SEGUNDOS))).toBe(false)
  })

  it('pasado el margen ya no', () => {
    expect(vencido(INICIO, 45, t(45 * 60 + GRACIA_SEGUNDOS + 1))).toBe(true)
  })
})

describe('distinguir "se acabó el tiempo" de "todavía te acepto la entrega"', () => {
  // Son dos preguntas distintas y confundirlas fue un bug real: el examen de 2
  // minutos se entregaba solo a los 121 segundos, el margen de gracia hacía
  // que `vencido` diera falso, y la pantalla decía "Tardaste 2:01" como si el
  // alumno hubiera entregado tranquilo.

  it('entregar antes del límite no es vencimiento', () => {
    expect(seAcaboElTiempo(90, 2)).toBe(false)
  })

  it('justo al llegar a cero SÍ es vencimiento', () => {
    expect(seAcaboElTiempo(120, 2)).toBe(true)
  })

  it('el caso que fallaba: dentro del margen, pero el tiempo se acabó igual', () => {
    // 121 segundos de un examen de 2 minutos. `vencido` dice que todavía se
    // acepta -y está bien, es el margen de red-, pero al alumno hay que
    // decirle que se le acabó el tiempo, no que tardó 2:01.
    expect(vencido(INICIO, 2, t(121))).toBe(false)
    expect(seAcaboElTiempo(121, 2)).toBe(true)
  })

  it('sin límite de tiempo nunca se acaba', () => {
    expect(seAcaboElTiempo(99999, undefined)).toBe(false)
  })
})

describe('la calificación', () => {
  const ev: Evaluacion = {
    preguntas: [
      {
        id: 1,
        pregunta: '¿Cuánto es 2+2?',
        opciones: ['3', '4'],
        respuestaCorrectaIndex: 1,
        explicacion: 'Cuatro.',
      },
      {
        id: 2,
        pregunta: '¿Y 3+3?',
        opciones: ['6', '9'],
        respuestaCorrectaIndex: 0,
        explicacion: 'Seis.',
        mediosExplicacion: [{ tipo: 'imagen', url: 'https://x.test/seis.png', alt: 'Seis' }],
      },
      {
        id: 3,
        pregunta: '¿Y 4+4?',
        opciones: ['8', '12'],
        respuestaCorrectaIndex: 0,
        explicacion: 'Ocho.',
      },
    ],
  }

  it('cuenta bien lo respondido', () => {
    const r = calificar(ev, { '1': 1, '2': 0, '3': 0 })
    expect(r.puntaje).toBe(3)
    expect(r.total).toBe(3)
  })

  it('lo que no llegó a responder cuenta como incorrecto, no se saltea', () => {
    // Se quedó sin tiempo despues de la primera. La nota es sobre 3, no sobre
    // 1: un examen entregado a medias no se califica sobre lo que alcanzó.
    const r = calificar(ev, { '1': 1 })

    expect(r.puntaje).toBe(1)
    expect(r.total).toBe(3)
    expect(r.detalle[1].elegida).toBe(null)
    expect(r.detalle[1].correcta).toBe(false)
  })

  it('distingue "no respondí" de "elegí la opción 0"', () => {
    // La opción 0 es un valor válido y además es falsy. Si en algún lado se
    // usara `if (elegida)`, elegir la primera opción se leería como no haber
    // respondido — y la pregunta 3 se corregiría mal.
    const r = calificar(ev, { '3': 0 })

    expect(r.detalle[2].elegida).toBe(0)
    expect(r.detalle[2].correcta).toBe(true)
    expect(r.detalle[0].elegida).toBe(null)
  })

  it('la revisión trae la explicación y sus imágenes', () => {
    const r = calificar(ev, { '2': 1 })

    expect(r.detalle[1].explicacion).toBe('Seis.')
    expect(r.detalle[1].mediosExplicacion).toHaveLength(1)
    expect(r.detalle[1].correctaIndex).toBe(0)
  })
})
