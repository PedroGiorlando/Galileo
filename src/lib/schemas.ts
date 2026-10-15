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

/**
 * Una imagen, un video o una animación que acompaña a un texto.
 *
 * En Física el dibujo no es un adorno: un ejercicio de diagrama de cuerpo libre
 * sin el diagrama no es un ejercicio.
 *
 * Las imágenes se suben al bucket `contenido` de Supabase y se guarda su
 * dirección. Los videos reusan lo de la lección: se guarda el identificador de
 * YouTube, no el enlace.
 *
 * `alt` es OBLIGATORIO. Es una línea que cuesta escribir y es la diferencia
 * entre que un alumno con lector de pantalla pueda resolver el ejercicio o no
 * pueda. Cuando la imagen ES el enunciado, no describirla es no dar el
 * enunciado.
 */
const masa = z
  .number({ error: 'Falta la masa (un número, en kg)' })
  .positive('Tiene que ser mayor que 0')
  .max(1000, 'Como mucho 1000 kg')

const coeficiente = z
  .number({ error: 'Tiene que ser un número' })
  .min(0, 'No puede ser negativo')
  .max(2, 'Un rozamiento mayor que 2 no aparece en ejercicios')
  .optional()

export const MedioSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('imagen'),
    url: z.string().url('Tiene que ser una dirección completa'),
    alt: z.string().trim().min(1, 'Describí qué se ve en la imagen').max(300),
  }),
  z.object({
    tipo: z.literal('video'),
    youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, 'No parece un identificador de YouTube'),
    segundo: z.number().int().min(0).optional(),
  }),
  /**
   * Se guardan los datos del ejercicio, no la animación: el componente dibuja
   * y calcula con ellos (ver src/lib/polea.ts). Si se carga un solo μ, vale
   * para los dos.
   */
  z
    .object({
      tipo: z.literal('polea-mesa'),
      m1: masa,
      m2: masa,
      muEstatico: coeficiente,
      muCinetico: coeficiente,
      gravedad: z.number({ error: 'Tiene que ser un número' }).min(1).max(20).optional(),
      mostrarValores: z.boolean().optional(),
    })
    .refine(
      p => p.muEstatico === undefined || p.muCinetico === undefined || p.muCinetico <= p.muEstatico,
      { message: 'μc no puede ser mayor que μe', path: ['muCinetico'] },
    ),
])

/**
 * Los medios van como campo OPCIONAL, no con `.default([])`.
 *
 * Parece contradecir la regla de más abajo —donde los defaults escondían
 * pérdida de datos— pero es al revés. Ahí el default tapaba un campo que ANTES
 * tenía contenido: una clase vieja pasaba la validación con la lista en cero y
 * el trabajo se perdía sin un solo error. Acá el campo no existió nunca, así
 * que ausente significa exactamente "esta clase no tiene imágenes", que es la
 * verdad. No hay nada que perder porque no había nada.
 */
const medios = z.array(MedioSchema).max(6, 'Como mucho 6 por bloque').optional()

export const SeccionExplicacionSchema = z.object({
  titulo: textoNoVacio,
  parrafo: textoNoVacio,
  medios,
  caja: z
    .object({
      tipo: z.enum(['ejemplo', 'tip', 'nota']),
      contenido: textoNoVacio,
    })
    .optional(),
})

/**
 * Un video de la lección.
 *
 * Se guarda el identificador de YouTube, no la dirección completa: el panel
 * acepta que se pegue el enlace en cualquier forma y extrae el identificador,
 * así el contenido no queda atado al formato de URL de hoy.
 *
 * ⚠ Un video no listado NO está protegido: quien tenga el enlace lo ve. Antes
 * de cobrar hay que revisarlo.
 */
export const VideoSchema = z.object({
  id: z.number().int().positive(),
  titulo: textoNoVacio,
  subtitulo: z.string().trim().max(200).optional(),
  youtubeId: z
    .string()
    .regex(/^[A-Za-z0-9_-]{11}$/, 'No parece un identificador de YouTube'),
  duracionLabel: z
    .string()
    .regex(/^\d{1,3}:\d{2}$/, 'Formato mm:ss')
    .optional(),
})

export const EjemploSchema = z.object({
  id: z.number().int().positive(),
  enunciado: textoNoVacio,
  pasos: z.array(textoNoVacio).min(1, 'Al menos un paso'),
  // Dónde se explica en video. El segundo permite saltar al momento exacto en
  // vez de dejar al alumno buscando en un video de veinte minutos.
  video: z
    .object({ videoId: z.number().int().positive(), segundo: z.number().int().min(0) })
    .optional(),
})

const camposComunesEjercicio = {
  id: z.number().int().positive(),
  enunciado: textoNoVacio,
  /** Acompañan al enunciado: el diagrama del problema, por ejemplo. */
  medios,
  explicacion: textoNoVacio,
  /**
   * Acompañan a la devolución, que se muestra recién después de responder.
   *
   * Van en un campo aparte y no mezclados con los del enunciado porque el
   * filtro de `publico.ts` los trata distinto: estos NO pueden viajar al
   * navegador antes de tiempo. Un dibujo con la resolución al lado del
   * enunciado sería la respuesta servida en bandeja.
   */
  mediosExplicacion: medios,
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
    medios,
    opciones: z.array(textoNoVacio).min(2, 'Al menos dos opciones'),
    respuestaCorrectaIndex: z.number().int().min(0),
    explicacion: textoNoVacio,
    mediosExplicacion: medios,
  })
  .refine(p => p.respuestaCorrectaIndex < p.opciones.length, {
    message: 'El índice de la respuesta correcta apunta fuera de las opciones',
    path: ['respuestaCorrectaIndex'],
  })

/**
 * Un trabajo práctico: un conjunto de ejercicios que se entregan juntos. Se
 * numeran por posición (TP 1, TP 2), así nadie tiene que llevar la cuenta.
 */
export const TrabajoPracticoSchema = z.object({
  titulo: z.string().trim().max(160).optional(),
  ejercicios: z.array(EjercicioSchema).min(1, 'Al menos un ejercicio'),
})

/**
 * Una evaluación: preguntas de opción múltiple que se rinden juntas.
 *
 * Los tres campos nuevos son lo que el alumno ve ANTES de empezar, para que
 * sepa a qué se está metiendo, y lo que define las reglas del intento.
 *
 * Todos opcionales, y su ausencia significa algo concreto y sensato:
 *
 *   sin dificultad            no se muestra la etiqueta
 *   sin tiempoLimiteMinutos   se rinde sin reloj
 *   sin intentos              se puede rendir las veces que se quiera
 *
 * OJO: el tiempo límite acá es solo el dato. Un reloj en el navegador se pausa
 * con las herramientas de desarrollo y se reinicia recargando la página; para
 * que sea un límite de verdad, el servidor tiene que registrar cuándo empezó el
 * intento y verificarlo al entregar. Eso es la tabla de intentos, que todavía
 * no existe. Hasta entonces el reloj es orientativo, y así hay que decírselo al
 * alumno.
 */
export const EvaluacionSchema = z.object({
  titulo: z.string().trim().max(160).optional(),
  dificultad: z.enum(['Básico', 'Intermedio', 'Avanzado']).optional(),
  tiempoLimiteMinutos: z.number().int().min(1).max(300).optional(),
  intentos: z.number().int().min(1).max(20).optional(),
  preguntas: z.array(PreguntaQuizSchema).min(1, 'Al menos una pregunta'),
})

/** Lo que va a la columna `contenido jsonb` de la tabla `clases`. */
// Las tres listas son obligatorias aunque puedan estar vacías, y NO llevan
// .default([]): con un default, un contenido viejo que todavía tuviera
// `ejercicios` y `quiz` pasaría la validación con las listas nuevas en cero, o
// sea perdiendo todo sin un solo error. Mejor que falle fuerte y se vea.
export const TemaContenidoSchema = z.object({
  objetivos: z.array(textoNoVacio).min(1),
  videos: z.array(VideoSchema),
  explicacion: z.array(SeccionExplicacionSchema).min(1),
  ejemplos: z.array(EjemploSchema).min(1),
  practicos: z.array(TrabajoPracticoSchema),
  evaluaciones: z.array(EvaluacionSchema),
})

/**
 * Los campos que en la base son columnas propias, no parte del jsonb.
 *
 * Sin `videoUrl`: los videos viven dentro del contenido desde que una clase
 * puede tener varios. Mientras ese campo sobrevivió acá, la acción de guardar
 * intentaba escribir una columna que la migración 004 ya había borrado, y el
 * primer guardado desde el panel habría fallado.
 */
export const TemaMetaSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones'),
  titulo: textoNoVacio,
  // Va bajo el título de la clase y en la columna Contenido del temario.
  descripcion: z.string().trim().max(200, 'Máximo 200 caracteres'),
  categoria: textoNoVacio,
  orden: z.number().int().positive(),
  duracionLabel: z.string().regex(/^\d{1,2}:\d{2}$/, 'Formato mm:ss'),
  gratis: z.boolean(),
  publicado: z.boolean(),
})

/*
 * --- Guardar sin publicar ----------------------------------------------------
 *
 * Escribir una clase lleva horas y no se hace de una sentada. Si guardar
 * exigiera todo completo, la única forma de no perder lo escrito sería
 * terminarlo entero de un tirón, o inventar objetivos y ejemplos de relleno
 * para que el formulario deje pasar — que es peor, porque después ese relleno
 * se publica.
 *
 * Entonces: sin publicar se guarda lo que haya. Al publicar se exige todo.
 * La validación estricta no desaparece, se mueve al momento en que importa.
 *
 * Lo que NO se relaja nunca es el `slug`: es la dirección de la página y la
 * clave por la que se busca la clase para actualizarla.
 */

/** La ficha de una clase que todavía no se publica. */
export const TemaMetaBorradorSchema = TemaMetaSchema.extend({
  titulo: z.string(),
  categoria: z.string(),
  // El caso concreto que motivó todo esto: no se sabe cuánto dura la clase
  // hasta que están todos los videos, y sin esto no se podía guardar nada.
  duracionLabel: z.string(),
})

/**
 * El contenido de un borrador: solo se revisa la FORMA, no lo que hay adentro.
 *
 * Las seis listas tienen que existir y ser listas. Lo de adentro se revisa
 * recién al publicar, con TemaContenidoSchema.
 *
 * No es "no validar nada": esta acción es un endpoint HTTP, y sin esto se
 * podría dejar cualquier cosa guardada en la columna. El tope de elementos
 * está por lo mismo, para que nadie deje un bloque de cincuenta megas.
 */
const listaLibre = z.array(z.unknown()).max(200).default([])

export const TemaContenidoBorradorSchema = z.object({
  objetivos: listaLibre,
  videos: listaLibre,
  explicacion: listaLibre,
  ejemplos: listaLibre,
  practicos: listaLibre,
  evaluaciones: listaLibre,
})

/**
 * Leer contenido guardado sin exigir que esté completo.
 *
 * Es la contracara de la regla de arriba, y hay que tener clarísimo cuál va en
 * cada lado: al GUARDAR una clase publicada se exige todo, al LEER hay que
 * poder abrir cualquier cosa. Si leer fuera estricto, un borrador a medias
 * sería imposible de reabrir y de corregir.
 *
 * Con `.parse()` esto lanzaba excepción y dejaba la pantalla de evaluaciones
 * cargando para siempre: el profesor miraba su borrador desde la vista previa,
 * el servidor reventaba al leerlo, y desde afuera parecía que la página se
 * colgó.
 *
 * Estaba escrita tres veces en tres archivos. Va una sola, acá, donde además
 * se puede probar sin arrastrar la base ni las cookies.
 */
export function normalizarContenido(bruto: unknown): TemaContenido {
  const r = TemaContenidoSchema.safeParse(bruto)
  if (r.success) return r.data

  // Lo que falte queda vacío; lo que haya pasa tal cual. Lo que se use
  // después —una evaluación, un ejercicio— se valida donde se usa, así el
  // mensaje habla de eso y no de toda la clase.
  return {
    objetivos: [],
    videos: [],
    explicacion: [],
    ejemplos: [],
    practicos: [],
    evaluaciones: [],
    ...(bruto && typeof bruto === 'object' ? bruto : {}),
  }
}

export type SeccionExplicacion = z.infer<typeof SeccionExplicacionSchema>
export type Ejemplo = z.infer<typeof EjemploSchema>
export type Ejercicio = z.infer<typeof EjercicioSchema>
export type EjercicioLibre = Extract<Ejercicio, { tipo: 'libre' }>
export type EjercicioMultiple = Extract<Ejercicio, { tipo: 'multiple' }>
export type EjercicioSiNo = Extract<Ejercicio, { tipo: 'si-no' }>
export type Medio = z.infer<typeof MedioSchema>
export type MedioPolea = Extract<Medio, { tipo: 'polea-mesa' }>
export type PreguntaQuiz = z.infer<typeof PreguntaQuizSchema>
export type Video = z.infer<typeof VideoSchema>
export type TrabajoPractico = z.infer<typeof TrabajoPracticoSchema>
export type Evaluacion = z.infer<typeof EvaluacionSchema>
export type TemaContenido = z.infer<typeof TemaContenidoSchema>
export type TemaMeta = z.infer<typeof TemaMetaSchema>
