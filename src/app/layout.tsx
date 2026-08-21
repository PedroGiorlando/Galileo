import type { Metadata } from 'next'
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
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

/**
 * Mientras el sitio esté en construcción, ninguna página se indexa.
 *
 * Un sitio con tres clases cargadas indexado como si estuviera terminado es
 * contenido pobre, y Google castiga el dominio entero — justo lo que estamos
 * cuidando. Se abre poniendo NEXT_PUBLIC_INDEXABLE=true, el día que haya
 * contenido suficiente.
 *
 * Es `noindex` en los metadatos y no un robots.txt a propósito: robots.txt
 * pide que no rastreen, pero una página enlazada desde afuera puede terminar
 * indexada igual. El metadato es el que de verdad lo impide.
 */
const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === 'true'

export const metadata: Metadata = {
  ...(INDEXABLE ? {} : { robots: { index: false, follow: false } }),
  title: {
    default: 'Academia Galileo',
    template: '%s | Academia Galileo',
  },
  description:
    'Preparación para el ingreso universitario con explicaciones, ejemplos resueltos, ejercicios que se corrigen solos y exámenes reales.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  )
}
