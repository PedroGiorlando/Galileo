import type { Metadata } from 'next'
import { PaginaEnPreparacion } from '@/components/PaginaEnPreparacion'

// ponytail: pagina en el menu antes de tener contenido. Va con noindex para
// que Google no la vea hasta que sea real.
export const metadata: Metadata = {
  title: 'Contacto',
  robots: { index: false, follow: true },
}

export default function Pagina() {
  return (
    <PaginaEnPreparacion
      titulo="Contacto"
      descripcion="Escribinos y te respondemos. Estamos para ayudarte con el ingreso."
      queFalta="el número de WhatsApp del preuniversitario, el mail y los horarios de atención."
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Contacto' },
      ]}
    />
  )
}
