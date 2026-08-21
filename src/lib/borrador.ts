import type { SubtemaCompleto } from '@/data/topicData'

/**
 * El "borrador" es la forma que tiene el contenido MIENTRAS se edita, que no es
 * la misma que se guarda:
 *
 * - Un ejercicio guardado tiene solo los campos de su tipo. El borrador tiene
 *   los de los tres a la vez, para que cambiar el tipo en el select no borre lo
 *   que ya se escribió.
 * - Los `id` no se editan: se asignan por posición al guardar. Nadie que carga
 *   contenido debería tener que llevar la cuenta de números internos.
 * - La caja de una sección es opcional; en el borrador es una casilla + los
 *   datos, así que destildarla no pierde el texto.
 *
 * `aContenido` devuelve `unknown` a propósito: lo que sale de acá todavía no es
 * contenido válido, lo es recién después de pasar por TemaContenidoSchema.
 */

export type TipoEjercicio = 'libre' | 'multiple' | 'si-no'
export type TipoCaja = 'ejemplo' | 'tip' | 'nota'

export interface SeccionBorrador {
  titulo: string
  parrafo: string
  conCaja: boolean
  cajaTipo: TipoCaja
  cajaContenido: string
}

export interface EjemploBorrador {
  enunciado: string
  pasos: string[]
  /** Índice del video en la lista, o -1 si no apunta a ninguno. */
  videoIndice: number
  /** Momento del video, en segundos. */
  videoSegundo: number
}

export interface EjercicioBorrador {
  tipo: TipoEjercicio
  enunciado: string
  explicacion: string
  puntos: number
  respuestaLibre: string
  opciones: string[]
  correctasMultiple: string[]
  correctaSiNo: 'Sí' | 'No'
}

export interface PreguntaBorrador {
  pregunta: string
  opciones: string[]
  respuestaCorrectaIndex: number
  explicacion: string
}

export interface VideoBorrador {
  titulo: string
  subtitulo: string
  bunnyId: string
  duracionLabel: string
}

export interface PracticoBorrador {
  titulo: string
  ejercicios: EjercicioBorrador[]
}

export interface EvaluacionBorrador {
  titulo: string
  preguntas: PreguntaBorrador[]
}

export interface ContenidoBorrador {
  objetivos: string[]
  videos: VideoBorrador[]
  explicacion: SeccionBorrador[]
  ejemplos: EjemploBorrador[]
  practicos: PracticoBorrador[]
  evaluaciones: EvaluacionBorrador[]
}

// --- Ítems vacíos, para los botones "agregar" ---------------------------------

export const seccionVacia = (): SeccionBorrador => ({
  titulo: '',
  parrafo: '',
  conCaja: false,
  cajaTipo: 'ejemplo',
  cajaContenido: '',
})

export const ejemploVacio = (): EjemploBorrador => ({
  enunciado: '',
  pasos: ['', '', ''],
  videoIndice: -1,
  videoSegundo: 0,
})

export const ejercicioVacio = (): EjercicioBorrador => ({
  tipo: 'libre',
  enunciado: '',
  explicacion: '',
  puntos: 1,
  respuestaLibre: '',
  opciones: ['', ''],
  correctasMultiple: [],
  correctaSiNo: 'Sí',
})

export const preguntaVacia = (): PreguntaBorrador => ({
  pregunta: '',
  opciones: ['', '', '', ''],
  respuestaCorrectaIndex: 0,
  explicacion: '',
})

export const videoVacio = (): VideoBorrador => ({
  titulo: '',
  subtitulo: '',
  bunnyId: '',
  duracionLabel: '',
})

export const practicoVacio = (): PracticoBorrador => ({ titulo: '', ejercicios: [ejercicioVacio()] })

export const evaluacionVacia = (): EvaluacionBorrador => ({
  titulo: '',
  preguntas: [preguntaVacia()],
})

export const contenidoVacio = (): ContenidoBorrador => ({
  objetivos: [''],
  videos: [],
  explicacion: [seccionVacia()],
  ejemplos: [ejemploVacio()],
  practicos: [],
  evaluaciones: [],
})

// --- Subtema guardado → borrador ------------------------------------------------

export function contenidoDesdeTema(tema: SubtemaCompleto): ContenidoBorrador {
  return {
    objetivos: [...tema.objetivos],
    explicacion: tema.explicacion.map(s => ({
      titulo: s.titulo,
      parrafo: s.parrafo,
      conCaja: Boolean(s.caja),
      cajaTipo: s.caja?.tipo ?? 'ejemplo',
      cajaContenido: s.caja?.contenido ?? '',
    })),
    videos: tema.videos.map(v => ({
      titulo: v.titulo,
      subtitulo: v.subtitulo ?? '',
      bunnyId: v.bunnyId,
      duracionLabel: v.duracionLabel ?? '',
    })),
    ejemplos: tema.ejemplos.map(e => ({
      enunciado: e.enunciado,
      pasos: [...e.pasos],
      // El contenido guarda el id del video; el borrador trabaja con su
      // posición en la lista, que es lo que el formulario puede mostrar.
      videoIndice: e.video ? tema.videos.findIndex(v => v.id === e.video!.videoId) : -1,
      videoSegundo: e.video?.segundo ?? 0,
    })),
    practicos: tema.practicos.map(p => ({
      titulo: p.titulo ?? '',
      ejercicios: p.ejercicios.map(e => ({
      tipo: e.tipo,
      enunciado: e.enunciado,
      explicacion: e.explicacion,
      puntos: e.puntos,
      respuestaLibre: e.tipo === 'libre' ? e.respuestaCorrecta : '',
      opciones: e.tipo === 'multiple' ? [...e.opciones] : ['', ''],
      correctasMultiple: e.tipo === 'multiple' ? [...e.respuestaCorrecta] : [],
      correctaSiNo: e.tipo === 'si-no' ? e.respuestaCorrecta : 'Sí',
      })),
    })),
    evaluaciones: tema.evaluaciones.map(ev => ({
      titulo: ev.titulo ?? '',
      preguntas: ev.preguntas.map(p => ({
        pregunta: p.pregunta,
        opciones: [...p.opciones],
        respuestaCorrectaIndex: p.respuestaCorrectaIndex,
        explicacion: p.explicacion,
      })),
    })),
  }
}

// --- Borrador → contenido para guardar ---------------------------------------

function ejercicioAGuardar(e: EjercicioBorrador, id: number) {
  const comun = { id, enunciado: e.enunciado, explicacion: e.explicacion, puntos: e.puntos }
  switch (e.tipo) {
    case 'libre':
      return { ...comun, tipo: 'libre', respuestaCorrecta: e.respuestaLibre }
    case 'multiple':
      // Solo sobreviven las correctas que siguen estando entre las opciones: si
      // se editó el texto de una opción ya tildada, la marca quedó huérfana.
      return {
        ...comun,
        tipo: 'multiple',
        opciones: e.opciones,
        respuestaCorrecta: e.correctasMultiple.filter(c => e.opciones.includes(c)),
      }
    case 'si-no':
      return { ...comun, tipo: 'si-no', respuestaCorrecta: e.correctaSiNo }
  }
}

export function aContenido(b: ContenidoBorrador): unknown {
  // Los videos se numeran por posición, igual que todo lo demás. Los ejemplos
  // guardan ese id y no el índice: si mañana se reordenan los videos, la
  // referencia tendría que seguir apuntando al mismo.
  const videos = b.videos.map((v, i) => ({
    id: i + 1,
    titulo: v.titulo,
    bunnyId: v.bunnyId,
    ...(v.subtitulo ? { subtitulo: v.subtitulo } : {}),
    ...(v.duracionLabel ? { duracionLabel: v.duracionLabel } : {}),
  }))

  return {
    objetivos: b.objetivos,
    videos,
    explicacion: b.explicacion.map(s => ({
      titulo: s.titulo,
      parrafo: s.parrafo,
      ...(s.conCaja ? { caja: { tipo: s.cajaTipo, contenido: s.cajaContenido } } : {}),
    })),
    ejemplos: b.ejemplos.map((e, i) => ({
      id: i + 1,
      enunciado: e.enunciado,
      pasos: e.pasos,
      // Solo se guarda la referencia si el video elegido sigue existiendo: si
      // se borró, la marca queda huérfana y Zod rechazaría todo el contenido.
      ...(e.videoIndice >= 0 && e.videoIndice < videos.length
        ? { video: { videoId: videos[e.videoIndice].id, segundo: e.videoSegundo } }
        : {}),
    })),
    practicos: b.practicos.map(p => ({
      ...(p.titulo ? { titulo: p.titulo } : {}),
      ejercicios: p.ejercicios.map((e, i) => ejercicioAGuardar(e, i + 1)),
    })),
    evaluaciones: b.evaluaciones.map(ev => ({
      ...(ev.titulo ? { titulo: ev.titulo } : {}),
      preguntas: ev.preguntas.map((p, i) => ({
        id: i + 1,
        pregunta: p.pregunta,
        opciones: p.opciones,
        respuestaCorrectaIndex: p.respuestaCorrectaIndex,
        explicacion: p.explicacion,
      })),
    })),
  }
}
