/**
 * El currículum de Primaria, como dato editable.
 *
 * De acá sale el seed de la base. Editar este archivo y volver a generar es
 * más seguro que tocar 200 líneas de SQL a mano: los slugs se calculan solos y
 * el generador avisa si dos títulos chocan dentro de un mismo grado.
 *
 * Los títulos son un punto de partida razonable, no una verdad revelada.
 * Están pensados para que se editen desde el panel, no para quedar así.
 *
 * Jerarquía: Grado → Tema (área) → Subtema (la unidad que se estudia).
 */

export const TEMAS = [
  { slug: 'numeros-y-operaciones', nombre: 'Números y Operaciones' },
  { slug: 'fracciones-y-decimales', nombre: 'Fracciones y Decimales' },
  { slug: 'geometria', nombre: 'Geometría' },
  { slug: 'medidas', nombre: 'Medidas' },
  { slug: 'estadistica-y-probabilidad', nombre: 'Estadística y Probabilidad' },
  { slug: 'algebra', nombre: 'Álgebra' },
  { slug: 'problemas-y-desafios', nombre: 'Problemas y Desafíos' },
]

export const GRADOS = [
  {
    slug: '1-grado',
    nombre: '1° Grado',
    descripcion: 'Los primeros números, las primeras cuentas y las formas que nos rodean.',
    subtemas: {
      'numeros-y-operaciones': [
        'Los números del 1 al 20',
        'Contar y ordenar hasta el 100',
        'Anterior y posterior',
        'Sumas sin dificultad',
        'Restas sin dificultad',
        'El cero y su significado',
      ],
      'fracciones-y-decimales': ['La mitad de una figura', 'Repartir en partes iguales'],
      geometria: [
        'Figuras: círculo, cuadrado, triángulo',
        'Cuerpos: cubo, esfera, cilindro',
        'Adentro, afuera y sobre el borde',
      ],
      medidas: ['Más largo y más corto', 'Más pesado y más liviano', 'Los días de la semana'],
      'estadistica-y-probabilidad': ['Agrupar y contar objetos', 'Leer un gráfico de dibujos'],
      algebra: ['Continuar una serie', 'Buscar el número que falta'],
      'problemas-y-desafios': [
        'Problemas de juntar',
        'Problemas de quitar',
        'Dibujar para resolver',
      ],
    },
  },
  {
    slug: '2-grado',
    nombre: '2° Grado',
    descripcion: 'Sumar y restar con soltura, y las primeras multiplicaciones.',
    subtemas: {
      'numeros-y-operaciones': [
        'Números hasta el 1.000',
        'Valor posicional: unidad, decena, centena',
        'Suma con reagrupación',
        'Resta con reagrupación',
        'La multiplicación como suma repetida',
        'Tablas del 2, 3, 4 y 5',
        'Números pares e impares',
      ],
      'fracciones-y-decimales': ['Mitad, tercio y cuarto', 'Fracciones de una colección'],
      geometria: [
        'Lados y vértices de las figuras',
        'Figuras simétricas',
        'Cuerpos y sus caras',
      ],
      medidas: [
        'Medir con centímetros',
        'Kilogramos y gramos',
        'Leer la hora en punto y media',
        'El calendario y los meses',
      ],
      'estadistica-y-probabilidad': ['Tablas de conteo', 'Gráfico de barras simple'],
      algebra: ['Series con dos pasos', 'Igualdades con un hueco'],
      'problemas-y-desafios': [
        'Problemas de dos operaciones',
        'Problemas con dinero',
        'Elegir la operación correcta',
      ],
    },
  },
  {
    slug: '3-grado',
    nombre: '3° Grado',
    descripcion: 'Multiplicación, división y las primeras fracciones.',
    subtemas: {
      'numeros-y-operaciones': [
        'Números hasta el 10.000',
        'Comparar y ordenar números grandes',
        'Tablas de multiplicar completas',
        'Multiplicación por una cifra',
        'La división como reparto',
        'División por una cifra',
        'Cálculo mental con decenas',
      ],
      'fracciones-y-decimales': [
        'Qué es una fracción',
        'Leer y escribir fracciones',
        'Comparar fracciones sencillas',
      ],
      geometria: [
        'Rectas, semirrectas y segmentos',
        'Ángulos: recto, agudo y obtuso',
        'Clasificación de triángulos',
        'Cuadriláteros',
      ],
      medidas: [
        'Metro, centímetro y milímetro',
        'Litro y mililitro',
        'Leer la hora con minutos',
        'Perímetro de figuras simples',
      ],
      'estadistica-y-probabilidad': [
        'Interpretar gráficos de barras',
        'Seguro, posible e imposible',
      ],
      algebra: ['Patrones numéricos', 'Ecuaciones con un dato desconocido'],
      'problemas-y-desafios': [
        'Problemas de varias etapas',
        'Problemas de reparto',
        'Estimar antes de calcular',
      ],
    },
  },
  {
    slug: '4-grado',
    nombre: '4° Grado',
    descripcion:
      'Todos los temas de matemáticas de 4to grado organizados para que aprendas paso a paso.',
    subtemas: {
      // Los 10 primeros son los que ya estaban en el temario del prototipo.
      'numeros-y-operaciones': [
        'Números naturales hasta el 100.000',
        'Cálculos mentales y aproximaciones',
        'Suma y resta',
        'Multiplicación',
        'División',
        'Criterios de divisibilidad',
        'Múltiplos y divisores',
        'Situaciones problemáticas',
        'Potencias y raíces',
        'Números romanos',
      ],
      'fracciones-y-decimales': [
        'Fracciones equivalentes',
        'Suma y resta de fracciones',
        'Números decimales',
        'Comparar decimales',
      ],
      geometria: [
        'Rectas paralelas y perpendiculares',
        'Medir ángulos con transportador',
        'Polígonos y sus elementos',
        'Circunferencia y círculo',
      ],
      medidas: [
        'Unidades de longitud',
        'Unidades de peso y capacidad',
        'Perímetro y área del rectángulo',
        'Medidas de tiempo',
      ],
      'estadistica-y-probabilidad': [
        'Tablas de frecuencia',
        'Gráficos de barras y de líneas',
        'Promedio simple',
      ],
      algebra: ['Propiedades de las operaciones', 'Expresiones con letras'],
      'problemas-y-desafios': [
        'Problemas combinados',
        'Problemas con fracciones',
        'Desafíos de lógica',
      ],
    },
  },
  {
    slug: '5-grado',
    nombre: '5° Grado',
    descripcion: 'Proporcionalidad, porcentajes y geometría del espacio.',
    subtemas: {
      'numeros-y-operaciones': [
        'Números hasta el millón',
        'Multiplicación por dos cifras',
        'División por dos cifras',
        'Números primos y compuestos',
        'Múltiplo común menor',
        'Divisor común mayor',
      ],
      'fracciones-y-decimales': [
        'Fracciones impropias y mixtas',
        'Multiplicación de fracciones',
        'Operaciones con decimales',
        'Fracción decimal y porcentaje',
      ],
      geometria: [
        'Cuerpos geométricos y sus desarrollos',
        'Simetría y traslación',
        'Construcción de triángulos',
        'Área del triángulo y del paralelogramo',
      ],
      medidas: [
        'Sistema métrico decimal',
        'Volumen y capacidad',
        'Superficie de figuras compuestas',
      ],
      'estadistica-y-probabilidad': [
        'Media, mediana y moda',
        'Gráficos circulares',
        'Probabilidad de un suceso',
      ],
      algebra: ['Proporcionalidad directa', 'Regla de tres simple', 'Porcentajes'],
      'problemas-y-desafios': [
        'Problemas de proporcionalidad',
        'Problemas con porcentajes',
        'Desafíos de razonamiento',
      ],
    },
  },
  {
    slug: '6-grado',
    nombre: '6° Grado',
    descripcion: 'Números enteros, razones y el paso previo al álgebra.',
    subtemas: {
      'numeros-y-operaciones': [
        'Números enteros: positivos y negativos',
        'Recta numérica con enteros',
        'Operaciones combinadas',
        'Potencias y notación',
        'Raíz cuadrada exacta',
      ],
      'fracciones-y-decimales': [
        'División de fracciones',
        'Operaciones combinadas con fracciones',
        'Decimales periódicos',
        'Pasar de fracción a decimal',
      ],
      geometria: [
        'Ángulos entre paralelas',
        'Teorema de Pitágoras: introducción',
        'Área del círculo',
        'Volumen de prismas',
      ],
      medidas: [
        'Equivalencias entre unidades',
        'Escalas y planos',
        'Superficie y volumen en problemas',
      ],
      'estadistica-y-probabilidad': [
        'Muestras y poblaciones',
        'Interpretar gráficos estadísticos',
        'Probabilidad con fracciones',
      ],
      algebra: [
        'Lenguaje algebraico',
        'Ecuaciones de primer grado',
        'Razones y proporciones',
        'Proporcionalidad inversa',
      ],
      'problemas-y-desafios': [
        'Problemas con ecuaciones',
        'Problemas de escala',
        'Desafíos de combinatoria',
      ],
    },
  },
  {
    slug: '7-grado',
    nombre: '7° Grado',
    descripcion: 'El cierre de la primaria y la preparación para el secundario.',
    subtemas: {
      'numeros-y-operaciones': [
        'Números racionales',
        'Operaciones con racionales',
        'Potencias de exponente negativo',
        'Notación científica',
        'Aproximación y redondeo',
      ],
      'fracciones-y-decimales': [
        'Orden en los racionales',
        'Operaciones combinadas con racionales',
        'Problemas con fracciones y decimales',
      ],
      geometria: [
        'Teorema de Pitágoras: aplicaciones',
        'Cuerpos redondos',
        'Área y volumen de cilindros',
        'Semejanza de figuras',
      ],
      medidas: [
        'Unidades de superficie y volumen',
        'Medidas de ángulos en grados y minutos',
        'Problemas de medida',
      ],
      'estadistica-y-probabilidad': [
        'Frecuencia absoluta y relativa',
        'Medidas de dispersión',
        'Probabilidad de sucesos compuestos',
      ],
      algebra: [
        'Ecuaciones con paréntesis',
        'Inecuaciones sencillas',
        'Funciones y su gráfico',
        'Sistemas de dos ecuaciones',
      ],
      'problemas-y-desafios': [
        'Problemas de preparación al secundario',
        'Problemas con funciones',
        'Desafíos integradores',
      ],
    },
  },
]

/** El único subtema que hoy tiene contenido escrito. */
export const SUBTEMA_CON_CONTENIDO = { grado: '4-grado', slug: 'multiplos-y-divisores' }
