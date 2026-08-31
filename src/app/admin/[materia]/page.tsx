import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Check, PencilLine } from 'lucide-react'
import { esAdmin, getUsuario } from '@/lib/progreso'
import { supabaseAdmin } from '@/lib/supabase'
import { paletaDeMateria } from '@/lib/colores'
import { Header } from '@/components/Header'
import { AsignarModulo } from '@/components/admin/AsignarModulo'
import {
  BorrarClase,
  BorrarModulo,
  NuevaClase,
  NuevoModulo,
} from '@/components/admin/GestionModulo'

export const metadata: Metadata = {
  title: 'Editar materia',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Los módulos de una materia, con sus clases y en qué carreras aparece cada uno.
 *
 * Acá se ve lo que motivó todo el rediseño del modelo: Cinemática se escribe
 * una vez y con un par de casillas se decide si va a UNCuyo, a UTN o a las dos.
 */
export default async function AdminMateriaPage({
  params,
}: {
  params: Promise<{ materia: string }>
}) {
  const usuario = await getUsuario()
  if (!usuario) redirect('/ingresar')
  if (!(await esAdmin())) redirect('/admin')

  const { materia: materiaSlug } = await params
  const db = supabaseAdmin()

  const { data: materia } = await db
    .from('materias')
    .select('id, slug, nombre')
    .eq('slug', materiaSlug)
    .maybeSingle()

  if (!materia) notFound()

  const { data: modulos } = await db
    .from('modulos')
    .select('id, slug, nombre, orden')
    .eq('materia_id', materia.id)
    .order('orden')

  const { data: clases } = await db
    .from('clases')
    .select('id, slug, titulo, orden, modulo_id, contenido')
    .eq('materia_id', materia.id)
    .order('orden')

  // Los cursos de esta materia, con su carrera y programa, para saber a dónde
  // se puede asignar cada módulo.
  const { data: cursos } = await db
    .from('cursos')
    .select('id, carreras!inner(nombre, programas!inner(nombre))')
    .eq('materia_id', materia.id)

  const { data: asignaciones } = await db.from('curso_modulos').select('curso_id, modulo_id')

  const opciones = (cursos ?? []).map(c => {
    const carrera = c.carreras as unknown as { nombre: string; programas: { nombre: string } }
    return { cursoId: c.id, etiqueta: `${carrera.programas.nombre} · ${carrera.nombre}` }
  })

  const asignadosPorModulo = new Map<number, number[]>()
  for (const a of asignaciones ?? []) {
    asignadosPorModulo.set(a.modulo_id, [...(asignadosPorModulo.get(a.modulo_id) ?? []), a.curso_id])
  }

  const paleta = paletaDeMateria(materia.slug)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Panel', href: '/admin' },
          { label: materia.nombre },
        ]}
      />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/admin"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-tinta-suave hover:text-tinta"
        >
          <ArrowLeft size={14} /> Todas las materias
        </Link>

        <h1 className="font-display text-3xl font-bold text-tinta">{materia.nombre}</h1>
        <p className="mt-1 mb-8 text-tinta-suave">
          Cada módulo se escribe una vez y se dicta en las carreras que elijas. Cinemática puede
          estar en UNCuyo y no en la UTN sin duplicar el contenido.
        </p>

        <div className="space-y-6">
          {(modulos ?? []).map(modulo => {
            const suyas = (clases ?? []).filter(c => c.modulo_id === modulo.id)
            const escritas = suyas.filter(c => c.contenido != null).length

            return (
              <section
                key={modulo.id}
                className="rounded-2xl border border-linea bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-tinta">{modulo.nombre}</h2>
                  <span className="flex items-center gap-2 text-xs text-tinta-suave">
                    {escritas}/{suyas.length} escritas
                    <BorrarModulo moduloId={modulo.id} />
                  </span>
                </div>

                <AsignarModulo
                  moduloId={modulo.id}
                  moduloNombre={modulo.nombre}
                  opciones={opciones}
                  asignados={asignadosPorModulo.get(modulo.id) ?? []}
                />

                <ul className="mt-4 divide-y divide-linea border-t border-linea">
                  {suyas.map(clase => (
                    <li key={clase.id} className="flex items-center gap-2">
                      <Link
                        href={`/admin/${materia.slug}/${clase.slug}`}
                        className="flex flex-1 items-center gap-3 py-2.5 text-sm hover:bg-slate-50"
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                            clase.contenido != null
                              ? 'bg-galileo text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {clase.contenido != null ? <Check size={12} /> : clase.orden}
                        </span>
                        <span className="min-w-0 flex-1 text-tinta">{clase.titulo}</span>
                        <PencilLine size={14} className={paleta.texto} />
                      </Link>
                      <BorrarClase claseId={clase.id} />
                    </li>
                  ))}
                </ul>

                <NuevaClase materiaId={materia.id} moduloId={modulo.id} />
              </section>
            )
          })}

          <NuevoModulo materiaId={materia.id} />
        </div>
      </main>
    </>
  )
}
