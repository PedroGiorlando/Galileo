import type { Metadata } from 'next'
import { PaginaEnPreparacion } from '@/components/PaginaEnPreparacion'

// ponytail: pagina en el menu antes de tener contenido. Va con noindex para
// que Google no la vea hasta que sea real.
export const metadata: Metadata = {
  title: 'Método',
  robots: { index: false, follow: true },
}

export default function Pagina() {
  return (
    <PaginaEnPreparacion
      titulo="Nuestro método"
      descripcion="Cómo está pensado el estudio: teoría breve, ejemplos resueltos paso a paso y ejercicios que se corrigen solos."
      queFalta="explicar el método de estudio y cómo se acompaña al alumno."
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Nuestro método' },
      ]}
    />
  )
}
