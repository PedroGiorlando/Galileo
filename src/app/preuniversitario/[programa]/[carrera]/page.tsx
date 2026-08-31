import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BookOpen, Layers } from 'lucide-react'
import {
  getCarrera,
  getCursosDeCarrera,
  getPrograma,
  getRutasDeCarreras,
  getTemario,
} from '@/lib/contenido'
import { paletaDeMateria } from '@/lib/colores'
import { Header } from '@/components/Header'

type Params = { programa: string; carrera: string }

export async function generateStaticParams() {
  return getRutasDeCarreras()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { programa: pSlug, carrera: cSlug } = await params
  const programa = await getPrograma(pSlug)
  if (!programa) return {}
  const carrera = await getCarrera(programa.id, cSlug)
  if (!carrera) return {}

  return {
    title: `${carrera.nombre} — Ingreso ${programa.nombre}`,
    description: `Materias del ingreso a ${carrera.nombre} en ${programa.nombre}, con teoría, ejemplos resueltos y ejercicios que se corrigen solos.`,
    alternates: { canonical: `/preuniversitario/${pSlug}/${cSlug}` },
  }
}

/** Las materias que hay que rendir para entrar a una carrera. */
export default async function CarreraPage({ params }: { params: Promise<Params> }) {
  const { programa: pSlug, carrera: cSlug } = await params

  const programa = await getPrograma(pSlug)
  if (!programa) notFound()

  const carrera = await getCarrera(programa.id, cSlug)
  if (!carrera) notFound()

  const cursos = await getCursosDeCarrera(programa, carrera)
  const temarios = await Promise.all(cursos.map(c => getTemario(c.id)))

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Cursos', href: '/preuniversitario' },
          { label: programa.nombre, href: '/preuniversitario' },
          { label: carrera.nombre },
        ]}
      />

      <div className="border-b border-linea bg-white/70">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-xs uppercase tracking-widest text-galileo">
            {programa.nombre}
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold text-tinta sm:text-5xl">
            {carrera.nombre}
          </h1>
          <p className="mt-3 max-w-2xl text-tinta-suave">
            Estas son las materias que se rinden para entrar. Cada una tiene su programa completo,
            armado sobre lo que realmente toman.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {cursos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-linea p-8 text-center text-tinta-suave">
            Todavía no hay materias cargadas para esta carrera.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {cursos.map((curso, i) => {
              const paleta = paletaDeMateria(curso.materia.slug)
              const modulos = temarios[i]
              const clases = modulos.reduce((n, m) => n + m.clases.length, 0)
              const listas = modulos.reduce(
                (n, m) => n + m.clases.filter(c => c.tieneContenido).length,
                0,
              )

              return (
                <Link
                  key={curso.id}
                  href={`/preuniversitario/${pSlug}/${cSlug}/${curso.materia.slug}`}
                  className={`flex flex-col rounded-2xl border border-linea p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${paleta.fondo} ${paleta.bordeActivo}`}
                >
                  <h2 className="font-display text-2xl font-bold text-tinta">
                    {curso.materia.nombre}
                  </h2>
                  <p className="mt-1 flex-1 text-sm text-tinta-suave">{curso.descripcion}</p>

                  <ul className="mt-3 space-y-0.5">
                    {modulos.slice(0, 3).map(m => (
                      <li key={m.id} className="truncate text-xs text-tinta-suave">
                        · {m.nombre}
                      </li>
                    ))}
                    {modulos.length > 3 && (
                      <li className="text-xs text-tinta-suave">
                        · y {modulos.length - 3} más
                      </li>
                    )}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t border-white/60 pt-3 text-sm">
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-tinta-suave">
                      <span className="flex items-center gap-1.5">
                        <Layers size={15} className={paleta.texto} />
                        <span>{modulos.length}</span> módulos
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={15} className={paleta.texto} />
                        <span>{clases}</span> clases
                      </span>
                      {listas > 0 && (
                        <span className={`font-medium ${paleta.texto}`}>{listas} listas</span>
                      )}
                    </span>
                    <ArrowRight size={16} className={paleta.texto} />
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
