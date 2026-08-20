import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Clock, Layers } from 'lucide-react'
import { getCurso, getRutasDeCursos, getTemario } from '@/lib/contenido'
import { Header } from '@/components/Header'

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
 */
export default async function CursoPage({ params }: { params: Promise<Params> }) {
  const { curso: cursoSlug } = await params
  const curso = await getCurso(cursoSlug)
  if (!curso) notFound()

  const temario = await getTemario(curso.id)
  const total = temario.reduce((n, t) => n + t.subtemas.length, 0)
  const listos = temario.reduce((n, t) => n + t.subtemas.filter(s => s.tieneContenido).length, 0)

  return (
    <>
      <Header breadcrumbs={['Inicio', 'Cursos', curso.programa, curso.nombre]} />

      <main className="mx-auto max-w-5xl p-6">
        <Link
          href="/preuniversitario"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={14} /> Volver a {curso.programa}
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{curso.nombre}</h1>
          <p className="mt-1 max-w-2xl text-slate-600">{curso.descripcion}</p>
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-700">
            <span className="flex items-center gap-2">
              <BookOpen size={18} className="text-orange-500" />
              <strong>{total} Temas</strong>
            </span>
            <span className="flex items-center gap-2">
              <Layers size={18} className="text-orange-500" />
              <strong>{temario.length} Áreas</strong>
            </span>
            <span className="flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              {listos > 0 ? `${listos} listos para estudiar` : 'En preparación'}
            </span>
          </div>
        </header>

        <div className="space-y-8">
          {temario.map(tema => (
            <section key={tema.id}>
              <div className="mb-3 flex items-baseline justify-between border-b border-slate-200 pb-2">
                <h2 className="text-xl font-bold text-slate-900">{tema.nombre}</h2>
                <span className="text-sm text-orange-600">
                  {tema.subtemas.length} temas en total
                </span>
              </div>

              <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {tema.subtemas.map(s => (
                  <li key={s.id}>
                    <Link
                      href={`/preuniversitario/${cursoSlug}/${s.slug}`}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          s.tieneContenido
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {s.orden}
                      </span>
                      <span className="min-w-0 flex-1 font-medium text-slate-800">{s.titulo}</span>
                      {s.gratis && s.tieneContenido && (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Libre
                        </span>
                      )}
                      {!s.tieneContenido && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                          Próximamente
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}
