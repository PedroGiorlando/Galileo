import type { Ejercicio } from './schemas'

/** Lo que el alumno responde: texto libre / Sí-No, o varias opciones tildadas. */
export type Respuesta = string | string[]

/**
 * "0, 7, 14" y "14,0,7" son la misma respuesta: se ignoran espacios, orden y
 * elementos vacíos. Lo que NO se ignora es el conjunto — si falta o sobra un
 * número, está mal.
 */
export function normalizarLista(valor: string): string[] {
  return valor
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
    .sort()
}

/**
 * Corre SOLO en el servidor, llamada desde src/app/acciones-correccion.ts.
 *
 * No importar esto desde un componente de cliente: arrastraría las respuestas
 * al bundle, que es justamente lo que se sacó de ahí. Estaba aislada acá desde
 * el principio para que mover la corrección no obligara a tocar la interfaz, y
 * efectivamente no hubo que tocarla.
 *
 * ⚠️ La coma separa los valores de la lista, así que `86,6` se lee como dos
 * números. Un alumno que escribe el decimal a la argentina recibe "incorrecta"
 * habiendo resuelto bien. No se arregla acá: `86,6,50,0` es genuinamente
 * ambiguo. Se arregla escribiendo los ejercicios con un solo número por
 * respuesta, como explica docs/plantilla-clase.md.
 */
export function esCorrecta(ejercicio: Ejercicio, respuesta: Respuesta): boolean {
  switch (ejercicio.tipo) {
    case 'libre': {
      if (typeof respuesta !== 'string') return false
      const dada = normalizarLista(respuesta)
      const correcta = normalizarLista(ejercicio.respuestaCorrecta)
      return dada.join(',') === correcta.join(',')
    }
    case 'multiple': {
      if (!Array.isArray(respuesta)) return false
      const dadas = [...respuesta].sort()
      const correctas = [...ejercicio.respuestaCorrecta].sort()
      return dadas.length === correctas.length && dadas.every((v, i) => v === correctas[i])
    }
    case 'si-no':
      return respuesta === ejercicio.respuestaCorrecta
  }
}
