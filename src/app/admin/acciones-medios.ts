'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { aSlug, rechazarSiNoEsAdmin } from '@/lib/admin'

/**
 * Subir imágenes al contenido.
 *
 * Van al bucket `contenido` de Supabase, que ya limita a 2 MB y solo acepta
 * imágenes de mapa de bits. Igual se valida acá: el error del bucket es un
 * mensaje técnico en inglés, y quien carga contenido merece que le digan qué
 * pasó en castellano.
 *
 * SIN SVG A PROPÓSITO. Un SVG es XML y puede traer JavaScript adentro; como se
 * sirve desde un dominio nuestro, sería ejecutar código ajeno en nuestra casa.
 * Para diagramas de física, PNG o WebP alcanzan y sobran.
 *
 * ponytail: al sacar una imagen del formulario, el archivo queda en el bucket.
 * Borrarlo ahí sería peor: si después se cancela la edición o se deshace el
 * cambio, la imagen ya no estaría y la clase quedaría rota. Limpiar huérfanos
 * es un trabajo aparte, cuando haya volumen suficiente para que importe.
 */

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAXIMO = 2 * 1024 * 1024

const EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function subirImagen(
  datos: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const negado = await rechazarSiNoEsAdmin()
  if (negado) return negado

  const archivo = datos.get('archivo')
  const materia = String(datos.get('materia') ?? '')
  const clase = String(datos.get('clase') ?? '')

  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, error: 'No llegó ningún archivo.' }
  }

  if (!TIPOS.includes(archivo.type)) {
    return { ok: false, error: 'Tiene que ser una imagen JPG, PNG, WebP o GIF.' }
  }

  if (archivo.size > MAXIMO) {
    const mb = (archivo.size / 1024 / 1024).toFixed(1)
    return { ok: false, error: `La imagen pesa ${mb} MB y el máximo son 2 MB. Achicala y reintentá.` }
  }

  // Se organiza por materia y clase para que el bucket se pueda mirar desde
  // Supabase y se entienda qué es cada cosa. El nombre es aleatorio: dos
  // "diagrama.png" de clases distintas no se pisan, y nadie puede adivinar la
  // dirección de una imagen que no vio.
  const carpeta = [aSlug(materia) || 'sin-materia', aSlug(clase) || 'sin-clase'].join('/')
  const ruta = `${carpeta}/${crypto.randomUUID()}.${EXTENSION[archivo.type]}`

  const db = supabaseAdmin()
  const { error } = await db.storage.from('contenido').upload(ruta, archivo, {
    contentType: archivo.type,
    // Sin sobrescribir: el nombre es único, así que si esto choca es que algo
    // anda mal y es mejor enterarse.
    upsert: false,
  })

  if (error) return { ok: false, error: `No se pudo subir: ${error.message}` }

  return { ok: true, url: db.storage.from('contenido').getPublicUrl(ruta).data.publicUrl }
}
