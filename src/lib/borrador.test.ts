import { describe, expect, it } from 'vitest'
import {
  aContenido,
  contenidoDesdeTema,
  ejercicioVacio,
  seccionVacia,
  type ContenidoBorrador,
} from './borrador'
import { TemaContenidoSchema, type TemaContenido } from './schemas'
import { tema, type SubtemaCompleto } from '@/data/topicData'

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

describe('videos', () => {
  // El tema de ejemplo no tiene videos, así que la ida y vuelta de arriba no
  // los prueba. Sin esto, la conversión enlace ↔ identificador podría estar
  // invertida y todos los tests seguirían en verde.
  const conVideos = (enlace: string) => ({
    ...contenidoDesdeTema(tema),
    videos: [{ titulo: 'Suma de vectores', subtitulo: '', enlace, duracionLabel: '12:40' }],
  })

  const videosDe = (b: ContenidoBorrador) =>
    (aContenido(b) as { videos: { youtubeId: string }[] }).videos

  it('guarda el identificador aunque se pegue la dirección completa', () => {
    expect(videosDe(conVideos('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))[0].youtubeId).toBe(
      'dQw4w9WgXcQ',
    )
  })

  it('editar y volver a guardar no cambia el video', () => {
    const guardado = aContenido(conVideos('https://youtu.be/dQw4w9WgXcQ')) as TemaContenido
    const reguardado = aContenido(
      contenidoDesdeTema({ ...tema, videos: guardado.videos }),
    ) as TemaContenido

    expect(reguardado.videos).toEqual(guardado.videos)
  })

  it('un enlace que no es de YouTube no se guarda como válido', () => {
    // Se manda tal cual para que Zod lo rechace con un mensaje, en vez de
    // guardar un video vacío que nadie va a poder reproducir.
    const r = TemaContenidoSchema.safeParse(aContenido(conVideos('https://vimeo.com/12345')))
    expect(r.success).toBe(false)
  })
})

describe('medios y ajustes de la evaluación', () => {
  /**
   * El peor bug posible en un editor: abrir una clase, guardarla sin tocar
   * nada, y que pierda contenido.
   *
   * La ida y vuelta de arriba no lo detectaría, porque el tema de ejemplo no
   * tiene ni imágenes ni tiempo límite. Si `contenidoDesdeTema` se olvidara de
   * `mediosExplicacion`, tu hermano abriría una clase con veinte diagramas,
   * apretaría Guardar, y los veinte desaparecerían sin un solo error.
   */
  const conTodo: SubtemaCompleto = {
    ...tema,
    explicacion: [
      {
        ...tema.explicacion[0],
        medios: [{ tipo: 'imagen', url: 'https://x.test/teoria.png', alt: 'Ejes' }],
      },
      ...tema.explicacion.slice(1),
    ],
    practicos: [
      {
        ...tema.practicos[0],
        ejercicios: [
          {
            ...tema.practicos[0].ejercicios[0],
            medios: [{ tipo: 'imagen', url: 'https://x.test/enunciado.png', alt: 'Diagrama' }],
            mediosExplicacion: [
              { tipo: 'video', youtubeId: 'dQw4w9WgXcQ', segundo: 90 },
              { tipo: 'imagen', url: 'https://x.test/resolucion.png', alt: 'Resolución' },
            ],
          },
          ...tema.practicos[0].ejercicios.slice(1),
        ],
      },
    ],
    evaluaciones: [
      {
        ...tema.evaluaciones[0],
        dificultad: 'Intermedio',
        tiempoLimiteMinutos: 45,
        intentos: 3,
        preguntas: [
          {
            ...tema.evaluaciones[0].preguntas[0],
            medios: [{ tipo: 'imagen', url: 'https://x.test/pregunta.png', alt: 'Vectores' }],
            mediosExplicacion: [{ tipo: 'imagen', url: 'https://x.test/porque.png', alt: 'Por qué' }],
          },
          ...tema.evaluaciones[0].preguntas.slice(1),
        ],
      },
    ],
  }

  it('editar y guardar sin tocar nada no pierde ni una imagen', () => {
    // `aContenido` devuelve solo el contenido, sin el título ni el slug de la
    // clase, así que se compara contra esos campos y no contra el objeto entero.
    expect(aContenido(contenidoDesdeTema(conTodo))).toEqual({
      objetivos: conTodo.objetivos,
      videos: conTodo.videos,
      explicacion: conTodo.explicacion,
      ejemplos: conTodo.ejemplos,
      practicos: conTodo.practicos,
      evaluaciones: conTodo.evaluaciones,
    })
  })

  it('lo que sale sigue siendo contenido válido', () => {
    const r = TemaContenidoSchema.safeParse(aContenido(contenidoDesdeTema(conTodo)))
    expect(r.success ? null : r.error.issues[0]).toBe(null)
  })

  it('una imagen sin descripción no se puede guardar', () => {
    // El alt es obligatorio: cuando la imagen ES el enunciado, no describirla
    // deja afuera a quien usa lector de pantalla.
    const borrador = contenidoDesdeTema(conTodo)
    const medio = borrador.practicos[0].ejercicios[0].medios[0]
    if (medio.tipo !== 'imagen') throw new Error('el primer medio debería ser una imagen')
    medio.alt = ''

    const r = TemaContenidoSchema.safeParse(aContenido(borrador))
    expect(r.success).toBe(false)
  })

  it('sin tiempo ni intentos, esos campos no se guardan', () => {
    // El 0 del formulario significa "no puesto". Guardarlo como 0 sería un
    // examen de cero minutos y cero intentos.
    const borrador = contenidoDesdeTema(conTodo)
    borrador.evaluaciones[0].tiempoLimiteMinutos = 0
    borrador.evaluaciones[0].intentos = 0
    borrador.evaluaciones[0].dificultad = ''

    const ev = (aContenido(borrador) as TemaContenido).evaluaciones[0]
    expect(Object.keys(ev)).not.toContain('tiempoLimiteMinutos')
    expect(Object.keys(ev)).not.toContain('intentos')
    expect(Object.keys(ev)).not.toContain('dificultad')
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
      // Desde el constructor y no un objeto a mano: así, cuando se agregue un
      // campo nuevo a la sección, estos tests no se rompen por no conocerlo.
      explicacion: [{ ...seccionVacia(), titulo: 't', parrafo: 'p' }],
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
      // Desde el constructor y no un objeto a mano: así, cuando se agregue un
      // campo nuevo a la sección, estos tests no se rompen por no conocerlo.
      explicacion: [{ ...seccionVacia(), titulo: 't', parrafo: 'p' }],
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
