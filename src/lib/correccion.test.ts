import { describe, expect, it } from 'vitest'
import { esCorrecta } from './correccion'
import type { Ejercicio } from './schemas'

const libre: Ejercicio = {
  id: 1,
  tipo: 'libre',
  enunciado: 'Escribí los 8 primeros múltiplos de 7 (empezando en 0).',
  respuestaCorrecta: '0,7,14,21,28,35,42,49',
  explicacion: '...',
  puntos: 2,
}

const multiple: Ejercicio = {
  id: 2,
  tipo: 'multiple',
  enunciado: '¿Cuáles son múltiplos de 6?',
  opciones: ['12', '18', '20', '24'],
  respuestaCorrecta: ['12', '18', '24'],
  explicacion: '...',
  puntos: 2,
}

const siNo: Ejercicio = {
  id: 3,
  tipo: 'si-no',
  enunciado: '¿Es 84 múltiplo de 12?',
  respuestaCorrecta: 'Sí',
  explicacion: '...',
  puntos: 1,
}

describe('ejercicio de respuesta libre', () => {
  it('acepta la respuesta exacta', () => {
    expect(esCorrecta(libre, '0,7,14,21,28,35,42,49')).toBe(true)
  })

  it('ignora espacios alrededor de las comas', () => {
    expect(esCorrecta(libre, '0, 7, 14, 21, 28, 35, 42, 49')).toBe(true)
  })

  it('ignora el orden', () => {
    expect(esCorrecta(libre, '49,42,35,28,21,14,7,0')).toBe(true)
  })

  it('ignora comas de más y espacios al final', () => {
    expect(esCorrecta(libre, ' 0,7,14,21,,28,35,42,49, ')).toBe(true)
  })

  it('rechaza si falta un número', () => {
    expect(esCorrecta(libre, '0,7,14,21,28,35,42')).toBe(false)
  })

  it('rechaza si sobra un número', () => {
    expect(esCorrecta(libre, '0,7,14,21,28,35,42,49,56')).toBe(false)
  })

  it('rechaza un número cambiado', () => {
    expect(esCorrecta(libre, '0,7,14,21,28,35,42,48')).toBe(false)
  })

  it('rechaza la respuesta vacía', () => {
    expect(esCorrecta(libre, '')).toBe(false)
  })
})

describe('ejercicio de selección múltiple', () => {
  it('acepta el conjunto correcto en cualquier orden', () => {
    expect(esCorrecta(multiple, ['24', '12', '18'])).toBe(true)
  })

  it('rechaza si falta una opción', () => {
    expect(esCorrecta(multiple, ['12', '18'])).toBe(false)
  })

  it('rechaza si tildó una de más', () => {
    expect(esCorrecta(multiple, ['12', '18', '20', '24'])).toBe(false)
  })

  it('rechaza sin nada tildado', () => {
    expect(esCorrecta(multiple, [])).toBe(false)
  })
})

describe('ejercicio de sí/no', () => {
  it('acepta la respuesta correcta', () => {
    expect(esCorrecta(siNo, 'Sí')).toBe(true)
  })

  it('rechaza la contraria', () => {
    expect(esCorrecta(siNo, 'No')).toBe(false)
  })

  it('rechaza "Si" sin tilde: no es la misma cadena', () => {
    expect(esCorrecta(siNo, 'Si')).toBe(false)
  })
})
