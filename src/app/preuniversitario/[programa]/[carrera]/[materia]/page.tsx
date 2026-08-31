import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Layers } from 'lucide-react'
import { getCurso, getRutasDeCursos, getTemario } from '@/lib/contenido'
import { IMAGEN_OG } from '@/lib/sitio'
import { paletaDeMateria, paletaDeUnidad } from '@/lib/colores'
import { Header } from '@/components/Header'
import { TemarioTabla } from '@/components/curso/TemarioTabla'
import { PanelCurso } from '@/components/curso/PanelCurso'

type Params = { programa: string; carrera: string; materia: string }

export async function generateStaticParams() {
  return getRutasDeCursos()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { programa, carrera, materia } = await params
  const curso = await getCurso(programa, carrera, materia)
  if (!curso) return {}

  const canonical = `/preuniversitario/${programa}/${carrera}/${materia}`

  return {
    title: curso.titulo,
    description: curso.descripcion ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: `${curso.titulo} — ${curso.carrera.nombre}, ${curso.programa.nombre}`,
      description: curso.descripcion ?? undefined,
      url: canonical,
      images: [IMAGEN_OG],
    },
  }
}

/**
 * Temario de una materia dentro de una carrera: los módulos que ESE curso
 * incluye, en su propio orden.
 *
 * Dos columnas y no tres: con barra lateral y panel derecho, la columna del
 * medio quedaba tan angosta que el listado no entraba.
 */
export default async function CursoPage({ params }: { params: Promise<Params> }) {
  const { programa, carrera, materia: materiaSlug } = await params

  const curso = await getCurso(programa, carrera, materiaSlug)
  if (!curso) notFound()

  const temario = await getTemario(curso.id)
  const total = temario.reduce((n, m) => n + m.clases.length, 0)
  const listas = temario.reduce((n, m) => n + m.clases.filter(c => c.tieneContenido).length, 0)
  const paleta = paletaDeMateria(curso.materia.slug)
  const rutaCarrera = `/preuniversitario/${programa}/${carrera}`

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Cursos', href: '/preuniversitario' },
          { label: curso.programa.nombre, href: '/preuniversitario' },
          { label: curso.carrera.nombre, href: rutaCarrera },
          { label: curso.materia.nombre },
        ]}
      />

      <div className={`border-b border-linea ${paleta.fondo}`}>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Link
            href={rutaCarrera}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-tinta-suave hover:text-tinta"
          >
            <ArrowLeft size={14} /> {curso.carrera.nombre} · {curso.programa.nombre}
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <p className={`text-xs uppercase tracking-widest ${paleta.texto}`}>
                Materia
              </p>
              <h1 className="mt-1 font-display text-4xl font-bold text-tinta sm:text-5xl">
                {curso.materia.nombre}
              </h1>
              <p className="mt-3 max-w-2xl text-tinta-suave">{curso.descripcion}</p>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-tinta">
                <span className="flex items-center gap-2">
                  <BookOpen size={17} className={paleta.texto} />
                  <span>{total}</span> clases
                </span>
                <span className="flex items-center gap-2">
                  <Layers size={17} className={paleta.texto} />
                  <span>{temario.length}</span> módulos
                </span>
                <span className="text-tinta-suave">
                  {listas > 0 ? `${listas} ya disponibles` : 'En preparación'}
                </span>
              </div>
            </div>

            <div className="w-full lg:w-80">
              <PanelCurso
                materiaSlug={curso.materia.slug}
                materiaId={curso.materia.id}
                totalClases={total}
                paleta={paleta}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-56">
          <h2 className="mb-3 font-display text-sm font-semibold text-tinta">Módulos</h2>
          <ul className="space-y-0.5">
            {temario.map((modulo, i) => {
              const p = paletaDeUnidad(curso.materia.slug, i + 1)
              return (
                <li key={modulo.id}>
                  <a
                    href={`#${modulo.slug}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-tinta-suave transition-colors hover:bg-white hover:text-tinta"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${p.barra}`} />
                    <span className="min-w-0">{modulo.nombre}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </aside>

        {temario.length === 0 ? (
          <p className="flex-1 rounded-xl border border-dashed border-linea p-8 text-center text-tinta-suave">
            Todavía no hay módulos asignados a esta materia.
          </p>
        ) : (
          <TemarioTabla
            materiaSlug={curso.materia.slug}
            materiaId={curso.materia.id}
            temario={temario}
          />
        )}
      </main>
    </>
  )
}
