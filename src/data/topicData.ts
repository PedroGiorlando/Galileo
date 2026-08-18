import type {
  Ejemplo,
  Ejercicio,
  PreguntaQuiz,
  SeccionExplicacion,
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
  PreguntaQuiz,
  SeccionExplicacion,
  TemaContenido,
} from '@/lib/schemas'

/**
 * Forma plana del tema: metadatos y contenido al mismo nivel, que es como lo
 * consumen los componentes. En la base el contenido va en una columna jsonb; la
 * capa de datos lo aplana al leer ({ ...fila, ...fila.contenido }) para que los
 * componentes no se enteren de la diferencia.
 */
export interface SubtemaCompleto {
  id: number
  slug: string
  titulo: string
  grado: string
  gradoSlug: string
  materia: string
  materiaSlug: string
  categoria: string
  duracionLabel: string
  objetivos: string[]
  explicacion: SeccionExplicacion[]
  ejemplos: Ejemplo[]
  ejercicios: Ejercicio[]
  quiz: PreguntaQuiz[]
}

export const tema: SubtemaCompleto = {
  id: 7,
  slug: 'multiplos-y-divisores',
  titulo: 'Múltiplos y divisores',
  grado: '4° Grado',
  gradoSlug: '4-grado',
  materia: 'Matemática',
  materiaSlug: 'matematica',
  categoria: 'Números y Operaciones',
  duracionLabel: '10:15',
  objetivos: [
    'Qué son los múltiplos y cómo encontrarlos.',
    'Qué son los divisores y cómo identificarlos.',
    'Relación entre múltiplos y divisores.',
    'Ejercicios prácticos y ejemplos.',
  ],
  explicacion: [
    {
      titulo: '¿Qué son los múltiplos?',
      parrafo:
        'Los múltiplos de un número son todos los resultados que obtenemos al multiplicar ese número por 0, 1, 2, 3, 4, 5, ...',
      caja: {
        tipo: 'ejemplo',
        contenido:
          'Múltiplos de 6:\n6×0=0  6×1=6  6×2=12  6×3=18  6×4=24 ...\nPor lo tanto, los múltiplos de 6 son: 0, 6, 12, 18, 24, 30, 36, 42, 48, ...',
      },
    },
    {
      titulo: '¿Qué son los divisores?',
      parrafo:
        'Los divisores de un número son los números que lo dividen en forma exacta, es decir, sin dejar resto.',
      caja: {
        tipo: 'ejemplo',
        contenido:
          'Divisores de 12:\nLos números que dividen a 12 sin dejar resto son: 1, 2, 3, 4, 6, 12',
      },
    },
    {
      titulo: 'Relación entre múltiplos y divisores',
      parrafo: 'Si un número es múltiplo de otro, entonces ese otro número es divisor del primero.',
      caja: {
        tipo: 'ejemplo',
        contenido: '12 es múltiplo de 3 porque 12 = 3×4.\nPor lo tanto, 3 es divisor de 12.',
      },
    },
  ],
  ejemplos: [
    {
      id: 1,
      enunciado: 'Escribir los 10 primeros múltiplos de 8.',
      pasos: [
        'Multiplicamos 8 por los números naturales desde 0 hasta 9.',
        '8×0=0  8×1=8  8×2=16  8×3=24  8×4=32  8×5=40  8×6=48  8×7=56  8×8=64  8×9=72',
        'Los 10 primeros múltiplos de 8 son: 0, 8, 16, 24, 32, 40, 48, 56, 64, 72',
      ],
    },
    {
      id: 2,
      enunciado: 'Encontrar los divisores de 24.',
      pasos: [
        'Buscamos los números que dividen a 24 en forma exacta (resto 0).',
        '24÷1=24  24÷2=12  24÷3=8  24÷4=6  24÷6=4  24÷8=3  24÷12=2  24÷24=1',
        'Los divisores de 24 son: 1, 2, 3, 4, 6, 8, 12, 24',
      ],
    },
    {
      id: 3,
      enunciado: '¿Es 15 múltiplo de 3? ¿Y 3 divisor de 15?',
      pasos: [
        'Para saber si 15 es múltiplo de 3: 15÷3=5, resto 0 → como el resto es 0, 15 es múltiplo de 3.',
        'Para saber si 3 es divisor de 15: 15÷3=5, resto 0 → como el resto es 0, 3 es divisor de 15.',
        'Múltiplo y divisor son dos caras de la misma relación: 15 es múltiplo de 3 y, al mismo tiempo, 3 es divisor de 15.',
      ],
    },
  ],
  ejercicios: [
    {
      id: 1,
      tipo: 'libre',
      enunciado: 'Escribí los 8 primeros múltiplos de 7 (empezando en 0).',
      respuestaCorrecta: '0,7,14,21,28,35,42,49',
      explicacion: 'Se multiplica 7 por 0,1,2,3,4,5,6 y 7: 0, 7, 14, 21, 28, 35, 42, 49.',
      puntos: 2,
    },
    {
      id: 2,
      tipo: 'multiple',
      enunciado: '¿Cuáles de estos números son múltiplos de 6? 12 - 18 - 20 - 24 - 33 - 36',
      opciones: ['12', '18', '20', '24', '33', '36'],
      respuestaCorrecta: ['12', '18', '24', '36'],
      explicacion: '12, 18, 24 y 36 son múltiplos de 6 (6×2, 6×3, 6×4, 6×6). 20 y 33 no lo son.',
      puntos: 2,
    },
    {
      id: 3,
      tipo: 'libre',
      enunciado: 'Escribí todos los divisores de 30.',
      respuestaCorrecta: '1,2,3,5,6,10,15,30',
      explicacion: 'Los números que dividen a 30 sin dejar resto son: 1, 2, 3, 5, 6, 10, 15, 30.',
      puntos: 2,
    },
    {
      id: 4,
      tipo: 'si-no',
      enunciado: '¿Es 84 múltiplo de 12?',
      respuestaCorrecta: 'Sí',
      explicacion: '84÷12=7, resto 0. Como el resto es 0, 84 sí es múltiplo de 12.',
      puntos: 1,
    },
    {
      id: 5,
      tipo: 'multiple',
      enunciado: '¿Cuál de estos números NO es divisor de 40? 2 - 4 - 5 - 6 - 8 - 10',
      opciones: ['2', '4', '5', '6', '8', '10'],
      respuestaCorrecta: ['6'],
      explicacion: 'Los divisores de 40 son 1, 2, 4, 5, 8, 10, 20, 40. El 6 no es divisor de 40 (40÷6 no es exacto).',
      puntos: 1,
    },
  ],
  quiz: [
    {
      id: 1,
      pregunta: '¿Cuál de estos números es múltiplo de 8?',
      opciones: ['18', '24', '30', '45'],
      respuestaCorrectaIndex: 1,
      explicacion: '24 es múltiplo de 8 porque 8×3=24.',
    },
    {
      id: 2,
      pregunta: '¿Cuál de estos números NO es múltiplo de 5?',
      opciones: ['25', '40', '52', '60'],
      respuestaCorrectaIndex: 2,
      explicacion: '52 no es múltiplo de 5: no termina en 0 ni en 5.',
    },
    {
      id: 3,
      pregunta: '¿Cuáles son los divisores de 18?',
      opciones: ['1, 2, 3, 6, 9, 18', '1, 2, 4, 6, 9, 18', '1, 3, 6, 9, 12, 18', '1, 2, 3, 6, 9, 12'],
      respuestaCorrectaIndex: 0,
      explicacion: 'Los divisores de 18 son 1, 2, 3, 6, 9 y 18.',
    },
    {
      id: 4,
      pregunta: '¿Es 45 divisor de 135?',
      opciones: ['Sí, es divisor exacto', 'No, sobra resto', 'Depende del contexto', 'No se puede saber'],
      respuestaCorrectaIndex: 0,
      explicacion: '135÷45=3, resto 0. Como el resto es 0, 45 es divisor de 135.',
    },
    {
      id: 5,
      pregunta: '¿Cuál es el primer múltiplo de 9 mayor que 50?',
      opciones: ['45', '54', '60', '63'],
      respuestaCorrectaIndex: 1,
      explicacion: '9×5=45 (no supera 50). 9×6=54, que sí supera 50 y es el primero en hacerlo.',
    },
    {
      id: 6,
      pregunta: '¿Cuántos divisores tiene el número 16?',
      opciones: ['3', '4', '5', '6'],
      respuestaCorrectaIndex: 2,
      explicacion: 'Los divisores de 16 son 1, 2, 4, 8 y 16: en total 5.',
    },
    {
      id: 7,
      pregunta: '¿Cuál de estos números es divisor de 60 y también múltiplo de 4?',
      opciones: ['9', '14', '20', '26'],
      respuestaCorrectaIndex: 2,
      explicacion: '20 divide a 60 exactamente (60÷20=3) y además es múltiplo de 4 (4×5=20).',
    },
    {
      id: 8,
      pregunta: '¿Cuál de estas afirmaciones es correcta?',
      opciones: [
        'Todo número tiene infinitos múltiplos.',
        'Todo número tiene infinitos divisores.',
        'El 1 no es divisor de ningún número.',
        'Los múltiplos de un número son siempre menores que él.',
      ],
      respuestaCorrectaIndex: 0,
      explicacion: 'Todo número tiene infinitos múltiplos (se puede multiplicar por 0,1,2,3... sin parar), pero una cantidad limitada de divisores.',
    },
    {
      id: 9,
      pregunta: '¿Cuál de estos pares tiene una relación correcta de múltiplo-divisor?',
      opciones: ['5 es múltiplo de 20', '20 es múltiplo de 5', '5 es divisor de 3', '20 no tiene divisores'],
      respuestaCorrectaIndex: 1,
      explicacion: '20 es múltiplo de 5 porque 5×4=20.',
    },
    {
      id: 10,
      pregunta: 'Si un número es divisor de 48, ¿cuál de estos NO puede ser?',
      opciones: ['7', '8', '12', '16'],
      respuestaCorrectaIndex: 0,
      explicacion: 'Los divisores de 48 son 1, 2, 3, 4, 6, 8, 12, 16, 24 y 48. El 7 no está en esa lista.',
    },
  ],
}

export interface TemaSidebarItem {
  id: number
  titulo: string
  completado: boolean
  actual: boolean
}

export const temarioSidebar: TemaSidebarItem[] = [
  { id: 1, titulo: 'Números naturales hasta el 100.000', completado: true, actual: false },
  { id: 2, titulo: 'Cálculos mentales y aproximaciones', completado: true, actual: false },
  { id: 3, titulo: 'Suma y resta', completado: true, actual: false },
  { id: 4, titulo: 'Multiplicación', completado: true, actual: false },
  { id: 5, titulo: 'División', completado: true, actual: false },
  { id: 6, titulo: 'Criterios de divisibilidad', completado: true, actual: false },
  { id: 7, titulo: 'Múltiplos y divisores', completado: false, actual: true },
  { id: 8, titulo: 'Situaciones problemáticas', completado: false, actual: false },
  { id: 9, titulo: 'Potencias y raíces', completado: false, actual: false },
  { id: 10, titulo: 'Números romanos', completado: false, actual: false },
]

export const TOTAL_TEMAS_GRADO = 30
