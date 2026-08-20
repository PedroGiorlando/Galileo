import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, GraduationCap, Layers } from 'lucide-react'
import { getCursos, getTemario } from '@/lib/contenido'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'Preuniversitario',
  description:
    'Cursos del ingreso universitario: Física, Química y Matemática con teoría, ejemplos resueltos, ejercicios que se corrigen solos y exámenes reales.',
  alternates: { canonical: '/preuniversitario' },
}

export default async function PreuniversitarioPage() {
  const cursos = await getCursos()

  // Un temario por materia. Son pocas consultas y en paralelo; si algún día son
  // muchas materias, convendría una sola consulta con los conteos agregados.
  const temarios = await Promise.all(cursos.map(c => getTemario(c.id)))

  const totalClases = temarios.reduce(
    (n, t) => n + t.reduce((m, tema) => m + tema.subtemas.length, 0),
    0,
  )
  const programa = cursos[0]?.programa ?? 'Ingreso Universitario'

  return (
    <>
      <Header breadcrumbs={['Inicio', 'Cursos', 'Preuniversitario']} />

      <main className="mx-auto max-w-6xl p-6">
        <header className="mb-8 flex items-start gap-5">
          <span className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-full bg-green-100 sm:flex">
            <GraduationCap size={36} className="text-green-700" />
          </span>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{programa}</h1>
            <p className="mt-1 max-w-xl text-slate-600">
              Todas las materias del ingreso, organizadas por unidad y clase, para que estudies
              paso a paso y llegues al examen sabiendo qué te van a tomar.
            </p>
            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <Layers size={18} className="text-green-600" />
                <strong>
                  {cursos.length} {cursos.length === 1 ? 'Materia' : 'Materias'}
                </strong>
              </span>
              <span className="flex items-center gap-2 text-slate-700">
                <BookOpen size={18} className="text-green-600" />
                <strong>{totalClases} Clases</strong>
              </span>
            </div>
          </div>
        </header>

        {cursos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Todavía no hay materias publicadas.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cursos.map((curso, i) => {
              const temario = temarios[i]
              const clases = temario.reduce((n, t) => n + t.subtemas.length, 0)
              const listas = temario.reduce(
                (n, t) => n + t.subtemas.filter(s => s.tieneContenido).length,
                0,
              )

              return (
                <Link
                  key={curso.id}
                  href={`/preuniversitario/${curso.slug}`}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 hover:border-green-400 hover:shadow-sm"
                >
                  <span className="mb-3 self-start rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    {curso.nombre}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{curso.titulo}</h2>
                  <p className="mt-1 flex-1 text-sm text-slate-600">{curso.descripcion}</p>

                  <ul className="mt-3 space-y-1">
                    {temario.slice(0, 3).map(t => (
                      <li key={t.id} className="text-sm text-slate-600">
                        · {t.nombre}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-sm text-slate-500">
                      {clases} clases
                      {listas > 0 && <span className="text-green-700"> · {listas} listas</span>}
                    </span>
                    <ArrowRight size={18} className="text-green-600" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
