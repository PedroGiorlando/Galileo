import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EditorTema } from '@/components/admin/EditorTema'
import { getCurso, getTemaParaAdmin } from '@/lib/temas'
import { contenidoDesdeTema, metaDesdeTema, type ContenidoBorrador } from '@/lib/borrador'
import { TemaContenidoSchema, type TemaMeta } from '@/lib/schemas'
import { tema as temaHardcodeado } from '@/data/topicData'

// El panel nunca se indexa: no es contenido, y además va a estar detrás de login.
export const metadata: Metadata = {
  title: 'Editar tema',
  robots: { index: false, follow: false },
}

// El panel lee la base en cada visita: no tiene sentido cachear la pantalla
// donde se edita el contenido.
export const dynamic = 'force-dynamic'

// ponytail: un solo curso y un solo tema, así que están fijos. Cuando haya
// varios, esto pasa a ser /admin (lista) y /admin/temas/[slug] (edición).
const GRADO = '4-grado'
const MATERIA = 'matematica'
const SLUG = 'multiplos-y-divisores'

export default async function AdminPage() {
  const curso = await getCurso(GRADO, MATERIA)
  if (!curso) notFound()

  const fila = await getTemaParaAdmin(curso.id, SLUG)

  // Si el tema ya está en la base se edita eso; si no, se precarga el contenido
  // hardcodeado — guardarlo una vez ES la migración.
  let meta: TemaMeta
  let contenido: ContenidoBorrador

  if (fila) {
    meta = {
      slug: fila.slug,
      titulo: fila.titulo,
      categoria: fila.categoria ?? '',
      orden: fila.orden,
      duracionLabel: fila.duracion_label ?? '',
      videoUrl: fila.video_url ?? '',
      gratis: fila.gratis,
      publicado: fila.publicado,
    }
    contenido = contenidoDesdeTema({
      ...temaHardcodeado,
      ...TemaContenidoSchema.parse(fila.contenido),
    })
  } else {
    meta = metaDesdeTema(temaHardcodeado)
    contenido = contenidoDesdeTema(temaHardcodeado)
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Panel de contenido</h1>
        <p className="text-sm text-slate-500">{curso.titulo}</p>
      </header>
      <EditorTema
        cursoId={curso.id}
        rutaCurso={`/primaria/${GRADO}/${MATERIA}`}
        metaInicial={meta}
        contenidoInicial={contenido}
        desdeLaBase={Boolean(fila)}
      />
    </div>
  )
}
