import { describe, expect, it } from 'vitest'
import { EjercicioSchema, PreguntaQuizSchema, TemaContenidoSchema, TemaMetaSchema } from './schemas'
import { tema } from '@/data/topicData'

describe('el contenido real del tema 7', () => {
  it('pasa la validación', () => {
    const resultado = TemaContenidoSchema.safeParse({
      objetivos: tema.objetivos,
      explicacion: tema.explicacion,
      ejemplos: tema.ejemplos,
      ejercicios: tema.ejercicios,
      quiz: tema.quiz,
    })
    expect(resultado.success).toBe(true)
  })
})

describe('pregunta de quiz', () => {
  const base = {
    id: 1,
    pregunta: '¿Cuál de estos números es múltiplo de 8?',
    opciones: ['18', '24', '30', '45'],
    respuestaCorrectaIndex: 1,
    explicacion: '24 es múltiplo de 8 porque 8×3=24.',
  }

  it('acepta una pregunta bien formada', () => {
    expect(PreguntaQuizSchema.safeParse(base).success).toBe(true)
  })

  it('rechaza un índice que apunta fuera de las opciones', () => {
    expect(PreguntaQuizSchema.safeParse({ ...base, respuestaCorrectaIndex: 4 }).success).toBe(false)
  })

  it('rechaza una opción vacía', () => {
    expect(PreguntaQuizSchema.safeParse({ ...base, opciones: ['18', '', '30', '45'] }).success).toBe(
      false,
    )
  })
})

describe('ejercicio de selección múltiple', () => {
  const base = {
    id: 2,
    tipo: 'multiple' as const,
    enunciado: '¿Cuáles son múltiplos de 6?',
    opciones: ['12', '18', '20', '24'],
    respuestaCorrecta: ['12', '18', '24'],
    explicacion: '...',
    puntos: 2,
  }

  it('acepta un ejercicio bien formado', () => {
    expect(EjercicioSchema.safeParse(base).success).toBe(true)
  })

  it('rechaza una respuesta correcta que no está entre las opciones', () => {
    // El error típico cargando a mano: se marca "36" como correcta pero la
    // opción escrita es "38". Sin esta regla el ejercicio es inacertable.
    expect(EjercicioSchema.safeParse({ ...base, respuestaCorrecta: ['12', '36'] }).success).toBe(
      false,
    )
  })

  it('rechaza un tipo de ejercicio inexistente', () => {
    expect(EjercicioSchema.safeParse({ ...base, tipo: 'verdadero-falso' }).success).toBe(false)
  })
})

describe('metadatos del tema', () => {
  const base = {
    slug: 'multiplos-y-divisores',
    titulo: 'Múltiplos y divisores',
    categoria: 'Números y Operaciones',
    orden: 7,
    duracionLabel: '10:15',
    videoUrl: '',
    gratis: true,
    publicado: true,
  }

  it('acepta metadatos bien formados', () => {
    expect(TemaMetaSchema.safeParse(base).success).toBe(true)
  })

  it('rechaza un slug con mayúsculas, tildes o espacios', () => {
    for (const slug of ['Multiplos', 'múltiplos-y-divisores', 'multiplos y divisores']) {
      expect(TemaMetaSchema.safeParse({ ...base, slug }).success).toBe(false)
    }
  })

  it('rechaza una duración que no es mm:ss', () => {
    expect(TemaMetaSchema.safeParse({ ...base, duracionLabel: '10 minutos' }).success).toBe(false)
  })
})
