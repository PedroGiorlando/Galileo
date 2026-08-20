import type { Metadata } from 'next'
import { PaginaEnPreparacion } from '@/components/PaginaEnPreparacion'

// ponytail: pagina en el menu antes de tener contenido. Va con noindex para
// que Google no la vea hasta que sea real.
export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  robots: { index: false, follow: true },
}

export default function Pagina() {
  return (
    <PaginaEnPreparacion
      titulo="Preguntas frecuentes"
      descripcion="Las dudas que más nos hacen sobre el ingreso, los cursos y la plataforma."
      queFalta="juntar las preguntas reales que ya reciben por WhatsApp y responderlas."
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Preguntas frecuentes' },
      ]}
    />
  )
}
