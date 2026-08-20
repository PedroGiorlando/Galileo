import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EditorSubtema } from '@/components/admin/EditorSubtema'
import { getCurso, getSubtemaParaAdmin } from '@/lib/contenido'
import { contenidoDesdeTema, type ContenidoBorrador } from '@/lib/borrador'
import { TemaContenidoSchema, type TemaMeta } from '@/lib/schemas'
import { tema as contenidoDeArranque } from '@/data/topicData'

// El panel nunca se indexa: no es contenido, y además va a estar detrás de login.
export const metadata: Metadata = {
  title: 'Editar subtema',
  robots: { index: false, follow: false },
}

// El panel lee la base en cada visita: no tiene sentido cachear la pantalla
// donde se edita el contenido.
export const dynamic = 'force-dynamic'

// ponytail: un solo subtema editable por ahora. Cuando haya varios, esto pasa a
// ser /admin (lista de clases de la materia) y /admin/[curso]/[subtema].
const CURSO = 'fisica'
const SLUG = 'suma-de-vectores-por-componentes'

export default async function AdminPage() {
  const curso = await getCurso(CURSO)
  if (!curso) notFound()

  const fila = await getSubtemaParaAdmin(curso.id, SLUG)
  if (!fila) notFound()

  // Si el subtema ya tiene contenido se edita eso; si está vacío se precarga el
  // contenido de arranque — guardarlo una vez ES la carga inicial.
  const tieneContenido = fila.contenido != null

  const meta: TemaMeta = {
    slug: fila.slug,
    titulo: fila.titulo,
    categoria: (fila.temas as unknown as { nombre: string }).nombre,
    orden: fila.orden,
    duracionLabel: fila.duracion_label ?? contenidoDeArranque.duracionLabel,
    videoUrl: fila.video_url ?? '',
    gratis: fila.gratis,
    publicado: fila.publicado,
  }

  const contenido: ContenidoBorrador = tieneContenido
    ? contenidoDesdeTema({
        ...contenidoDeArranque,
        ...TemaContenidoSchema.parse(fila.contenido),
      })
    : contenidoDesdeTema(contenidoDeArranque)

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Panel de contenido</h1>
        <p className="text-sm text-slate-500">{curso.titulo}</p>
      </header>
      <EditorSubtema
        cursoId={curso.id}
        rutaCurso={`/preuniversitario/${CURSO}`}
        metaInicial={meta}
        contenidoInicial={contenido}
        desdeLaBase={tieneContenido}
      />
    </div>
  )
}
