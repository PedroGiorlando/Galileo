import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, GraduationCap, Layers, PlayCircle } from 'lucide-react'
import { getCursos, getTemario } from '@/lib/contenido'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'Preuniversitario',
  description:
    'Cursos del ingreso universitario: Física, Química y Matemática con teoría, ejemplos resueltos, ejercicios que se corrigen solos y exámenes reales.',
  alternates: { canonical: '/preuniversitario' },
}

/**
 * Portada del nivel. Es servidor puro y sin estado: no muestra progreso a
 * propósito, porque eso obligaría a hidratarla entera para un dato que en una
 * pantalla de vistazo no cambia ninguna decisión. El progreso vive en la página
 * de cada materia, que es donde el alumno realmente lo mira.
 */
export default async function PreuniversitarioPage() {
  const cursos = await getCursos()
  const temarios = await Promise.all(cursos.map(c => getTemario(c.id)))

  const clasesDe = (i: number) => temarios[i].reduce((n, t) => n + t.subtemas.length, 0)
  const totalClases = cursos.reduce((n, _, i) => n + clasesDe(i), 0)
  const programa = cursos[0]?.programa ?? 'Ingreso Universitario'

  // Las clases que ya se pueden estudiar, con su materia al lado para que la
  // tarjeta se entienda sola fuera del contexto de su temario.
  const listas = cursos.flatMap((curso, i) =>
    temarios[i].flatMap(unidad =>
      unidad.subtemas
        .filter(s => s.tieneContenido)
        .map(s => ({ ...s, curso, unidad: unidad.nombre })),
    ),
  )

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Cursos', href: '/preuniversitario' },
          { label: programa },
        ]}
      />

      <div className="border-b border-slate-200 bg-gradient-to-r from-green-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-start gap-5">
            <span className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-full bg-green-100 sm:flex">
              <GraduationCap size={36} className="text-green-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-4xl font-bold text-slate-900">{programa}</h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Todas las materias del ingreso, organizadas por unidad y clase, para que estudies
                paso a paso y llegues al examen sabiendo qué te van a tomar.
              </p>
              <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-700">
                <span className="flex items-center gap-2">
                  <Layers size={18} className="text-green-600" />
                  <strong>
                    {cursos.length} {cursos.length === 1 ? 'Materia' : 'Materias'}
                  </strong>
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen size={18} className="text-green-600" />
                  <strong>{totalClases} Clases</strong>
                </span>
                {listas.length > 0 && (
                  <span className="flex items-center gap-2 text-green-700">
                    <PlayCircle size={18} />
                    <strong>
                      {listas.length} {listas.length === 1 ? 'lista' : 'listas'} para estudiar
                    </strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-7xl flex-col items-start gap-6 p-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Materias</h2>
            {cursos.length === 0 ? (
              <p className="text-sm text-slate-400">Todavía no hay materias publicadas.</p>
            ) : (
              <ul className="space-y-1">
                {cursos.map((curso, i) => (
                  <li key={curso.id}>
                    <Link
                      href={`/preuniversitario/${curso.slug}`}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-green-50 hover:text-green-800"
                    >
                      <span className="min-w-0">{curso.nombre}</span>
                      <span className="shrink-0 text-xs text-slate-400">{clasesDe(i)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-10">
          {cursos.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Todavía no hay materias publicadas.
            </p>
          )}

          {cursos.map((curso, i) => (
            <section key={curso.id}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{curso.nombre}</h2>
                <Link
                  href={`/preuniversitario/${curso.slug}`}
                  className="flex shrink-0 items-center gap-1 text-sm font-medium text-green-700 hover:underline"
                >
                  Ver las {clasesDe(i)} clases <ArrowRight size={14} />
                </Link>
              </div>
              <p className="mb-4 max-w-3xl text-sm text-slate-500">{curso.descripcion}</p>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {temarios[i].map(unidad => {
                  const listasEnUnidad = unidad.subtemas.filter(s => s.tieneContenido).length
                  return (
                    <Link
                      key={unidad.id}
                      // Cae directo en el ancla de esa unidad dentro del temario.
                      href={`/preuniversitario/${curso.slug}#${unidad.slug}`}
                      className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 hover:border-green-400 hover:shadow-sm"
                    >
                      <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                        {unidad.orden}
                      </span>
                      <h3 className="font-semibold text-slate-800">{unidad.nombre}</h3>
                      <ul className="mt-2 flex-1 space-y-0.5">
                        {unidad.subtemas.slice(0, 3).map(s => (
                          <li key={s.id} className="truncate text-xs text-slate-500">
                            · {s.titulo}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                        <span className="text-slate-500">
                          {unidad.subtemas.length} clases
                          {listasEnUnidad > 0 && (
                            <span className="text-green-700">
                              {' · '}
                              {listasEnUnidad} {listasEnUnidad === 1 ? 'lista' : 'listas'}
                            </span>
                          )}
                        </span>
                        <ArrowRight size={14} className="text-green-600" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}

          {listas.length > 0 && (
            <section>
              <h2 className="mb-1 text-2xl font-bold text-slate-900">Listas para estudiar</h2>
              <p className="mb-4 text-sm text-slate-500">
                Clases que ya tienen teoría, ejemplos resueltos y ejercicios corregidos.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {listas.map(clase => (
                  <Link
                    key={`${clase.curso.slug}-${clase.slug}`}
                    href={`/preuniversitario/${clase.curso.slug}/${clase.slug}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-green-400 hover:shadow-sm"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                      <PlayCircle size={20} className="text-green-700" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800">{clase.titulo}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {clase.curso.nombre} · {clase.unidad}
                        {clase.duracionLabel && ` · ${clase.duracionLabel}`}
                      </p>
                      {clase.gratis && (
                        <span className="mt-2 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Acceso libre
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
