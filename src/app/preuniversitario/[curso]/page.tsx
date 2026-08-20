import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Layers } from 'lucide-react'
import { getCurso, getCursos, getRutasDeCursos, getTemario } from '@/lib/contenido'
import { paletaDeMateria, paletaDeUnidad } from '@/lib/colores'
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
 * Temario de una materia. Dos columnas y no tres: con barra lateral e panel
 * derecho, la columna del medio quedaba tan angosta que el listado no entraba.
 *
 * La barra lateral usa anclas (#vectores) y no filtros: la página entera sigue
 * siendo estática, se navega sin JavaScript, y todo el temario queda en un solo
 * documento indexable.
 */
export default async function CursoPage({ params }: { params: Promise<Params> }) {
  const { curso: cursoSlug } = await params
  const curso = await getCurso(cursoSlug)
  if (!curso) notFound()

  const [temario, cursos] = await Promise.all([getTemario(curso.id), getCursos()])
  const total = temario.reduce((n, t) => n + t.subtemas.length, 0)
  const listas = temario.reduce((n, t) => n + t.subtemas.filter(s => s.tieneContenido).length, 0)
  const paleta = paletaDeMateria(curso.slug)

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

      <div className={`border-b border-linea ${paleta.fondo}`}>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Link
            href="/preuniversitario"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-tinta-suave hover:text-tinta"
          >
            <ArrowLeft size={14} /> {curso.programa}
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <p className={`font-mono text-xs uppercase tracking-widest ${paleta.texto}`}>
                Materia
              </p>
              <h1 className="mt-1 font-display text-4xl font-bold text-tinta sm:text-5xl">
                {curso.nombre}
              </h1>
              <p className="mt-3 max-w-2xl text-tinta-suave">{curso.descripcion}</p>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-tinta">
                <span className="flex items-center gap-2">
                  <BookOpen size={17} className={paleta.texto} />
                  <span className="font-mono">{total}</span> clases
                </span>
                <span className="flex items-center gap-2">
                  <Layers size={17} className={paleta.texto} />
                  <span className="font-mono">{temario.length}</span> unidades
                </span>
                <span className="text-tinta-suave">
                  {listas > 0 ? `${listas} ya disponibles` : 'En preparación'}
                </span>
              </div>
            </div>

            <div className="w-full lg:w-80">
              <PanelCurso cursoSlug={curso.slug} totalClases={total} paleta={paleta} />
            </div>
          </div>
        </div>
      </div>

      {/* Cambiar de materia. Envuelve en vez de deslizar: con pocas materias
          entran en una línea, y si crecen bajan a la siguiente. */}
      {cursos.length > 1 && (
        <div className="border-b border-linea bg-white/60">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 py-3">
            {cursos.map(c => {
              const p = paletaDeMateria(c.slug)
              const activa = c.slug === curso.slug
              return (
                <Link
                  key={c.id}
                  href={`/preuniversitario/${c.slug}`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activa
                      ? `${p.solido} text-white`
                      : `border border-linea text-tinta-suave hover:${p.fondo}`
                  }`}
                >
                  {c.nombre}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <main className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-56">
          <h2 className="mb-3 font-display text-sm font-semibold text-tinta">Unidades</h2>
          <ul className="space-y-0.5">
            {temario.map(unidad => {
              const p = paletaDeUnidad(curso.slug, unidad.orden)
              return (
                <li key={unidad.id}>
                  <a
                    href={`#${unidad.slug}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-tinta-suave transition-colors hover:bg-white hover:text-tinta"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${p.barra}`} />
                    <span className="min-w-0">{unidad.nombre}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </aside>

        {temario.length === 0 ? (
          <p className="flex-1 rounded-xl border border-dashed border-linea p-8 text-center text-tinta-suave">
            Todavía no hay clases cargadas en esta materia.
          </p>
        ) : (
          <TemarioTabla cursoSlug={curso.slug} temario={temario} />
        )}
      </main>
    </>
  )
}
