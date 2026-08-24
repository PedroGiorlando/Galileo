/**
 * Los datos del sitio que necesitan a la vez el layout, el sitemap y el
 * robots.txt. Estaban solo en layout.tsx y los tres tienen que decir lo mismo:
 * un sitemap que lista páginas marcadas `noindex` es una contradicción que
 * Google reporta como error.
 */

export const NOMBRE = 'Academia Galileo'

export const DESCRIPCION =
  'Preparación para el ingreso universitario con explicaciones, ejemplos resueltos, ejercicios que se corrigen solos y exámenes reales.'

/**
 * La dirección pública. Sale de NEXT_PUBLIC_SITE_URL, que ya se usaba para el
 * link de confirmación del correo.
 *
 * Importa que sea absoluta: Open Graph no admite direcciones relativas. Sin
 * esto, WhatsApp y Google no encuentran ni la imagen ni la página.
 */
export const URL_SITIO = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * Mientras el sitio esté en construcción, ninguna página se indexa.
 *
 * Un sitio con tres clases cargadas indexado como si estuviera terminado es
 * contenido pobre, y Google castiga el dominio entero — justo lo que estamos
 * cuidando. Se abre poniendo NEXT_PUBLIC_INDEXABLE=true, el día que haya
 * contenido suficiente.
 *
 * Se usa `noindex` en los metadatos ADEMÁS del robots.txt, no en lugar de él:
 * robots.txt pide que no rastreen, pero una página enlazada desde afuera puede
 * terminar indexada igual. El metadato es el que de verdad lo impide.
 */
export const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === 'true'

/**
 * La imagen de compartir, para las páginas que definen su propio `openGraph`.
 *
 * TRAMPA QUE COSTÓ ENCONTRAR: el archivo `src/app/opengraph-image.tsx` le pone
 * imagen a todas las páginas... hasta que una define su propio bloque
 * `openGraph`. Ahí Next reemplaza el objeto entero en vez de completarlo, y la
 * imagen desaparece sin ningún aviso. La portada la tenía y la clase no —
 * justo al revés de lo que hace falta, porque lo que se pega en un grupo de
 * WhatsApp es el link de una clase.
 *
 * Así que toda página que declare `openGraph` tiene que incluir esto.
 */
export const IMAGEN_OG = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${NOMBRE} — preparación para el ingreso universitario`,
}
