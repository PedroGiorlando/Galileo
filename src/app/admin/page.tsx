import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BookOpen, Check, Layers, Settings2 } from 'lucide-react'
import { esAdmin, getUsuario } from '@/lib/progreso'
import { supabaseAdmin } from '@/lib/supabase'
import { paletaDeMateria } from '@/lib/colores'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'Panel de contenido',
  robots: { index: false, follow: false },
}

// El panel lee la base en cada visita: no tiene sentido cachear la pantalla
// donde se edita el contenido.
export const dynamic = 'force-dynamic'

/**
 * Portada del panel: las materias con su avance de carga.
 *
 * Lo que importa que se vea de un golpe es cuántas clases faltan escribir, que
 * es el cuello de botella real del proyecto.
 */
export default async function AdminPage() {
  const usuario = await getUsuario()
  if (!usuario) redirect('/ingresar')

  if (!(await esAdmin())) {
    return (
      <>
        <Header breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Panel' }]} />
        <main className="mx-auto max-w-md px-6 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-tinta">Panel de contenido</h1>
          <p className="mt-2 text-tinta-suave">
            Tu cuenta no tiene permiso para editar contenido. Si sos profesor y deberías tenerlo,
            pedile a quien administra la plataforma que te habilite.
          </p>
        </main>
      </>
    )
  }

  const db = supabaseAdmin()

  const { data: materias } = await db
    .from('materias')
    .select('id, slug, nombre')
    .eq('activa', true)
    .order('orden')

  const { data: modulos } = await db.from('modulos').select('id, materia_id')
  const { data: clases } = await db.from('clases').select('id, materia_id, contenido')

  const modulosPorMateria = new Map<number, number>()
  for (const m of modulos ?? []) {
    modulosPorMateria.set(m.materia_id, (modulosPorMateria.get(m.materia_id) ?? 0) + 1)
  }

  const clasesPorMateria = new Map<number, { total: number; listas: number }>()
  for (const c of clases ?? []) {
    const acc = clasesPorMateria.get(c.materia_id) ?? { total: 0, listas: 0 }
    acc.total += 1
    if (c.contenido != null) acc.listas += 1
    clasesPorMateria.set(c.materia_id, acc)
  }

  return (
    <>
      <Header breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Panel' }]} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-tinta">Panel de contenido</h1>
        <p className="mt-1 text-tinta-suave">
          El contenido se escribe una vez por materia. Después, cada carrera elige qué módulos
          incluye.
        </p>

        <Link
          href="/admin/estructura"
          className="mt-4 mb-8 inline-flex min-h-11 items-center gap-2 rounded-lg border border-linea bg-white px-4 text-sm font-medium text-tinta-suave hover:bg-slate-50"
        >
          <Settings2 size={15} />
          Materias, carreras y programas
        </Link>

        <ul className="space-y-3">
          {(materias ?? []).map(materia => {
            const paleta = paletaDeMateria(materia.slug)
            const cuenta = clasesPorMateria.get(materia.id) ?? { total: 0, listas: 0 }
            const pct = cuenta.total > 0 ? Math.round((cuenta.listas / cuenta.total) * 100) : 0

            return (
              <li key={materia.id}>
                <Link
                  href={`/admin/${materia.slug}`}
                  className={`block rounded-2xl border border-linea bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-sm ${paleta.bordeActivo}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-bold text-tinta">{materia.nombre}</h2>
                    <span className="flex items-center gap-2 text-sm text-tinta-suave">
                      {cuenta.listas}/{cuenta.total} escritas
                      <ArrowRight size={15} className={paleta.texto} />
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-linea">
                    <div
                      className={`h-full rounded-full ${paleta.barra}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-tinta-suave">
                    <span className="flex items-center gap-1.5">
                      <Layers size={14} className={paleta.texto} />
                      {modulosPorMateria.get(materia.id) ?? 0} módulos
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} className={paleta.texto} />
                      {cuenta.total} clases
                    </span>
                    {cuenta.listas === cuenta.total && cuenta.total > 0 && (
                      <span className="flex items-center gap-1.5 font-medium text-galileo">
                        <Check size={14} /> Completa
                      </span>
                    )}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
    </>
  )
}
