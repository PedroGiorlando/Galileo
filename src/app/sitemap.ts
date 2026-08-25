import type { MetadataRoute } from 'next'
import { getRutasDeCarreras, getRutasDeClases, getRutasDeCursos } from '@/lib/contenido'
import { INDEXABLE, URL_SITIO } from '@/lib/sitio'

/**
 * Next genera /sitemap.xml con esto, leyendo la base en el build.
 *
 * LA REGLA QUE ORDENA ESTE ARCHIVO: acá solo entra lo que de verdad se indexa.
 * Un sitemap es una recomendación de qué mirar; listar una página marcada
 * `noindex` es pedirle a Google que visite algo que después le vamos a negar, y
 * Search Console lo reporta como error.
 *
 * Por eso NO están /nosotros, /metodo, /preguntas-frecuentes, /contacto ni
 * /buscar: hoy son marcadores de posición con `noindex` hasta que tengan texto
 * de verdad. Cuando lo tengan, se les saca el noindex Y se agregan acá — las
 * dos cosas, o vuelve la contradicción.
 *
 * Las clases que salen de `getRutasDeClases` son solo las que tienen contenido
 * cargado. Las demás responden "Próximamente" y ya piden `noindex`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Con el sitio cerrado, un sitemap sería una lista de páginas que estamos
  // pidiendo que no se indexen. Mejor vacío que contradictorio.
  if (!INDEXABLE) return []

  const [carreras, cursos, clases] = await Promise.all([
    getRutasDeCarreras(),
    getRutasDeCursos(),
    getRutasDeClases(),
  ])

  const url = (ruta: string) => `${URL_SITIO}${ruta}`

  return [
    // Falta `/` a propósito: hoy no es una página, es un redirect a
    // /preuniversitario mientras no exista la landing. Listar una dirección que
    // rebota es pedirle a Google que visite algo que no está ahí, y lo reporta
    // como "Página con redirección". Cuando la Fase 4 escriba la landing de
    // verdad, hay que volver a agregarla acá con prioridad 1.
    { url: url('/preuniversitario'), changeFrequency: 'weekly', priority: 1 },

    ...carreras.map(c => ({
      url: url(`/preuniversitario/${c.programa}/${c.carrera}`),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...cursos.map(c => ({
      url: url(`/preuniversitario/${c.programa}/${c.carrera}/${c.materia}`),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    // Las clases son el contenido por el que alguien puede llegar buscando
    // "suma de vectores por componentes". Son las páginas que importan.
    ...clases.map(c => ({
      url: url(`/clase/${c.materia}/${c.clase}`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
