import type { Metadata } from 'next'
import { PaginaEnPreparacion } from '@/components/PaginaEnPreparacion'

// ponytail: pagina en el menu antes de tener contenido. Va con noindex para
// que Google no la vea hasta que sea real.
export const metadata: Metadata = {
  title: 'Buscar',
  robots: { index: false, follow: true },
}

export default function Pagina() {
  return (
    <PaginaEnPreparacion
      titulo="Buscador"
      descripcion="Encontrá una clase por su nombre o por el tema que estés estudiando."
      queFalta="el buscador sobre las clases publicadas."
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Buscador' },
      ]}
    />
  )
}
