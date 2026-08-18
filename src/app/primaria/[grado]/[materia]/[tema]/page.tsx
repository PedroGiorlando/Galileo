import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tema } from '@/data/topicData'
import { Header } from '@/components/Header'
import { TemaVista } from '@/components/TemaVista'

type Params = { grado: string; materia: string; tema: string }

// ponytail: un solo tema hardcodeado, así que la ruta se valida contra él.
// Fase 1 reemplaza esto por una query a Supabase por (grado, materia, slug).
function buscarTema({ grado, materia, tema: temaSlug }: Params) {
  const coincide =
    grado === tema.gradoSlug && materia === tema.materiaSlug && temaSlug === tema.slug
  return coincide ? tema : null
}

// Le dice a Next qué URLs generar como HTML estático en el build. Sin esto la
// ruta es dinámica y se renderiza en cada visita — más lenta y peor para SEO.
export function generateStaticParams(): Params[] {
  return [{ grado: tema.gradoSlug, materia: tema.materiaSlug, tema: tema.slug }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const encontrado = buscarTema(await params)
  if (!encontrado) return {}

  return {
    title: `${encontrado.titulo} — ${encontrado.materia} ${encontrado.grado}`,
    description: encontrado.objetivos.join(' '),
    alternates: {
      canonical: `/primaria/${encontrado.gradoSlug}/${encontrado.materiaSlug}/${encontrado.slug}`,
    },
  }
}

export default async function TemaPage({ params }: { params: Promise<Params> }) {
  // En Next 15+ `params` es una promesa: la ruta puede resolverse después de
  // empezar a renderizar, así que hay que esperarla.
  const encontrado = buscarTema(await params)
  if (!encontrado) notFound()

  return (
    <>
      <Header
        breadcrumbs={[
          'Inicio',
          'Primaria',
          encontrado.grado,
          encontrado.categoria,
          encontrado.titulo,
        ]}
      />
      <TemaVista />
    </>
  )
}
