/**
 * Videos de YouTube.
 *
 * Se guarda solo el identificador, no la dirección completa: así el contenido
 * no queda atado a la forma de la URL, y el día que se cambie de proveedor se
 * toca este archivo y nada más.
 *
 * ⚠ LIMITACIÓN CONOCIDA: un video "no listado" no está protegido. Quien tenga
 * el enlace lo ve, y el identificador se lee del código fuente de la página.
 * Sirve mientras el contenido sea gratuito; antes de cobrar hay que pasar a un
 * proveedor con URLs firmadas que venzan (Bunny Stream, Cloudflare Stream) o
 * asumir que el video es la parte regalada del producto.
 */

/**
 * Saca el identificador de cualquier forma en que se copie un enlace de
 * YouTube. Acepta también el identificador pelado, porque alguien lo va a
 * pegar así.
 *
 *   https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   https://youtu.be/dQw4w9WgXcQ?si=abc
 *   https://www.youtube.com/embed/dQw4w9WgXcQ
 *   https://www.youtube.com/live/dQw4w9WgXcQ
 *   dQw4w9WgXcQ
 */
export function idDeYouTube(entrada: string): string | null {
  const texto = entrada.trim()
  if (!texto) return null

  // Un identificador de YouTube son 11 caracteres de este alfabeto.
  const ID = /^[A-Za-z0-9_-]{11}$/
  if (ID.test(texto)) return texto

  const patrones = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/
    /\/embed\/([A-Za-z0-9_-]{11})/, // /embed/
    /\/live\/([A-Za-z0-9_-]{11})/, // /live/
    /\/shorts\/([A-Za-z0-9_-]{11})/, // /shorts/
  ]

  for (const p of patrones) {
    const m = texto.match(p)
    if (m) return m[1]
  }

  return null
}

/**
 * Dirección del reproductor incrustado.
 *
 * Se usa `youtube-nocookie.com`: no deja cookies de seguimiento hasta que el
 * alumno le da play. Es lo mínimo decente cuando el sitio lo van a usar
 * chicos, y evita tener que declarar esas cookies en la política de privacidad.
 *
 * `rel=0` limita los videos sugeridos al mismo canal en vez de a cualquiera.
 * YouTube ya no permite quitarlos del todo: al terminar, va a mostrar otros
 * videos del canal. Es el precio de no pagar hosting.
 */
export function urlDeVideo(youtubeId: string, segundo?: number): string {
  const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
  if (segundo && segundo > 0) params.set('start', String(segundo))

  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`
}

/** 245 → "4:05". Para mostrar a qué minuto de un video apunta un ejemplo. */
export function comoMinutos(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
