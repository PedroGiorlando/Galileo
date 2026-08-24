import type { MetadataRoute } from 'next'
import { INDEXABLE, URL_SITIO } from '@/lib/sitio'

/**
 * Next genera /robots.txt con esto.
 *
 * Mientras el sitio no sea indexable se prohíbe todo. Igual las páginas llevan
 * `noindex` en sus metadatos: robots.txt solo pide que no rastreen, y una
 * página enlazada desde otro sitio puede aparecer en Google igual. Se necesitan
 * los dos.
 *
 * Cuando se abra, quedan afuera las zonas que no tienen nada que hacer en un
 * buscador: el panel, la cuenta del alumno y el callback de autenticación.
 */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/mi-cuenta', '/auth', '/ingresar', '/registrarse'],
    },
    sitemap: `${URL_SITIO}/sitemap.xml`,
  }
}
