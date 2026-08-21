import type {
  Ejemplo,
  Evaluacion,
  SeccionExplicacion,
  TrabajoPractico,
  Video,
} from '@/lib/schemas'

// Los tipos del contenido viven en lib/schemas.ts, derivados del schema Zod que
// los valida en runtime. Se re-exportan desde acá para que los componentes que
// ya los importaban de este archivo no tengan que cambiar.
export type {
  Ejemplo,
  Ejercicio,
  EjercicioLibre,
  EjercicioMultiple,
  EjercicioSiNo,
  Evaluacion,
  PreguntaQuiz,
  SeccionExplicacion,
  TemaContenido,
  TrabajoPractico,
  Video,
} from '@/lib/schemas'

/**
 * Forma plana de una clase: metadatos y contenido al mismo nivel, que es como
 * la consumen los componentes. En la base el contenido va en una columna jsonb;
 * la capa de datos lo aplana al leer para que los componentes no se enteren.
 */
export interface SubtemaCompleto {
  id: number
  slug: string
  titulo: string
  descripcion: string | null
  duracionLabel: string
  objetivos: string[]
  videos: Video[]
  explicacion: SeccionExplicacion[]
  ejemplos: Ejemplo[]
  practicos: TrabajoPractico[]
  evaluaciones: Evaluacion[]
}

/**
 * Contenido de arranque: una clase real de Física, cargada una vez desde el
 * panel para que haya algo publicado y para que sirva de vara de calidad.
 *
 * No es contenido de relleno: es el ejemplo de lo que tiene que ser una clase
 * terminada. Los profesores que carguen su materia deberían poder mirar esto y
 * saber cuánto detalle se espera.
 */
export const tema: SubtemaCompleto = {
  id: 5,
  slug: 'suma-de-vectores-por-componentes',
  titulo: 'Suma de vectores por componentes',
  descripcion:
    'Aprendé a sumar vectores trabajando con sus componentes, sin regla ni transportador.',
  duracionLabel: '12:40',
  objetivos: [
    'Descomponer un vector en sus componentes rectangulares.',
    'Sumar varios vectores trabajando con sus componentes.',
    'Calcular el módulo y la dirección del vector resultante.',
    'Reconocer cuándo conviene el método analítico y cuándo el gráfico.',
  ],
  // Todavía sin video: se cargan desde el panel cuando estén grabados.
  videos: [],
  explicacion: [
    {
      titulo: '¿Por qué descomponer un vector?',
      parrafo:
        'Sumar vectores con regla y transportador funciona, pero la precisión depende del pulso. El método analítico cambia el problema: en vez de sumar flechas, se suman números. Cada vector se reemplaza por dos vectores perpendiculares —uno horizontal y uno vertical— que juntos producen el mismo efecto.',
      caja: {
        tipo: 'nota',
        contenido:
          'Las componentes no son "partes" del vector: son dos vectores que, sumados, dan exactamente el original. Por eso se puede reemplazar uno por los otros dos sin cambiar nada del problema.',
      },
    },
    {
      titulo: 'Cómo se calculan las componentes',
      parrafo:
        'Si un vector de módulo F forma un ángulo α con el eje x medido en sentido antihorario, sus componentes salen directo de las razones trigonométricas del triángulo rectángulo que forma con los ejes.',
      caja: {
        tipo: 'ejemplo',
        contenido:
          'Fx = F · cos α\nFy = F · sen α\n\nPara F = 50 N y α = 30°:\nFx = 50 · cos 30° = 50 · 0,866 = 43,3 N\nFy = 50 · sen 30° = 50 · 0,500 = 25,0 N',
      },
    },
    {
      titulo: 'De las componentes al vector resultante',
      parrafo:
        'Una vez que todos los vectores están descompuestos, se suman por separado todas las componentes en x y todas las componentes en y. Esas dos sumas son las componentes de la resultante, y de ahí se recupera su módulo con Pitágoras y su ángulo con la arcotangente.',
      caja: {
        tipo: 'tip',
        contenido:
          'Cuidado con el signo: hacia la izquierda y hacia abajo las componentes son negativas. Es el error más común, y hace que el resultado dé bien en módulo pero apunte al cuadrante equivocado.',
      },
    },
  ],
  ejemplos: [
    {
      id: 1,
      enunciado:
        'Descomponer una fuerza de 80 N que forma un ángulo de 60° con el eje x positivo.',
      pasos: [
        'Identificamos los datos: F = 80 N y α = 60°. Como el ángulo se mide desde el eje x positivo en sentido antihorario, ambas componentes van a ser positivas.',
        'Aplicamos las fórmulas: Fx = 80 · cos 60° = 80 · 0,500 = 40,0 N y Fy = 80 · sen 60° = 80 · 0,866 = 69,3 N.',
        'Verificamos con Pitágoras que las componentes reconstruyan el vector: √(40,0² + 69,3²) = √(1600 + 4802) = √6402 ≈ 80,0 N. Coincide con el módulo original.',
      ],
    },
    {
      id: 2,
      enunciado:
        'Sumar dos fuerzas: F₁ = 30 N a 0° y F₂ = 40 N a 90°. Calcular el módulo y la dirección de la resultante.',
      pasos: [
        'Descomponemos cada una. F₁ está sobre el eje x: F₁x = 30 N, F₁y = 0 N. F₂ está sobre el eje y: F₂x = 0 N, F₂y = 40 N.',
        'Sumamos por eje: Rx = 30 + 0 = 30 N y Ry = 0 + 40 = 40 N.',
        'Calculamos el módulo con Pitágoras: R = √(30² + 40²) = √2500 = 50 N. Y la dirección: α = arctg(40/30) = arctg(1,333) = 53,1° respecto del eje x.',
      ],
    },
    {
      id: 3,
      enunciado:
        'Sumar F₁ = 25 N a 40° y F₂ = 35 N a 160°. Prestar atención a los signos.',
      pasos: [
        'Descomponemos F₁: F₁x = 25 · cos 40° = 19,2 N y F₁y = 25 · sen 40° = 16,1 N. Las dos positivas, porque 40° cae en el primer cuadrante.',
        'Descomponemos F₂: F₂x = 35 · cos 160° = −32,9 N y F₂y = 35 · sen 160° = 12,0 N. La componente en x es negativa porque 160° cae en el segundo cuadrante y el vector apunta hacia la izquierda.',
        'Sumamos por eje: Rx = 19,2 − 32,9 = −13,7 N y Ry = 16,1 + 12,0 = 28,1 N. El módulo es R = √(13,7² + 28,1²) = √(187,7 + 789,6) = √977,3 ≈ 31,3 N, y como Rx es negativo y Ry positivo, la resultante apunta al segundo cuadrante: α ≈ 116,0°.',
      ],
    },
  ],
  practicos: [
    {
      titulo: 'Componentes y resultante',
      ejercicios: [
    {
      id: 1,
      tipo: 'libre',
      enunciado:
        'Una fuerza de 100 N forma 30° con el eje x. Escribí sus componentes Fx y Fy en newtons, separadas por coma y redondeadas a un decimal (primero Fx, después Fy).',
      respuestaCorrecta: '86.6,50.0',
      explicacion:
        'Fx = 100 · cos 30° = 86,6 N y Fy = 100 · sen 30° = 50,0 N. Si te dio al revés, revisá cuál razón va con cada eje: el coseno acompaña al eje x.',
      puntos: 2,
    },
    {
      id: 2,
      tipo: 'multiple',
      enunciado:
        '¿Cuáles de estas afirmaciones sobre las componentes de un vector son correctas?',
      opciones: [
        'La componente en x se calcula con el coseno del ángulo.',
        'Las componentes siempre son positivas.',
        'El módulo de la resultante se obtiene con el teorema de Pitágoras.',
        'Un vector sobre el eje y tiene componente en x igual a cero.',
      ],
      respuestaCorrecta: [
        'La componente en x se calcula con el coseno del ángulo.',
        'El módulo de la resultante se obtiene con el teorema de Pitágoras.',
        'Un vector sobre el eje y tiene componente en x igual a cero.',
      ],
      explicacion:
        'Las componentes pueden ser negativas: dependen del cuadrante. Un vector que apunta hacia la izquierda tiene componente en x negativa.',
      puntos: 2,
    },
    {
      id: 3,
      tipo: 'libre',
      enunciado:
        'Dos fuerzas perpendiculares de 60 N y 80 N actúan sobre un cuerpo. ¿Cuál es el módulo de la resultante, en newtons?',
      respuestaCorrecta: '100',
      explicacion:
        'Al ser perpendiculares, R = √(60² + 80²) = √(3600 + 6400) = √10000 = 100 N. Es el triángulo 3-4-5 multiplicado por 20.',
      puntos: 2,
    },
    {
      id: 4,
      tipo: 'si-no',
      enunciado:
        'Una fuerza que forma 120° con el eje x positivo, ¿tiene componente en x negativa?',
      respuestaCorrecta: 'Sí',
      explicacion:
        '120° cae en el segundo cuadrante, donde el coseno es negativo: cos 120° = −0,5. El vector apunta hacia la izquierda, así que su componente en x es negativa.',
      puntos: 1,
    },
    {
      id: 5,
      tipo: 'multiple',
      enunciado:
        '¿En cuál de estos casos NO conviene usar el método por componentes?',
      opciones: [
        'Cuando hay que sumar cinco o más vectores.',
        'Cuando los vectores son perpendiculares entre sí.',
        'Cuando solo se necesita una estimación rápida y aproximada.',
        'Cuando se pide el resultado con dos decimales.',
      ],
      respuestaCorrecta: ['Cuando solo se necesita una estimación rápida y aproximada.'],
      explicacion:
        'El método analítico es más preciso pero más lento. Para una estimación rápida alcanza con dibujar los vectores y sumarlos gráficamente. En todos los otros casos el método por componentes es el que conviene.',
      puntos: 1,
        },
      ],
    },
  ],
  evaluaciones: [
    {
      titulo: 'Vectores: componentes y suma',
      preguntas: [
    {
      id: 1,
      pregunta: '¿Cuál es la componente en x de una fuerza de 40 N que forma 60° con el eje x?',
      opciones: ['20 N', '34,6 N', '40 N', '69,3 N'],
      respuestaCorrectaIndex: 0,
      explicacion: 'Fx = 40 · cos 60° = 40 · 0,5 = 20 N.',
    },
    {
      id: 2,
      pregunta: '¿Cuál es la componente en y de esa misma fuerza de 40 N a 60°?',
      opciones: ['20 N', '34,6 N', '40 N', '46,2 N'],
      respuestaCorrectaIndex: 1,
      explicacion: 'Fy = 40 · sen 60° = 40 · 0,866 = 34,6 N.',
    },
    {
      id: 3,
      pregunta: 'Si Rx = 9 N y Ry = 12 N, ¿cuál es el módulo de la resultante?',
      opciones: ['15 N', '21 N', '10,5 N', '3 N'],
      respuestaCorrectaIndex: 0,
      explicacion: 'R = √(9² + 12²) = √(81 + 144) = √225 = 15 N.',
    },
    {
      id: 4,
      pregunta: 'Un vector apunta hacia abajo y a la derecha. ¿Qué signos tienen sus componentes?',
      opciones: [
        'Rx positiva, Ry negativa',
        'Rx negativa, Ry positiva',
        'Las dos positivas',
        'Las dos negativas',
      ],
      respuestaCorrectaIndex: 0,
      explicacion:
        'Hacia la derecha es x positivo; hacia abajo es y negativo. Por eso Rx > 0 y Ry < 0.',
    },
    {
      id: 5,
      pregunta: '¿Cuál es la componente en y de un vector que está sobre el eje x?',
      opciones: ['Igual a su módulo', 'Cero', 'La mitad de su módulo', 'Depende del sentido'],
      respuestaCorrectaIndex: 1,
      explicacion:
        'Si está sobre el eje x, el ángulo es 0° (o 180°) y sen 0° = 0, así que la componente en y vale cero.',
    },
    {
      id: 6,
      pregunta: 'Dos fuerzas de 50 N cada una forman entre sí un ángulo de 90°. ¿La resultante vale?',
      opciones: ['100 N', '70,7 N', '50 N', '25 N'],
      respuestaCorrectaIndex: 1,
      explicacion: 'R = √(50² + 50²) = √5000 = 70,7 N. No se suman los módulos: no son colineales.',
    },
    {
      id: 7,
      pregunta: '¿Con qué operación se recupera el ángulo de la resultante a partir de Rx y Ry?',
      opciones: [
        'arctg(Ry / Rx)',
        'arcsen(Rx / Ry)',
        'arccos(Ry / Rx)',
        'Rx · Ry',
      ],
      respuestaCorrectaIndex: 0,
      explicacion:
        'La tangente del ángulo es el cateto opuesto sobre el adyacente, es decir Ry/Rx. El ángulo sale con la arcotangente.',
    },
    {
      id: 8,
      pregunta:
        'Al sumar tres vectores por componentes, ¿cuántas sumas hay que hacer antes de aplicar Pitágoras?',
      opciones: ['Una', 'Dos', 'Tres', 'Seis'],
      respuestaCorrectaIndex: 1,
      explicacion:
        'Dos: una para todas las componentes en x y otra para todas las componentes en y. No importa cuántos vectores haya.',
    },
    {
      id: 9,
      pregunta: '¿Cuál de estas afirmaciones es correcta?',
      opciones: [
        'El módulo de la resultante nunca puede ser menor que el de uno de los vectores sumados.',
        'El módulo de la resultante es siempre la suma de los módulos.',
        'Dos vectores opuestos de igual módulo dan resultante nula.',
        'Las componentes de un vector son siempre menores que 1.',
      ],
      respuestaCorrectaIndex: 2,
      explicacion:
        'Si tienen igual módulo y sentidos opuestos, sus componentes se cancelan y la resultante es cero. Ese caso también muestra que la resultante sí puede ser menor que cada vector.',
    },
    {
      id: 10,
      pregunta:
        'Una fuerza de 20 N a 180° y otra de 12 N a 0° actúan sobre un cuerpo. ¿Cuál es la resultante?',
      opciones: ['32 N hacia la derecha', '8 N hacia la izquierda', '8 N hacia la derecha', '32 N hacia la izquierda'],
      respuestaCorrectaIndex: 1,
      explicacion:
        'Son colineales y opuestas: Rx = −20 + 12 = −8 N. El signo negativo indica que apunta hacia la izquierda.',
        },
      ],
    },
  ],
}
