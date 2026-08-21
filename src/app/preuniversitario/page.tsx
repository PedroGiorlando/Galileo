import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { getCarreras, getProgramas } from '@/lib/contenido'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'Cursos',
  description:
    'Preparación para el ingreso a UNCuyo y UTN FRM: Física, Química y Matemática con teoría, ejemplos resueltos, ejercicios que se corrigen solos y exámenes reales.',
  alternates: { canonical: '/preuniversitario' },
}

export default async function CursosPage() {
  const programas = await getProgramas()
  const carrerasPorPrograma = await Promise.all(programas.map(p => getCarreras(p.id)))

  return (
    <>
      <Header
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Cursos' }]}
      />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 flex items-start gap-5">
          <span className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-full bg-galileo/10 sm:flex">
            <GraduationCap size={36} className="text-galileo" />
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold text-tinta sm:text-5xl">Cursos</h1>
            <p className="mt-3 max-w-2xl text-tinta-suave">
              Elegí a qué universidad te presentás. Cada ingreso tiene su programa, y las clases
              están armadas sobre lo que realmente toman.
            </p>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {programas.map((programa, i) => (
            <section
              key={programa.id}
              className="rounded-2xl border border-linea bg-white p-5"
            >
              <h2 className="font-display text-2xl font-bold text-tinta">{programa.nombre}</h2>

              {carrerasPorPrograma[i].length === 0 ? (
                <p className="mt-2 text-sm text-tinta-suave">Todavía sin carreras cargadas.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {carrerasPorPrograma[i].map(carrera => (
                    <li key={carrera.id}>
                      <Link
                        href={`/preuniversitario/${programa.slug}/${carrera.slug}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-linea px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-galileo hover:shadow-sm"
                      >
                        <span className="font-medium text-tinta">{carrera.nombre}</span>
                        <ArrowRight size={16} className="shrink-0 text-galileo" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </>
  )
}
