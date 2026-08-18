import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRutasDeTemas, getTema } from '@/lib/temas'
import { Header } from '@/components/Header'
import { TemaVista } from '@/components/TemaVista'

type Params = { grado: string; materia: string; tema: string }

// Le dice a Next qué URLs generar como HTML estático en el build. Sin esto la
// ruta es dinámica y se renderiza en cada visita — más lenta y peor para SEO.
export async function generateStaticParams() {
  return getRutasDeTemas()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { grado, materia, tema: temaSlug } = await params
  const datos = await getTema(grado, materia, temaSlug)
  if (!datos) return {}

  return {
    title: `${datos.tema.titulo} — ${datos.curso.titulo}`,
    description: datos.tema.objetivos.join(' '),
    alternates: { canonical: `/primaria/${grado}/${materia}/${temaSlug}` },
  }
}

export default async function TemaPage({ params }: { params: Promise<Params> }) {
  // En Next 15+ `params` es una promesa: la ruta puede resolverse después de
  // empezar a renderizar, así que hay que esperarla.
  const { grado, materia, tema: temaSlug } = await params
  const datos = await getTema(grado, materia, temaSlug)
  if (!datos) notFound()

  return (
    <>
      <Header
        breadcrumbs={[
          'Inicio',
          'Primaria',
          datos.curso.gradoNombre,
          datos.tema.categoria,
          datos.tema.titulo,
        ]}
      />
      <TemaVista tema={datos.tema} temario={datos.temario} />
    </>
  )
}
