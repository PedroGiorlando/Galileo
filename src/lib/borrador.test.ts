import { describe, expect, it } from 'vitest'
import { aContenido, contenidoDesdeTema, ejercicioVacio } from './borrador'
import { TemaContenidoSchema } from './schemas'
import { tema } from '@/data/topicData'

describe('ida y vuelta entre tema guardado y borrador', () => {
  const contenido = aContenido(contenidoDesdeTema(tema))

  it('el resultado sigue siendo contenido válido', () => {
    const r = TemaContenidoSchema.safeParse(contenido)
    expect(r.success).toBe(true)
  })

  it('no pierde ni deforma nada del tema original', () => {
    // Si esto falla, cargar un tema en el panel y guardarlo sin tocar nada lo
    // estaría corrompiendo — el peor bug posible en un editor de contenido.
    expect(contenido).toEqual({
      objetivos: tema.objetivos,
      explicacion: tema.explicacion,
      ejemplos: tema.ejemplos,
      videos: tema.videos,
      practicos: tema.practicos,
      evaluaciones: tema.evaluaciones,
    })
  })
})

describe('conversión de un ejercicio en edición', () => {
  it('descarta las marcas de correcta que ya no coinciden con ninguna opción', () => {
    // Pasa al editar el texto de una opción que ya estaba tildada: la marca
    // queda apuntando a un texto que no existe más. Sin este filtro, Zod
    // rechazaría el tema entero con un error difícil de entender.
    const borrador = {
      ...ejercicioVacio(),
      tipo: 'multiple' as const,
      enunciado: '¿Cuáles son múltiplos de 6?',
      explicacion: '...',
      opciones: ['12', '18'],
      correctasMultiple: ['12', '36'],
    }
    const salida = aContenido({
      objetivos: ['x'],
      explicacion: [{ titulo: 't', parrafo: 'p', conCaja: false, cajaTipo: 'ejemplo', cajaContenido: '' }],
      ejemplos: [{ enunciado: 'e', pasos: ['p'], videoIndice: -1, videoSegundo: 0 }],
      videos: [],
      practicos: [{ titulo: '', ejercicios: [borrador] }],
      evaluaciones: [],
    }) as { practicos: { ejercicios: { respuestaCorrecta: string[] }[] }[] }

    expect(salida.practicos[0].ejercicios[0].respuestaCorrecta).toEqual(['12'])
  })

  it('numera los ítems por posición, sin que nadie cargue ids a mano', () => {
    const salida = aContenido({
      objetivos: ['x'],
      explicacion: [{ titulo: 't', parrafo: 'p', conCaja: false, cajaTipo: 'ejemplo', cajaContenido: '' }],
      ejemplos: [
        { enunciado: 'a', pasos: ['p'], videoIndice: -1, videoSegundo: 0 },
        { enunciado: 'b', pasos: ['p'], videoIndice: -1, videoSegundo: 0 },
      ],
      videos: [],
      practicos: [{ titulo: '', ejercicios: [ejercicioVacio(), ejercicioVacio()] }],
      evaluaciones: [],
    }) as { ejemplos: { id: number }[]; practicos: { ejercicios: { id: number }[] }[] }

    expect(salida.ejemplos.map(e => e.id)).toEqual([1, 2])
    expect(salida.practicos[0].ejercicios.map(e => e.id)).toEqual([1, 2])
  })
})
