import { describe, expect, it } from 'vitest'
import { comoMinutos, idDeYouTube, urlDeVideo } from './video'

/**
 * Quien carga contenido va a pegar el enlace como le salga: desde la barra del
 * navegador, desde el botón Compartir, desde la app del celular. Si alguna
 * forma no se reconoce, el video simplemente no aparece y nadie sabe por qué.
 */
describe('extraer el identificador de un enlace de YouTube', () => {
  const ID = 'dQw4w9WgXcQ'

  it('acepta las formas en que la gente copia un enlace', () => {
    const formas = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ?si=aBcDeFgH', // el que da Compartir
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/live/dQw4w9WgXcQ',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      'dQw4w9WgXcQ', // pegado pelado
      '  https://youtu.be/dQw4w9WgXcQ  ', // con espacios de más
    ]

    for (const forma of formas) {
      expect(idDeYouTube(forma), forma).toBe(ID)
    }
  })

  it('rechaza lo que no es un enlace de YouTube', () => {
    for (const basura of ['', '   ', 'https://vimeo.com/12345', 'no soy un link', 'abc']) {
      expect(idDeYouTube(basura), basura).toBeNull()
    }
  })

  it('no confunde un identificador corto con uno válido', () => {
    // Diez caracteres, no once: si el patrón fuera laxo, esto pasaría y el
    // reproductor quedaría en blanco.
    expect(idDeYouTube('dQw4w9WgXc')).toBeNull()
  })
})

describe('dirección del reproductor', () => {
  it('usa el dominio sin cookies de seguimiento', () => {
    expect(urlDeVideo('dQw4w9WgXcQ')).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('salta al segundo indicado', () => {
    expect(urlDeVideo('dQw4w9WgXcQ', 255)).toContain('start=255')
  })

  it('no manda el parámetro de inicio cuando arranca de cero', () => {
    expect(urlDeVideo('dQw4w9WgXcQ', 0)).not.toContain('start=')
  })
})

describe('mostrar un momento del video', () => {
  it('convierte segundos a minutos y segundos', () => {
    expect(comoMinutos(255)).toBe('4:15')
    expect(comoMinutos(5)).toBe('0:05')
    expect(comoMinutos(0)).toBe('0:00')
    expect(comoMinutos(3600)).toBe('60:00')
  })
})
