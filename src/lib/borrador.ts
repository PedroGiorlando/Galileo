import type { Medio, TemaContenido } from './schemas'
import { idDeYouTube } from './video'

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
export type Dificultad = 'Básico' | 'Intermedio' | 'Avanzado'

/**
 * Una imagen o un video mientras se edita.
 *
 * El video guarda `enlace` y no `youtubeId` por lo mismo que los de la
 * lección: quien carga pega la dirección tal como la copió, y el
 * identificador se extrae al guardar.
 */
export type MedioBorrador =
  | { tipo: 'imagen'; url: string; alt: string }
  | { tipo: 'video'; enlace: string; segundo: number }

export const imagenVacia = (url: string): MedioBorrador => ({ tipo: 'imagen', url, alt: '' })
export const videoMedioVacio = (): MedioBorrador => ({ tipo: 'video', enlace: '', segundo: 0 })

export interface SeccionBorrador {
  titulo: string
  parrafo: string
  medios: MedioBorrador[]
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
  /** Acompañan al enunciado. */
  medios: MedioBorrador[]
  explicacion: string
  /** Acompañan a la devolución: no llegan al alumno hasta que responde. */
  mediosExplicacion: MedioBorrador[]
  puntos: number
  respuestaLibre: string
  opciones: string[]
  correctasMultiple: string[]
  correctaSiNo: 'Sí' | 'No'
}

export interface PreguntaBorrador {
  pregunta: string
  medios: MedioBorrador[]
  opciones: string[]
  respuestaCorrectaIndex: number
  explicacion: string
  mediosExplicacion: MedioBorrador[]
}

export interface VideoBorrador {
  titulo: string
  subtitulo: string
  /**
   * Lo que la persona pegó en el formulario: puede ser el enlace completo de
   * YouTube en cualquiera de sus formas, o el identificador pelado. Se
   * convierte a identificador recién al guardar.
   */
  enlace: string
  duracionLabel: string
}

export interface PracticoBorrador {
  titulo: string
  ejercicios: EjercicioBorrador[]
}

export interface EvaluacionBorrador {
  titulo: string
  /** Cadena vacía = sin etiqueta de dificultad. */
  dificultad: Dificultad | ''
  /**
   * 0 = sin reloj, y 0 = intentos ilimitados.
   *
   * Se usa el 0 como "no puesto" en vez de dejar el campo vacío porque el
   * formulario trabaja con números y un `undefined` volvería a poner el input
   * en modo no controlado a mitad de la edición. Mismo criterio que el -1 de
   * `videoIndice`. Al guardar, el 0 se convierte en ausencia del campo.
   */
  tiempoLimiteMinutos: number
  intentos: number
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
  medios: [],
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
  medios: [],
  explicacion: '',
  mediosExplicacion: [],
  puntos: 1,
  respuestaLibre: '',
  opciones: ['', ''],
  correctasMultiple: [],
  correctaSiNo: 'Sí',
})

export const preguntaVacia = (): PreguntaBorrador => ({
  pregunta: '',
  medios: [],
  opciones: ['', '', '', ''],
  respuestaCorrectaIndex: 0,
  explicacion: '',
  mediosExplicacion: [],
})

export const videoVacio = (): VideoBorrador => ({
  titulo: '',
  subtitulo: '',
  enlace: '',
  duracionLabel: '',
})

export const practicoVacio = (): PracticoBorrador => ({ titulo: '', ejercicios: [ejercicioVacio()] })

export const evaluacionVacia = (): EvaluacionBorrador => ({
  titulo: '',
  dificultad: '',
  tiempoLimiteMinutos: 0,
  intentos: 0,
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

// --- Medios: guardado ↔ borrador ---------------------------------------------
//
// No se filtran las filas incompletas. Si alguien agrega una imagen y no le
// pone descripción, o un video sin enlace, Zod lo rechaza al guardar con un
// mensaje que dice qué falta. Es el mismo criterio que ya usan los objetivos y
// las opciones: descartar en silencio lo que está a medias es cómo se pierde
// trabajo sin que nadie se entere.

function medioABorrador(m: Medio): MedioBorrador {
  return m.tipo === 'imagen'
    ? { tipo: 'imagen', url: m.url, alt: m.alt }
    : { tipo: 'video', enlace: m.youtubeId, segundo: m.segundo ?? 0 }
}

function medioAGuardar(m: MedioBorrador) {
  if (m.tipo === 'imagen') return { tipo: 'imagen', url: m.url, alt: m.alt }
  return {
    tipo: 'video',
    youtubeId: idDeYouTube(m.enlace) ?? m.enlace,
    ...(m.segundo > 0 ? { segundo: m.segundo } : {}),
  }
}

/** Los medios son opcionales en el contenido: vacío significa no escribirlos. */
function mediosAGuardar(lista: MedioBorrador[]) {
  return lista.length > 0 ? { medios: lista.map(medioAGuardar) } : {}
}

function mediosExplicacionAGuardar(lista: MedioBorrador[]) {
  return lista.length > 0 ? { mediosExplicacion: lista.map(medioAGuardar) } : {}
}

const desdeMedios = (lista: Medio[] | undefined) => (lista ?? []).map(medioABorrador)

// --- Subtema guardado → borrador ------------------------------------------------

/**
 * Lo que se puede leer de la base para editar. Va como `Partial` a propósito.
 *
 * Una clase sin publicar se guarda a medias —ese es el punto de un borrador— y
 * el panel tiene que poder abrir CUALQUIER cosa que él mismo haya escrito. Si
 * esto exigiera el contenido completo, guardar un borrador incompleto lo
 * dejaría imposible de reabrir: error 500 al entrar, y el trabajo adentro sin
 * forma de recuperarlo. El panel es la herramienta para arreglar contenido
 * roto; no puede ser lo primero que se rompa con él.
 */
export type ContenidoGuardado = Partial<TemaContenido>

export function contenidoDesdeTema(guardado: ContenidoGuardado): ContenidoBorrador {
  // Las seis listas se resuelven una sola vez: más abajo los ejemplos buscan
  // dentro de los videos, y necesitan la lista ya normalizada.
  const tema = {
    objetivos: guardado.objetivos ?? [],
    videos: guardado.videos ?? [],
    explicacion: guardado.explicacion ?? [],
    ejemplos: guardado.ejemplos ?? [],
    practicos: guardado.practicos ?? [],
    evaluaciones: guardado.evaluaciones ?? [],
  }

  return {
    objetivos: [...tema.objetivos],
    explicacion: tema.explicacion.map(s => ({
      titulo: s.titulo,
      parrafo: s.parrafo,
      medios: desdeMedios(s.medios),
      conCaja: Boolean(s.caja),
      cajaTipo: s.caja?.tipo ?? 'ejemplo',
      cajaContenido: s.caja?.contenido ?? '',
    })),
    videos: tema.videos.map(v => ({
      titulo: v.titulo,
      subtitulo: v.subtitulo ?? '',
      // Al editar se muestra el identificador guardado, no un enlace armado:
      // es lo que efectivamente está en la base, y se puede volver a pegar un
      // enlace completo encima sin problema.
      enlace: v.youtubeId,
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
        medios: desdeMedios(e.medios),
        explicacion: e.explicacion,
        mediosExplicacion: desdeMedios(e.mediosExplicacion),
        puntos: e.puntos,
        respuestaLibre: e.tipo === 'libre' ? e.respuestaCorrecta : '',
        opciones: e.tipo === 'multiple' ? [...e.opciones] : ['', ''],
        correctasMultiple: e.tipo === 'multiple' ? [...e.respuestaCorrecta] : [],
        correctaSiNo: e.tipo === 'si-no' ? e.respuestaCorrecta : 'Sí',
      })),
    })),
    evaluaciones: tema.evaluaciones.map(ev => ({
      titulo: ev.titulo ?? '',
      dificultad: ev.dificultad ?? '',
      // Ausente en el contenido significa "sin reloj" / "ilimitados", y en el
      // formulario eso se representa con 0.
      tiempoLimiteMinutos: ev.tiempoLimiteMinutos ?? 0,
      intentos: ev.intentos ?? 0,
      preguntas: ev.preguntas.map(p => ({
        pregunta: p.pregunta,
        medios: desdeMedios(p.medios),
        opciones: [...p.opciones],
        respuestaCorrectaIndex: p.respuestaCorrectaIndex,
        explicacion: p.explicacion,
        mediosExplicacion: desdeMedios(p.mediosExplicacion),
      })),
    })),
  }
}

// --- Borrador → contenido para guardar ---------------------------------------

function ejercicioAGuardar(e: EjercicioBorrador, id: number) {
  const comun = {
    id,
    enunciado: e.enunciado,
    ...mediosAGuardar(e.medios),
    explicacion: e.explicacion,
    ...mediosExplicacionAGuardar(e.mediosExplicacion),
    puntos: e.puntos,
  }
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
    // Si lo pegado no es un enlace de YouTube reconocible, se manda tal cual y
    // Zod lo rechaza con un mensaje. Peor sería guardar algo vacío en silencio.
    youtubeId: idDeYouTube(v.enlace) ?? v.enlace,
    ...(v.subtitulo ? { subtitulo: v.subtitulo } : {}),
    ...(v.duracionLabel ? { duracionLabel: v.duracionLabel } : {}),
  }))

  return {
    objetivos: b.objetivos,
    videos,
    explicacion: b.explicacion.map(s => ({
      titulo: s.titulo,
      parrafo: s.parrafo,
      ...mediosAGuardar(s.medios),
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
      ...(ev.dificultad ? { dificultad: ev.dificultad } : {}),
      // El 0 del formulario significa "no puesto", y en el contenido eso se
      // representa con la ausencia del campo, no con un cero guardado: un
      // "tiempo límite: 0 minutos" sería un examen imposible.
      ...(ev.tiempoLimiteMinutos > 0 ? { tiempoLimiteMinutos: ev.tiempoLimiteMinutos } : {}),
      ...(ev.intentos > 0 ? { intentos: ev.intentos } : {}),
      preguntas: ev.preguntas.map((p, i) => ({
        id: i + 1,
        pregunta: p.pregunta,
        ...mediosAGuardar(p.medios),
        opciones: p.opciones,
        respuestaCorrectaIndex: p.respuestaCorrectaIndex,
        explicacion: p.explicacion,
        ...mediosExplicacionAGuardar(p.mediosExplicacion),
      })),
    })),
  }
}
