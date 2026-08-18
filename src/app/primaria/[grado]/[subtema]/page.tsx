import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'
import { getRutasDeSubtemas, getSubtema } from '@/lib/contenido'
import { Header } from '@/components/Header'
import { SubtemaVista } from '@/components/SubtemaVista'

type Params = { grado: string; subtema: string }

/**
 * Solo se prerenderizan los subtemas que ya tienen contenido. Los demás se
 * sirven bajo demanda: son ~170 páginas que dicen lo mismo y nadie las busca.
 */
export async function generateStaticParams() {
  return getRutasDeSubtemas()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { grado, subtema: slug } = await params
  const datos = await getSubtema(grado, slug)
  if (!datos) return {}

  const canonical = `/primaria/${grado}/${slug}`

  // Un subtema sin contenido no aporta nada a quien llega de Google: se sirve,
  // pero pidiendo explícitamente que no se indexe. Indexar 170 páginas casi
  // vacías es lo que Google castiga como contenido pobre.
  if (!datos.subtema) {
    return {
      title: `${datos.resumen.titulo} — próximamente`,
      robots: { index: false, follow: true },
      alternates: { canonical },
    }
  }

  return {
    title: `${datos.subtema.titulo} — ${datos.curso.titulo}`,
    description: datos.subtema.objetivos.join(' '),
    alternates: { canonical },
  }
}

export default async function SubtemaPage({ params }: { params: Promise<Params> }) {
  const { grado, subtema: slug } = await params
  const datos = await getSubtema(grado, slug)
  if (!datos) notFound()

  const breadcrumbs = [
    'Inicio',
    'Cursos',
    'Primaria',
    datos.curso.gradoNombre,
    datos.tema.nombre,
    datos.resumen.titulo,
  ]

  if (!datos.subtema) {
    return (
      <>
        <Header breadcrumbs={breadcrumbs} />
        <main className="mx-auto max-w-2xl p-6 py-16 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Clock size={28} className="text-slate-400" />
          </span>
          <p className="text-sm font-semibold uppercase text-orange-500">{datos.tema.nombre}</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{datos.resumen.titulo}</h1>
          <p className="mt-3 text-slate-600">
            Este tema todavía está en preparación. Estamos escribiendo la explicación, los ejemplos
            resueltos y los ejercicios.
          </p>
          <Link
            href={`/primaria/${grado}`}
            className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            <ArrowLeft size={16} /> Ver el temario de {datos.curso.gradoNombre}
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Header breadcrumbs={breadcrumbs} />
      <SubtemaVista
        subtema={datos.subtema}
        curso={datos.curso}
        temaNombre={datos.tema.nombre}
        temario={datos.temario}
      />
    </>
  )
}
