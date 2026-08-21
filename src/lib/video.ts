/**
 * Direcciones del reproductor de Bunny Stream.
 *
 * El contenido guarda solo el identificador del video. La biblioteca vive en
 * una variable de entorno, así que cambiar de biblioteca —o de proveedor— no
 * obliga a tocar las cientos de clases ya cargadas.
 *
 * ponytail: hoy se usa el reproductor incrustado de Bunny, sin firmar. Bunny
 * permite URLs con token que vencen en minutos, que es lo que de verdad frena
 * que se comparta el link. Se activa configurando la clave de la biblioteca y
 * firmando del lado del servidor; hasta que haya contenido pago no hace falta.
 */
export function urlDeVideo(bunnyId: string, segundo?: number): string {
  const biblioteca = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID

  // Sin biblioteca configurada no hay reproductor: se devuelve vacío y quien
  // llama muestra un aviso, en vez de un iframe roto.
  if (!biblioteca) return ''

  const base = `https://iframe.mediadelivery.net/embed/${biblioteca}/${bunnyId}`
  const params = new URLSearchParams({ autoplay: 'false', preload: 'false' })
  if (segundo && segundo > 0) params.set('t', String(segundo))

  return `${base}?${params.toString()}`
}

/** 245 → "4:05". Para mostrar a qué minuto de un video apunta un ejemplo. */
export function comoMinutos(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
