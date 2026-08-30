import { describe, expect, it } from 'vitest'
import { sinRespuestas } from './publico'
import { tema } from '@/data/topicData'

/**
 * Que ninguna respuesta llegue al navegador.
 *
 * Esto no es una preferencia de estilo: la página servía el contenido entero,
 * así que `curl` sobre una clase publicada devolvía `respuestaCorrecta":"86.6`
 * y un `respuestaCorrectaIndex` por pregunta. Cualquiera con Ctrl+U tenía el
 * examen resuelto.
 *
 * Se revisa por clave Y por valor. Solo por clave no alcanza: alguien podría
 * renombrar el campo y seguir mandándolo. Solo por valor tampoco: un índice
 * numérico no se puede buscar como texto.
 *
 * DOS COSAS QUE ESTA PRUEBA ENSEÑÓ AL ESCRIBIRLA:
 *
 * 1. `explicacion` son dos campos distintos con el mismo nombre: la teoría
 *    escrita de la clase (pública) y la devolución de un ejercicio (secreta).
 *    Por eso se revisa por clave DENTRO de los ejercicios y las preguntas, no
 *    en todo el objeto. Y por eso el filtrado es una lista blanca y no un
 *    `delete obj.explicacion` recursivo, que borraría la teoría.
 *
 * 2. La respuesta correcta de un multiple choice ES una de las opciones, así
 *    que su texto viaja siempre: hay que mostrarla. Lo secreto no es el texto
 *    sino CUÁL de las opciones es, y eso lo cubre la prueba por clave.
 */

/** Todas las claves que existen en cualquier nivel del objeto. */
function clavesDe(valor: unknown, acumulado = new Set<string>()): Set<string> {
  if (Array.isArray(valor)) {
    valor.forEach(v => clavesDe(v, acumulado))
  } else if (valor && typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) {
      acumulado.add(k)
      clavesDe(v, acumulado)
    }
  }
  return acumulado
}

describe('el contenido que se manda al navegador', () => {
  const publico = sinRespuestas(tema)
  const serializado = JSON.stringify(publico)

  it('ningún ejercicio ni pregunta lleva su respuesta', () => {
    const claves = new Set([
      ...clavesDe(publico.practicos),
      ...clavesDe(publico.evaluaciones),
    ])

    for (const prohibida of ['respuestaCorrecta', 'respuestaCorrectaIndex', 'explicacion']) {
      expect(claves, `la clave "${prohibida}" no debería salir del servidor`).not.toContain(
        prohibida,
      )
    }
  })

  it('no contiene el texto de ninguna respuesta ni devolución', () => {
    const secretos: string[] = []

    for (const p of tema.practicos) {
      for (const e of p.ejercicios) {
        secretos.push(e.explicacion)
        // Los de opción múltiple no: su respuesta correcta es una de las
        // opciones que hay que mostrar sí o sí. Lo secreto ahí es cuál, no qué.
        if (e.tipo !== 'multiple') secretos.push(e.respuestaCorrecta)
      }
    }
    for (const ev of tema.evaluaciones) {
      for (const q of ev.preguntas) secretos.push(q.explicacion)
    }

    // Se ignoran los muy cortos ("Sí", "100"): aparecen legítimamente dentro de
    // un enunciado y darían un falso positivo. Los cubre la prueba por clave.
    const largos = secretos.filter(s => s.length >= 8)
    expect(
      largos.length,
      'el tema de ejemplo debería tener respuestas largas que revisar',
    ).toBeGreaterThan(0)

    for (const secreto of largos) {
      expect(serializado, `se filtró: "${secreto.slice(0, 40)}…"`).not.toContain(secreto)
    }
  })

  it('manda las imágenes del enunciado y retiene las de la devolución', () => {
    // El tema de ejemplo no tiene medios, así que las pruebas de arriba no
    // dicen nada sobre ellos. Sin este caso, `mediosExplicacion` podría estar
    // viajando entero y los tres tests seguirían en verde — que es exactamente
    // como se nos escaparon antes los videos vacíos.
    const DIAGRAMA = 'https://ejemplo.test/diagrama-del-enunciado.png'
    const RESOLUCION = 'https://ejemplo.test/la-resolucion-dibujada.png'

    const conMedios = {
      ...tema,
      practicos: [
        {
          ...tema.practicos[0],
          ejercicios: [
            {
              ...tema.practicos[0].ejercicios[0],
              medios: [{ tipo: 'imagen' as const, url: DIAGRAMA, alt: 'Diagrama' }],
              mediosExplicacion: [
                { tipo: 'imagen' as const, url: RESOLUCION, alt: 'Resolución' },
              ],
            },
            ...tema.practicos[0].ejercicios.slice(1),
          ],
        },
      ],
      evaluaciones: [
        {
          ...tema.evaluaciones[0],
          preguntas: [
            {
              ...tema.evaluaciones[0].preguntas[0],
              medios: [{ tipo: 'video' as const, youtubeId: 'dQw4w9WgXcQ' }],
              mediosExplicacion: [
                { tipo: 'imagen' as const, url: RESOLUCION, alt: 'Resolución' },
              ],
            },
            ...tema.evaluaciones[0].preguntas.slice(1),
          ],
        },
      ],
    }

    const salida = JSON.stringify(sinRespuestas(conMedios))

    expect(salida, 'el diagrama del enunciado tiene que llegar').toContain(DIAGRAMA)
    expect(salida, 'el video de la pregunta tiene que llegar').toContain('dQw4w9WgXcQ')
    expect(salida, 'la resolución dibujada NO puede viajar antes de responder').not.toContain(
      RESOLUCION,
    )
    expect(clavesDe(sinRespuestas(conMedios))).not.toContain('mediosExplicacion')
  })

  it('las reglas del examen viajan: son el trato, no un secreto', () => {
    // Cuánto dura, qué dificultad tiene y cuántos intentos quedan es
    // exactamente lo que el alumno necesita ANTES de apretar Comenzar. El
    // tema de ejemplo no las tiene, así que sin este caso podrían no estar
    // llegando y todo seguiría en verde.
    const conReglas = {
      ...tema,
      evaluaciones: [
        {
          ...tema.evaluaciones[0],
          dificultad: 'Avanzado' as const,
          tiempoLimiteMinutos: 45,
          intentos: 3,
        },
      ],
    }

    const ev = sinRespuestas(conReglas).evaluaciones[0]

    expect(ev.dificultad).toBe('Avanzado')
    expect(ev.tiempoLimiteMinutos).toBe(45)
    expect(ev.intentos).toBe(3)
    // Y lo que sí es secreto sigue sin viajar.
    expect(JSON.stringify(ev)).not.toContain('respuestaCorrectaIndex')
  })

  it('conserva todo lo que el alumno sí necesita ver', () => {
    // El error opuesto y más silencioso: filtrar de más y servir ejercicios
    // vacíos. Todo pasaría en verde y la clase quedaría inservible.
    expect(publico.practicos.length).toBe(tema.practicos.length)
    expect(publico.evaluaciones.length).toBe(tema.evaluaciones.length)

    tema.practicos.forEach((p, i) => {
      expect(publico.practicos[i].ejercicios.length).toBe(p.ejercicios.length)
      p.ejercicios.forEach((e, j) => {
        const pub = publico.practicos[i].ejercicios[j]
        expect(pub.enunciado).toBe(e.enunciado)
        expect(pub.tipo).toBe(e.tipo)
        // Sin las opciones, un multiple choice no se puede ni responder.
        if (e.tipo === 'multiple') {
          expect(pub.tipo === 'multiple' && pub.opciones).toEqual(e.opciones)
        }
      })
    })

    tema.evaluaciones.forEach((ev, i) => {
      expect(publico.evaluaciones[i].preguntas.length).toBe(ev.preguntas.length)
      ev.preguntas.forEach((q, j) => {
        const pub = publico.evaluaciones[i].preguntas[j]
        expect(pub.pregunta).toBe(q.pregunta)
        expect(pub.opciones).toEqual(q.opciones)
      })
    })

    // Lo que no toca la corrección viaja igual que antes.
    expect(publico.explicacion).toEqual(tema.explicacion)
    expect(publico.ejemplos).toEqual(tema.ejemplos)
    expect(publico.videos).toEqual(tema.videos)
  })
})
