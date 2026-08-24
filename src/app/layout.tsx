import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { DESCRIPCION, INDEXABLE, NOMBRE, URL_SITIO } from '@/lib/sitio'
import './globals.css'

/*
 * Tres roles, tres tipografías, cada una con un motivo:
 *
 * Space Grotesk para títulos — nació de una monoespaciada, así que tiene aire
 * técnico sin verse infantil. Los alumnos son de 17 a 19: hay que sonar serio
 * sin sonar a manual escolar.
 *
 * IBM Plex Sans para leer — se diseñó para textos largos en pantalla, que es
 * exactamente lo que hacen acá.
 *
 * IBM Plex Mono para fórmulas, duraciones y respuestas. No es estética: en una
 * tipografía proporcional, "Fx = 50 · cos 30°" se lee mal y los números no
 * alinean entre renglones.
 *
 * next/font las descarga en el build y las sirve desde el mismo dominio, así
 * que no hay pedido a Google en tiempo de ejecución ni salto de fuente.
 */
const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--fuente-display',
  display: 'swap',
})

const texto = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--fuente-texto',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--fuente-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  // Sin metadataBase, Next no puede convertir las direcciones relativas de los
  // canonical y de Open Graph en absolutas, y las etiquetas quedan inservibles:
  // og:url y og:image NO admiten rutas relativas.
  metadataBase: new URL(URL_SITIO),
  ...(INDEXABLE ? {} : { robots: { index: false, follow: false } }),
  title: {
    default: NOMBRE,
    template: `%s | ${NOMBRE}`,
  },
  description: DESCRIPCION,
  // Lo que se ve al pegar un link en WhatsApp, que en Argentina es por donde
  // va a circular el sitio. Sin esto aparece un rectángulo vacío con la
  // dirección, y nadie lo abre. Cada página completa su propio título y
  // descripción; acá van los valores comunes.
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: NOMBRE,
    title: NOMBRE,
    description: DESCRIPCION,
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  )
}
