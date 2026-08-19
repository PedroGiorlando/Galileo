/**
 * El currículum del preuniversitario, como dato editable.
 *
 * De acá sale el seed de la base. Editar este archivo y volver a generar es
 * más seguro que tocar cientos de líneas de SQL a mano: los slugs se calculan
 * igual siempre y el generador avisa si dos títulos chocan dentro de una misma
 * materia.
 *
 * Jerarquía (los nombres de las tablas son genéricos a propósito; lo que cambia
 * según el nivel son las etiquetas que ve el alumno):
 *
 *   cursos   → una materia del ingreso   "Física"
 *   temas    → una unidad                "Vectores"
 *   subtemas → una clase                 "Suma de vectores por componentes"
 *
 * Los títulos son un punto de partida armado con la estructura habitual de un
 * ingreso universitario argentino. Están para que los profesores de cada
 * materia los corrijan desde el panel, no para quedar así.
 */

/** ⚠ Cambiar por el ingreso real. Aparece en títulos y breadcrumbs. */
export const PROGRAMA = 'Ingreso Universitario'

export const MATERIAS = [
  {
    slug: 'fisica',
    nombre: 'Física',
    // Arranca publicada: es la materia que dicta tu hermano y donde está el
    // material. Las otras esperan a que su profesor cargue contenido.
    publicado: true,
    descripcion:
      'Todo el programa de Física del ingreso, desde magnitudes y unidades hasta trabajo y energía, con teoría, ejercicios resueltos y exámenes reales.',
    unidades: {
      'magnitudes-y-unidades': {
        nombre: 'Magnitudes y unidades',
        clases: [
          'Magnitudes físicas y su medición',
          'Sistema Internacional de Unidades',
          'Notación científica',
          'Cifras significativas y redondeo',
          'Conversión de unidades',
          'Análisis dimensional',
        ],
      },
      vectores: {
        nombre: 'Vectores',
        clases: [
          'Magnitudes escalares y vectoriales',
          'Representación y elementos de un vector',
          'Suma de vectores por método gráfico',
          'Descomposición en componentes',
          'Suma de vectores por componentes',
          'Producto de un vector por un escalar',
        ],
      },
      cinematica: {
        nombre: 'Cinemática',
        clases: [
          'Posición, desplazamiento y trayectoria',
          'Velocidad media e instantánea',
          'Movimiento rectilíneo uniforme',
          'Movimiento rectilíneo uniformemente variado',
          'Caída libre y tiro vertical',
          'Tiro oblicuo',
          'Movimiento circular uniforme',
        ],
      },
      dinamica: {
        nombre: 'Dinámica: las leyes de Newton',
        clases: [
          'Primera ley de Newton: inercia',
          'Segunda ley de Newton',
          'Tercera ley de Newton: acción y reacción',
          'Peso, normal y tensión',
          'Fuerza de rozamiento',
          'Cuerpos sobre plano inclinado',
          'Sistemas de cuerpos vinculados',
        ],
      },
      'trabajo-y-energia': {
        nombre: 'Trabajo y energía',
        clases: [
          'Trabajo de una fuerza constante',
          'Energía cinética y teorema del trabajo',
          'Energía potencial gravitatoria',
          'Energía potencial elástica',
          'Conservación de la energía mecánica',
          'Potencia y rendimiento',
        ],
      },
      estatica: {
        nombre: 'Estática',
        clases: [
          'Equilibrio de fuerzas concurrentes',
          'Momento de una fuerza',
          'Equilibrio de cuerpos rígidos',
          'Centro de gravedad',
        ],
      },
      'examenes-resueltos': {
        nombre: 'Exámenes resueltos',
        clases: [
          'Examen de Física resuelto: modelo 1',
          'Examen de Física resuelto: modelo 2',
          'Examen de Física resuelto: modelo 3',
        ],
      },
    },
  },
  {
    slug: 'matematica',
    nombre: 'Matemática',
    publicado: false,
    descripcion:
      'Todo el programa de Matemática del ingreso: conjuntos numéricos, álgebra, ecuaciones, funciones y trigonometría, con ejercicios resueltos y exámenes reales.',
    unidades: {
      'conjuntos-numericos': {
        nombre: 'Conjuntos numéricos',
        clases: [
          'Números naturales y enteros',
          'Números racionales y sus operaciones',
          'Números reales y recta numérica',
          'Potenciación y sus propiedades',
          'Radicación y racionalización',
          'Notación científica y orden de magnitud',
        ],
      },
      'expresiones-algebraicas': {
        nombre: 'Expresiones algebraicas',
        clases: [
          'Lenguaje algebraico y polinomios',
          'Operaciones con polinomios',
          'Productos notables',
          'Factoreo: casos fundamentales',
          'Expresiones algebraicas racionales',
          'Simplificación de expresiones',
        ],
      },
      ecuaciones: {
        nombre: 'Ecuaciones e inecuaciones',
        clases: [
          'Ecuaciones de primer grado',
          'Ecuaciones de segundo grado',
          'Ecuaciones con radicales',
          'Sistemas de dos ecuaciones lineales',
          'Inecuaciones de primer grado',
          'Problemas que se resuelven con ecuaciones',
        ],
      },
      funciones: {
        nombre: 'Funciones',
        clases: [
          'Concepto de función, dominio e imagen',
          'Función lineal y su gráfico',
          'Función cuadrática y parábola',
          'Función exponencial',
          'Logaritmos y función logarítmica',
          'Composición y función inversa',
        ],
      },
      trigonometria: {
        nombre: 'Trigonometría',
        clases: [
          'Clasificación de los triángulos',
          'Teorema de Pitágoras',
          'Razones trigonométricas: seno, coseno y tangente',
          'Resolución de triángulos rectángulos',
          'Teorema del seno',
          'Teorema del coseno',
          'Sistema circular y radianes',
        ],
      },
      'examenes-resueltos': {
        nombre: 'Exámenes resueltos',
        clases: [
          'Examen de Matemática resuelto: modelo 1',
          'Examen de Matemática resuelto: modelo 2',
          'Examen de Matemática resuelto: modelo 3',
        ],
      },
    },
  },
  {
    slug: 'quimica',
    nombre: 'Química',
    publicado: false,
    descripcion:
      'Todo el programa de Química del ingreso: estructura de la materia, tabla periódica, uniones, nomenclatura y estequiometría.',
    unidades: {
      'la-materia': {
        nombre: 'La materia y sus propiedades',
        clases: [
          'Sistemas materiales homogéneos y heterogéneos',
          'Métodos de separación de fases',
          'Estados de agregación y cambios de estado',
          'Propiedades intensivas y extensivas',
          'Sustancias puras y mezclas',
        ],
      },
      'estructura-atomica': {
        nombre: 'Estructura atómica',
        clases: [
          'Modelos atómicos: evolución',
          'Número atómico, número másico e isótopos',
          'Configuración electrónica',
          'Números cuánticos',
        ],
      },
      'tabla-periodica': {
        nombre: 'Tabla periódica',
        clases: [
          'Organización de la tabla periódica',
          'Grupos y períodos',
          'Propiedades periódicas',
          'Metales, no metales y gases nobles',
        ],
      },
      'uniones-quimicas': {
        nombre: 'Uniones químicas',
        clases: [
          'Regla del octeto y estructuras de Lewis',
          'Unión iónica',
          'Unión covalente',
          'Unión metálica',
          'Fuerzas intermoleculares',
        ],
      },
      nomenclatura: {
        nombre: 'Nomenclatura y formuleo',
        clases: [
          'Número de oxidación',
          'Óxidos básicos y ácidos',
          'Hidróxidos y ácidos',
          'Sales',
        ],
      },
      estequiometria: {
        nombre: 'Reacciones y estequiometría',
        clases: [
          'Ecuaciones químicas y balanceo',
          'El mol y la masa molar',
          'Cálculos estequiométricos',
          'Reactivo limitante',
          'Pureza y rendimiento',
        ],
      },
      'examenes-resueltos': {
        nombre: 'Exámenes resueltos',
        clases: [
          'Examen de Química resuelto: modelo 1',
          'Examen de Química resuelto: modelo 2',
        ],
      },
    },
  },
]

/** La única clase que hoy tiene contenido escrito, como muestra pública. */
export const CLASE_CON_CONTENIDO = {
  materia: 'fisica',
  slug: 'suma-de-vectores-por-componentes',
}
