import { redirect } from 'next/navigation'
import { tema } from '@/data/topicData'

// ponytail: todavía no hay landing. Con un solo tema publicado, la home manda
// ahí directo. Fase 4 la reemplaza por la landing real.
export default function Home() {
  redirect(`/primaria/${tema.gradoSlug}/${tema.materiaSlug}/${tema.slug}`)
}
