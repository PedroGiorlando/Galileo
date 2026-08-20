import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, ChevronRight, Layers, Sparkles } from 'lucide-react'
import { getCurso, getCursos, getRutasDeCursos, getTemario } from '@/lib/contenido'
import { Header } from '@/components/Header'
import { TemarioTabla } from '@/components/curso/TemarioTabla'
import { PanelCurso } from '@/components/curso/PanelCurso'

type Params = { curso: string }

export async function generateStaticParams() {
  return getRutasDeCursos()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { curso: cursoSlug } = await params
  const curso = await getCurso(cursoSlug)
  if (!curso) return {}

  return {
    title: curso.titulo,
    description: curso.descripcion ?? undefined,
    alternates: { canonical: `/preuniversitario/${cursoSlug}` },
  }
}

/**
 * Temario completo de una materia, agrupado por unidad. Es la puerta de entrada
 * que Google indexa, así que los títulos de todas las clases están en el HTML
 * aunque todavía no tengan contenido escrito.
 *
 * La barra lateral usa anclas (#vectores) y no filtros: así la página entera
 * sigue siendo estática, no hace falta JavaScript para navegarla, y todo el
 * temario queda en un solo documento indexable.
 */
export default async function CursoPage({ params }: { params: Promise<Params> }) {
  const { curso: cursoSlug } = await params
  const curso = await getCurso(cursoSlug)
  if (!curso) notFound()

  const [temario, cursos] = await Promise.all([getTemario(curso.id), getCursos()])
  const total = temario.reduce((n, t) => n + t.subtemas.length, 0)
  const listas = temario.reduce((n, t) => n + t.subtemas.filter(s => s.tieneContenido).length, 0)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Cursos', href: '/preuniversitario' },
          { label: curso.programa, href: '/preuniversitario' },
          { label: curso.nombre },
        ]}
      />

      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            href="/preuniversitario"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={14} /> Volver a {curso.programa}
          </Link>

          <div className="flex items-start gap-5">
            <span className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-full bg-orange-100 sm:flex">
              <Sparkles size={34} className="text-orange-600" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase text-orange-600">{curso.programa}</p>
              <h1 className="mt-0.5 text-3xl font-bold text-slate-900">{curso.nombre}</h1>
              <p className="mt-2 max-w-2xl text-slate-600">{curso.descripcion}</p>

              <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-700">
                <span className="flex items-center gap-2">
                  <BookOpen size={18} className="text-orange-500" />
                  <strong>{total} Clases</strong>
                </span>
                <span className="flex items-center gap-2">
                  <Layers size={18} className="text-orange-500" />
                  <strong>{temario.length} Unidades</strong>
                </span>
                <span className="text-slate-500">
                  {listas > 0 ? `${listas} listas para estudiar` : 'En preparación'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cambiar de materia. Con las no publicadas ocultas por RLS, acá solo
          aparecen las que un alumno puede abrir de verdad. */}
      {cursos.length > 1 && (
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3">
            {cursos.map(c => (
              <Link
                key={c.id}
                href={`/preuniversitario/${c.slug}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                  c.slug === curso.slug
                    ? 'bg-orange-500 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c.nombre}
              </Link>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto flex max-w-7xl flex-col items-start gap-6 p-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Unidades</h2>
            <ul className="space-y-1">
              {temario.map(unidad => (
                <li key={unidad.id}>
                  <a
                    href={`#${unidad.slug}`}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-800"
                  >
                    <span className="min-w-0">{unidad.nombre}</span>
                    <ChevronRight size={14} className="shrink-0 text-slate-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {temario.length === 0 ? (
          <p className="flex-1 rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Todavía no hay clases cargadas en esta materia.
          </p>
        ) : (
          <TemarioTabla cursoSlug={curso.slug} temario={temario} />
        )}

        <PanelCurso cursoSlug={curso.slug} cursoNombre={curso.nombre} totalClases={total} />
      </main>
    </>
  )
}
