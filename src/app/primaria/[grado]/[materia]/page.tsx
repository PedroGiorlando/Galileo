import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, Lock } from 'lucide-react'
import { getCurso, getRutasDeCursos, getTemario } from '@/lib/temas'
import { Header } from '@/components/Header'

type Params = { grado: string; materia: string }

export async function generateStaticParams() {
  return getRutasDeCursos()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { grado, materia } = await params
  const curso = await getCurso(grado, materia)
  if (!curso) return {}

  return {
    title: curso.titulo,
    description: curso.descripcion ?? undefined,
    alternates: { canonical: `/primaria/${grado}/${materia}` },
  }
}

/**
 * Página del curso: el temario completo. Es la puerta de entrada que Google va
 * a indexar y desde donde se enlaza cada tema, así que los títulos de los temas
 * están en el HTML aunque el tema esté bloqueado.
 */
export default async function CursoPage({ params }: { params: Promise<Params> }) {
  const { grado, materia } = await params
  const curso = await getCurso(grado, materia)
  if (!curso) notFound()

  const temario = await getTemario(curso.id)
  const gratis = temario.filter(t => t.gratis).length

  return (
    <>
      <Header breadcrumbs={['Inicio', 'Primaria', curso.gradoNombre, curso.materia]} />

      <main className="mx-auto max-w-4xl p-6">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase text-green-700">{curso.materia}</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{curso.titulo}</h1>
          {curso.descripcion && <p className="mt-2 text-slate-600">{curso.descripcion}</p>}
          <p className="mt-3 text-sm text-slate-500">
            {temario.length} {temario.length === 1 ? 'tema' : 'temas'}
            {gratis > 0 && ` · ${gratis} de acceso libre`}
          </p>
        </header>

        {temario.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Todavía no hay temas publicados en este curso.
          </p>
        ) : (
          <ol className="space-y-2">
            {temario.map(t => (
              <li key={t.id}>
                <Link
                  href={`/primaria/${grado}/${materia}/${t.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-green-400 hover:bg-green-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                    {t.orden}
                  </span>
                  <span className="flex-1 font-medium text-slate-800">{t.titulo}</span>
                  {t.gratis ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      <BookOpen size={12} /> Libre
                    </span>
                  ) : (
                    <Lock size={14} className="text-slate-300" />
                  )}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  )
}
