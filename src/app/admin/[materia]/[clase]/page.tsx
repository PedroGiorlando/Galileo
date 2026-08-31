import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { esAdmin, getUsuario } from '@/lib/progreso'
import { getClaseParaAdmin, getMateria } from '@/lib/contenido'
import { contenidoDesdeTema, contenidoVacio, type ContenidoBorrador } from '@/lib/borrador'
import { normalizarContenido, type TemaMeta } from '@/lib/schemas'
import { Header } from '@/components/Header'
import { EditorSubtema } from '@/components/admin/EditorSubtema'
import { tema as contenidoDeArranque } from '@/data/topicData'

export const metadata: Metadata = {
  title: 'Editar clase',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

// La lectura tolerante vive en schemas.ts, junto al schema estricto que es su
// contracara: al guardar una clase publicada se exige todo, al abrirla hay que
// poder leer cualquier cosa. Estaba escrita acá, en contenido-servidor.ts y en
// las acciones del examen — y solo dos de las tres estaban bien.

export default async function AdminClasePage({
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

  const modulo = fila.modulos as unknown as { nombre: string }
  const tieneContenido = fila.contenido != null

  const meta: TemaMeta = {
    slug: fila.slug,
    titulo: fila.titulo,
    descripcion: fila.descripcion ?? '',
    categoria: modulo.nombre,
    orden: fila.orden,
    duracionLabel: fila.duracion_label ?? '00:00',
    gratis: fila.gratis,
    publicado: fila.publicado,
  }

  // Con contenido se edita lo guardado. Sin contenido, el formulario arranca
  // vacío — salvo la clase de arranque, que trae el ejemplo de referencia para
  // que se vea qué nivel de detalle se espera.
  const esLaDeArranque = fila.slug === contenidoDeArranque.slug

  const contenido: ContenidoBorrador = tieneContenido
    ? contenidoDesdeTema(normalizarContenido(fila.contenido))
    : esLaDeArranque
      ? contenidoDesdeTema(contenidoDeArranque)
      : contenidoVacio()

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Panel', href: '/admin' },
          { label: materia.nombre, href: `/admin/${materia.slug}` },
          { label: fila.titulo },
        ]}
      />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-xs uppercase tracking-widest text-galileo">{modulo.nombre}</p>
        <h1 className="mt-1 mb-6 font-display text-3xl font-bold text-tinta">{fila.titulo}</h1>
        <EditorSubtema
          materiaId={materia.id}
          materiaSlug={materia.slug}
          rutaClase={`/clase/${materia.slug}`}
          metaInicial={meta}
          contenidoInicial={contenido}
          desdeLaBase={tieneContenido}
        />
      </div>
    </>
  )
}
