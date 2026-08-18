import { z } from 'zod'

/**
 * Fuente de verdad de la forma del contenido de un tema.
 *
 * Antes esto eran `interface` en topicData.ts. Una interface desaparece al
 * compilar: no valida nada en runtime. Cuando el contenido venga de la base
 * (cargado a mano desde el panel), necesitamos rechazar lo que está mal ANTES
 * de guardarlo. Zod valida de verdad y además genera el tipo con z.infer, así
 * que no hay dos definiciones que se puedan desincronizar.
 *
 * Los mínimos son laxos a propósito (min(1), no exactamente 3/5/10): la
 * plantilla de contenido dice cuántos van, el schema solo evita lo roto.
 */

const textoNoVacio = z.string().trim().min(1, 'No puede estar vacío')

export const SeccionExplicacionSchema = z.object({
  titulo: textoNoVacio,
  parrafo: textoNoVacio,
  caja: z
    .object({
      tipo: z.enum(['ejemplo', 'tip', 'nota']),
      contenido: textoNoVacio,
    })
    .optional(),
})

export const EjemploSchema = z.object({
  id: z.number().int().positive(),
  enunciado: textoNoVacio,
  pasos: z.array(textoNoVacio).min(1, 'Al menos un paso'),
})

const camposComunesEjercicio = {
  id: z.number().int().positive(),
  enunciado: textoNoVacio,
  explicacion: textoNoVacio,
  puntos: z.number().int().min(1).max(3),
}

export const EjercicioSchema = z.discriminatedUnion('tipo', [
  z.object({
    ...camposComunesEjercicio,
    tipo: z.literal('libre'),
    respuestaCorrecta: textoNoVacio,
  }),
  z
    .object({
      ...camposComunesEjercicio,
      tipo: z.literal('multiple'),
      opciones: z.array(textoNoVacio).min(2, 'Al menos dos opciones'),
      respuestaCorrecta: z.array(textoNoVacio).min(1, 'Al menos una correcta'),
    })
    // El error más fácil de cometer cargando contenido a mano: marcar como
    // correcta una opción que no está escrita igual en la lista de opciones.
    // Sin esto el ejercicio queda imposible de acertar y nadie se entera.
    .refine(e => e.respuestaCorrecta.every(r => e.opciones.includes(r)), {
      message: 'Cada respuesta correcta tiene que estar entre las opciones',
      path: ['respuestaCorrecta'],
    }),
  z.object({
    ...camposComunesEjercicio,
    tipo: z.literal('si-no'),
    respuestaCorrecta: z.enum(['Sí', 'No']),
  }),
])

export const PreguntaQuizSchema = z
  .object({
    id: z.number().int().positive(),
    pregunta: textoNoVacio,
    opciones: z.array(textoNoVacio).min(2, 'Al menos dos opciones'),
    respuestaCorrectaIndex: z.number().int().min(0),
    explicacion: textoNoVacio,
  })
  .refine(p => p.respuestaCorrectaIndex < p.opciones.length, {
    message: 'El índice de la respuesta correcta apunta fuera de las opciones',
    path: ['respuestaCorrectaIndex'],
  })

/** Lo que va a la columna `contenido jsonb` de la tabla `temas`. */
export const TemaContenidoSchema = z.object({
  objetivos: z.array(textoNoVacio).min(1),
  explicacion: z.array(SeccionExplicacionSchema).min(1),
  ejemplos: z.array(EjemploSchema).min(1),
  ejercicios: z.array(EjercicioSchema).min(1),
  quiz: z.array(PreguntaQuizSchema).min(1),
})

/** Los campos que en la base son columnas propias, no parte del jsonb. */
export const TemaMetaSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones'),
  titulo: textoNoVacio,
  categoria: textoNoVacio,
  orden: z.number().int().positive(),
  duracionLabel: z.string().regex(/^\d{1,2}:\d{2}$/, 'Formato mm:ss'),
  videoUrl: z.union([z.literal(''), z.url()]).optional(),
  gratis: z.boolean(),
  publicado: z.boolean(),
})

export type SeccionExplicacion = z.infer<typeof SeccionExplicacionSchema>
export type Ejemplo = z.infer<typeof EjemploSchema>
export type Ejercicio = z.infer<typeof EjercicioSchema>
export type EjercicioLibre = Extract<Ejercicio, { tipo: 'libre' }>
export type EjercicioMultiple = Extract<Ejercicio, { tipo: 'multiple' }>
export type EjercicioSiNo = Extract<Ejercicio, { tipo: 'si-no' }>
export type PreguntaQuiz = z.infer<typeof PreguntaQuizSchema>
export type TemaContenido = z.infer<typeof TemaContenidoSchema>
export type TemaMeta = z.infer<typeof TemaMetaSchema>
