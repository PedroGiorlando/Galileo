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
 * ponytail: hoy corre en el navegador, así que las respuestas correctas viajan
 * en el bundle y se pueden leer con F12. Está aislada acá justamente para que
 * mover la corrección a una Server Action, cuando el contenido sea pago, no
 * requiera tocar la UI.
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
