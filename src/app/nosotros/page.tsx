import type { Metadata } from 'next'
import { PaginaEnPreparacion } from '@/components/PaginaEnPreparacion'

// ponytail: pagina en el menu antes de tener contenido. Va con noindex para
// que Google no la vea hasta que sea real.
export const metadata: Metadata = {
  title: 'Nosotros',
  robots: { index: false, follow: true },
}

export default function Pagina() {
  return (
    <PaginaEnPreparacion
      titulo="Nosotros"
      descripcion="Quiénes somos, desde cuándo damos clases y por qué armamos esta plataforma."
      queFalta="la historia del preuniversitario, los profesores y sus materias."
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Nosotros' },
      ]}
    />
  )
}
