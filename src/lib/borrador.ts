import type { SubtemaCompleto } from '@/data/topicData'
import type { TemaMeta } from './schemas'

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

export interface ContenidoBorrador {
  objetivos: string[]
  explicacion: SeccionBorrador[]
  ejemplos: EjemploBorrador[]
  ejercicios: EjercicioBorrador[]
  quiz: PreguntaBorrador[]
}

// --- Ítems vacíos, para los botones "agregar" ---------------------------------

export const seccionVacia = (): SeccionBorrador => ({
  titulo: '',
  parrafo: '',
  conCaja: false,
  cajaTipo: 'ejemplo',
  cajaContenido: '',
})

export const ejemploVacio = (): EjemploBorrador => ({ enunciado: '', pasos: ['', '', ''] })

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

export const contenidoVacio = (): ContenidoBorrador => ({
  objetivos: [''],
  explicacion: [seccionVacia()],
  ejemplos: [ejemploVacio()],
  ejercicios: [ejercicioVacio()],
  quiz: [preguntaVacia()],
})

// --- Subtema guardado → borrador ------------------------------------------------

export function metaDesdeTema(tema: SubtemaCompleto): TemaMeta {
  return {
    slug: tema.slug,
    titulo: tema.titulo,
    categoria: tema.categoria,
    orden: tema.id,
    duracionLabel: tema.duracionLabel,
    videoUrl: '',
    gratis: true,
    publicado: true,
  }
}

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
    ejemplos: tema.ejemplos.map(e => ({ enunciado: e.enunciado, pasos: [...e.pasos] })),
    ejercicios: tema.ejercicios.map(e => ({
      tipo: e.tipo,
      enunciado: e.enunciado,
      explicacion: e.explicacion,
      puntos: e.puntos,
      respuestaLibre: e.tipo === 'libre' ? e.respuestaCorrecta : '',
      opciones: e.tipo === 'multiple' ? [...e.opciones] : ['', ''],
      correctasMultiple: e.tipo === 'multiple' ? [...e.respuestaCorrecta] : [],
      correctaSiNo: e.tipo === 'si-no' ? e.respuestaCorrecta : 'Sí',
    })),
    quiz: tema.quiz.map(p => ({
      pregunta: p.pregunta,
      opciones: [...p.opciones],
      respuestaCorrectaIndex: p.respuestaCorrectaIndex,
      explicacion: p.explicacion,
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
  return {
    objetivos: b.objetivos,
    explicacion: b.explicacion.map(s => ({
      titulo: s.titulo,
      parrafo: s.parrafo,
      ...(s.conCaja ? { caja: { tipo: s.cajaTipo, contenido: s.cajaContenido } } : {}),
    })),
    ejemplos: b.ejemplos.map((e, i) => ({ id: i + 1, enunciado: e.enunciado, pasos: e.pasos })),
    ejercicios: b.ejercicios.map((e, i) => ejercicioAGuardar(e, i + 1)),
    quiz: b.quiz.map((p, i) => ({
      id: i + 1,
      pregunta: p.pregunta,
      opciones: p.opciones,
      respuestaCorrectaIndex: p.respuestaCorrectaIndex,
      explicacion: p.explicacion,
    })),
  }
}
