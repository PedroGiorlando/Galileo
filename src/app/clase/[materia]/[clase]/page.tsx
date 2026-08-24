import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'
import { getClase, getRutasDeClases } from '@/lib/contenido'
import { IMAGEN_OG } from '@/lib/sitio'
import { Header } from '@/components/Header'
import { SubtemaVista } from '@/components/SubtemaVista'
import { NavegacionClases } from '@/components/NavegacionClases'

type Params = { materia: string; clase: string }

/**
 * Una clase vive en UNA sola dirección, por materia, aunque aparezca en varias
 * carreras. Cinemática es el mismo contenido para UNCuyo y para UTN: publicarla
 * dos veces le daría a Google dos páginas idénticas compitiendo entre sí.
 *
 * Solo se prerenderizan las clases que ya tienen contenido: el resto responden
 * "Próximamente" y no vale la pena generarlas en el build.
 */
export async function generateStaticParams() {
  return getRutasDeClases()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { materia, clase: claseSlug } = await params
  const datos = await getClase(materia, claseSlug)
  if (!datos) return {}

  const canonical = `/clase/${materia}/${claseSlug}`

  if (!datos.clase) {
    return {
      title: `${datos.resumen.titulo} — próximamente`,
      robots: { index: false, follow: true },
      alternates: { canonical },
    }
  }

  // La descripción sale de los objetivos porque es lo que responde "¿qué me
  // llevo si entro acá?", que es lo que decide el clic en Google. Se corta a
  // 160 caracteres: más que eso, el buscador lo trunca con puntos suspensivos.
  const descripcion = recortar(datos.clase.objetivos.join(' '), 160)

  return {
    title: `${datos.clase.titulo} — ${datos.materia.nombre}`,
    description: descripcion,
    alternates: { canonical },
    // Una clase es lo que alguien pega en un grupo de WhatsApp. `type: article`
    // en vez de `website` porque es una pieza de contenido, no una portada.
    openGraph: {
      type: 'article',
      title: `${datos.clase.titulo} — ${datos.materia.nombre}`,
      description: descripcion,
      url: canonical,
      images: [IMAGEN_OG],
    },
  }
}

/** Corta en el último espacio antes del límite, así no parte una palabra. */
function recortar(texto: string, maximo: number): string {
  if (texto.length <= maximo) return texto
  const corte = texto.lastIndexOf(' ', maximo - 1)
  return `${texto.slice(0, corte > 0 ? corte : maximo - 1)}…`
}

export default async function ClasePage({ params }: { params: Promise<Params> }) {
  const { materia: materiaSlug, clase: claseSlug } = await params
  const datos = await getClase(materiaSlug, claseSlug)
  if (!datos) notFound()

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Cursos', href: '/preuniversitario' },
    { label: datos.materia.nombre },
    { label: datos.modulo.nombre },
    { label: datos.resumen.titulo },
  ]

  if (!datos.clase) {
    return (
      <>
        <Header breadcrumbs={breadcrumbs} />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Clock size={28} className="text-slate-400" />
          </span>
          <p className="font-mono text-xs uppercase tracking-widest text-galileo">
            {datos.modulo.nombre}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-tinta">
            {datos.resumen.titulo}
          </h1>
          <p className="mt-3 text-tinta-suave">
            Esta clase todavía está en preparación. Estamos escribiendo la explicación, los
            ejemplos resueltos y los ejercicios.
          </p>
          <Link
            href="/preuniversitario"
            className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-galileo px-5 py-2.5 text-sm font-medium text-white hover:bg-galileo-oscuro"
          >
            <ArrowLeft size={16} /> Ver los cursos
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Header breadcrumbs={breadcrumbs} />
      <SubtemaVista
        subtema={datos.clase}
        subtemaId={datos.resumen.id}
        materia={datos.materia}
        moduloNombre={datos.modulo.nombre}
        temario={datos.temario}
      />
      <NavegacionClases
        materiaSlug={materiaSlug}
        temario={datos.temario}
        slugActual={datos.resumen.slug}
      />
    </>
  )
}
