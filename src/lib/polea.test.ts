import { describe, expect, it } from 'vitest'
import { describirPolea, resolverPolea, textoValores } from './polea'

describe('polea sobre mesa', () => {
  it('el ejercicio de la imagen: 50 kg y 20 kg sin rozamiento', () => {
    const r = resolverPolea({ m1: 50, m2: 20 })
    expect(r.seMueve).toBe(true)
    expect(r.aceleracion).toBeCloseTo(2.8, 10)
    expect(r.tension).toBeCloseTo(140, 10)
  })

  it('con g = 10 cambia el resultado, y tiene que coincidir con el del profesor', () => {
    expect(resolverPolea({ m1: 50, m2: 20, gravedad: 10 }).aceleracion).toBeCloseTo(2.857, 3)
  })

  it('si el rozamiento estático alcanza justo, queda quieto', () => {
    // 20 > 0,4 · 50  →  20 > 20  →  falso
    const r = resolverPolea({ m1: 50, m2: 20, muEstatico: 0.4 })
    expect(r.seMueve).toBe(false)
    expect(r.aceleracion).toBe(0)
    expect(r.tension).toBeCloseTo(196, 10)
    expect(r.duracion).toBe(0)
  })

  it('el límite no lo decide el redondeo de la compu', () => {
    // 0,7 · 3 da 2,0999999999999996. Sin tolerancia 2,1 "le ganaba", el sistema
    // arrancaba con a ≈ 1e-16 y la animación duraba 118 millones de segundos.
    expect(resolverPolea({ m1: 3, m2: 2.1, muEstatico: 0.7 }).seMueve).toBe(false)
  })

  it('el estático decide si arranca, aunque con el cinético podría moverse', () => {
    // μc · m1 = 10 < 20, pero μe · m1 = 25 > 20: nunca llega a arrancar.
    expect(resolverPolea({ m1: 50, m2: 20, muEstatico: 0.5, muCinetico: 0.2 }).seMueve).toBe(false)
  })

  it('una vez en movimiento, frena el cinético', () => {
    // 9,8 · (20 − 0,2 · 50) / 70
    const r = resolverPolea({ m1: 50, m2: 20, muEstatico: 0.3, muCinetico: 0.2 })
    expect(r.aceleracion).toBeCloseTo(1.4, 10)
  })

  it('un solo coeficiente vale para los dos', () => {
    const ambos = resolverPolea({ m1: 50, m2: 20, muEstatico: 0.2, muCinetico: 0.2 })
    expect(resolverPolea({ m1: 50, m2: 20, muCinetico: 0.2 })).toEqual(ambos)
    expect(resolverPolea({ m1: 50, m2: 20, muEstatico: 0.2 })).toEqual(ambos)
  })

  it('la duración sale de x = ½·a·t², en cámara lenta ×2', () => {
    // 2 · √(2 · 1,5 / 2,8) ≈ 2,07 s
    expect(resolverPolea({ m1: 50, m2: 20 }).duracion).toBeCloseTo(2.07, 2)
  })

  it('con más rozamiento se ve más lento', () => {
    expect(resolverPolea({ m1: 50, m2: 20, muCinetico: 0.2 }).duracion).toBeGreaterThan(
      resolverPolea({ m1: 50, m2: 20 }).duracion,
    )
  })
})

describe('textos de la animación', () => {
  it('los valores van con coma decimal', () => {
    expect(textoValores(resolverPolea({ m1: 50, m2: 20 }))).toBe('a = 2,8 m/s² · T = 140 N')
    expect(textoValores(resolverPolea({ m1: 50, m2: 20, muEstatico: 0.4 }))).toBe(
      'a = 0 m/s² · T = 196 N',
    )
  })

  it('la descripción para lectores de pantalla no da la respuesta', () => {
    const d = describirPolea({ m1: 50, m2: 20, muCinetico: 0.25 })
    expect(d).toBe(
      'Caja de 50 kg sobre una mesa, unida por una cuerda que pasa por una polea a una bola de 20 kg que cuelga. Coeficiente de rozamiento cinético 0,25.',
    )
    expect(d).not.toContain('m/s²')
  })

  it('sin rozamiento lo dice', () => {
    expect(describirPolea({ m1: 50, m2: 20 })).toMatch(/Sin rozamiento\.$/)
  })
})
