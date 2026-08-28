import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Eye, PencilLine } from 'lucide-react'
import { esAdmin, getUsuario } from '@/lib/progreso'
import { getClaseParaAdmin, getMateria, getTemarioDeMateria } from '@/lib/contenido'
import { sinRespuestas } from '@/lib/publico'
import type { TemaContenido } from '@/lib/schemas'
import { Header } from '@/components/Header'
import { SubtemaVista } from '@/components/SubtemaVista'

export const metadata: Metadata = {
  title: 'Vista previa',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Ver una clase como la va a ver el alumno, ANTES de publicarla.
 *
 * Sin esto, revisar el trabajo obligaba a publicar la clase, mirarla y volver a
 * despublicarla — con la ventana en el medio en la que cualquiera la ve a
 * medio escribir.
 *
 * Vive bajo /admin y no en la ruta pública a propósito. La página pública lee
 * con el cliente anónimo, y eso es lo que la deja ser estática: si leyera la
 * sesión para decidir si mostrar borradores, Next tendría que renderizarla en
 * cada visita y perderíamos el SEO de todas las clases para darle una
 * comodidad a dos personas.
 */
export default async function VistaPreviaPage({
  params,
}: {
  params: Promise<{ materia: string; clase: string }>
}) {
  const usuario = await getUsuario()
  if (!usuario) redirect('/ingresar')
  if (!(await esAdmin())) redirect('/admin')

  const { materia: materiaSlug, clase: claseSlug } = await params

  const materia = await getMateria(materiaSlug)
  if (!materia) notFound()

  const fila = await getClaseParaAdmin(materia.id, claseSlug)
  if (!fila) notFound()

  if (!fila.contenido) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: 'Panel', href: '/admin' },
            { label: materia.nombre, href: `/admin/${materia.slug}` },
            { label: 'Vista previa' },
          ]}
        />
        <main className="mx-auto max-w-md px-6 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-tinta">Todavía no hay nada</h1>
          <p className="mt-2 text-tinta-suave">
            Esta clase no tiene contenido guardado, así que no hay nada para previsualizar.
          </p>
          <Link
            href={`/admin/${materia.slug}/${claseSlug}`}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-galileo px-5 text-sm font-medium text-white hover:bg-galileo-oscuro"
          >
            <PencilLine size={15} /> Escribirla
          </Link>
        </main>
      </>
    )
  }

  // Un borrador puede estar a medias: las listas que falten se completan
  // vacías. Con un parse estricto acá, la vista previa se rompería justo con
  // las clases para las que existe.
  const contenido: TemaContenido = {
    objetivos: [],
    videos: [],
    explicacion: [],
    ejemplos: [],
    practicos: [],
    evaluaciones: [],
    ...(fila.contenido as object),
  }

  const subtema = sinRespuestas({
    id: fila.orden,
    slug: fila.slug,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    duracionLabel: fila.duracion_label ?? '',
    ...contenido,
  })

  const modulo = fila.modulos as unknown as { nombre: string }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Panel', href: '/admin' },
          { label: materia.nombre, href: `/admin/${materia.slug}` },
          { label: fila.titulo },
        ]}
      />

      {/* Que quede clarísimo que esto no es lo que ve el público. Una vista
          previa que se confunde con la página real es peor que ninguna. */}
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-amber-900">
            <Eye size={16} className="shrink-0" />
            <span>
              <strong className="font-semibold">Vista previa.</strong>{' '}
              {fila.publicado
                ? 'Esta clase está publicada: así la ve un alumno.'
                : 'Esta clase NO está publicada. Nadie más que vos puede verla.'}
            </span>
          </p>
          <Link
            href={`/admin/${materia.slug}/${claseSlug}`}
            className="flex min-h-11 items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 text-sm font-medium text-amber-900 hover:bg-amber-100"
          >
            <PencilLine size={15} /> Volver a editarla
          </Link>
        </div>
      </div>

      <SubtemaVista
        subtema={subtema}
        subtemaId={fila.id}
        materia={materia}
        moduloNombre={modulo?.nombre ?? ''}
        temario={await getTemarioDeMateria(materia.id)}
      />
    </>
  )
}
