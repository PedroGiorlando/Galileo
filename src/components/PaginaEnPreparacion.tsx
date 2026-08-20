import Link from 'next/link'
import { ArrowLeft, Hammer } from 'lucide-react'
import { Header, type Miga } from './Header'

/**
 * Página que todavía no existe pero ya está en el menú.
 *
 * Es honesta a propósito: dice que está en preparación en vez de mostrar
 * relleno que parezca contenido. Todas las que la usan piden `noindex`, así
 * que Google no las ve — publicar páginas casi vacías es lo que penaliza como
 * contenido pobre, y el SEO es el canal de adquisición del proyecto.
 *
 * `queFalta` no es decorativo: deja escrito en la propia página qué hace falta
 * para terminarla, así no se convierte en una deuda que nadie recuerda.
 */
export function PaginaEnPreparacion({
  titulo,
  descripcion,
  queFalta,
  breadcrumbs,
}: {
  titulo: string
  descripcion: string
  queFalta: string
  breadcrumbs: Miga[]
}) {
  return (
    <>
      <Header breadcrumbs={breadcrumbs} />
      <main className="mx-auto max-w-2xl p-6 py-16 text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Hammer size={26} className="text-slate-400" />
        </span>
        <h1 className="text-3xl font-bold text-slate-900">{titulo}</h1>
        <p className="mt-3 text-slate-600">{descripcion}</p>

        <p className="mx-auto mt-6 max-w-md rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
          Pendiente: {queFalta}
        </p>

        <Link
          href="/preuniversitario"
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          <ArrowLeft size={16} /> Ver los cursos
        </Link>
      </main>
    </>
  )
}
