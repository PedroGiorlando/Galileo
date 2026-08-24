import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { esAdmin, getUsuario } from '@/lib/progreso'
import { supabaseAdmin } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { PanelEstructura, type DatosEstructura } from '@/components/admin/Estructura'

export const metadata: Metadata = {
  title: 'Estructura del catálogo',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Programas, carreras y materias: la estructura del catálogo.
 *
 * Está separada de la portada del panel porque son dos trabajos con ritmos
 * distintos. Escribir clases es lo de todos los días; agregar una carrera pasa
 * una vez por cuatrimestre. Mezclarlos llenaría de botones peligrosos la
 * pantalla que más se usa.
 *
 * Hasta acá esto se hacía con SQL a mano, o sea que agregar Química dependía de
 * que hubiera un programador disponible.
 */
export default async function EstructuraPage() {
  const usuario = await getUsuario()
  if (!usuario) redirect('/ingresar')
  if (!(await esAdmin())) redirect('/admin')

  const db = supabaseAdmin()

  // Consultas sueltas y un Map, como en el resto del proyecto: las claves
  // foráneas compuestas hacen que PostgREST no pueda anidar esto.
  const [programas, carreras, materias, cursos, modulos, clases] = await Promise.all([
    db.from('programas').select('id, nombre').order('orden'),
    db.from('carreras').select('id, programa_id, nombre').order('orden'),
    db.from('materias').select('id, nombre, slug, activa').order('orden'),
    db.from('cursos').select('id, carrera_id, materia_id, titulo, publicado').order('orden'),
    db.from('modulos').select('materia_id'),
    db.from('clases').select('materia_id'),
  ])

  const contar = (filas: { materia_id: number }[] | null) => {
    const m = new Map<number, number>()
    for (const f of filas ?? []) m.set(f.materia_id, (m.get(f.materia_id) ?? 0) + 1)
    return m
  }

  const porModulo = contar(modulos.data)
  const porClase = contar(clases.data)

  const datos: DatosEstructura = {
    programas: programas.data ?? [],
    carreras: (carreras.data ?? []).map(c => ({
      id: c.id,
      programaId: c.programa_id,
      nombre: c.nombre,
    })),
    // Se listan TODAS, también las apagadas: esta es la pantalla desde donde se
    // vuelven a encender, así que esconderlas acá las dejaría inalcanzables.
    materias: (materias.data ?? []).map(m => ({
      id: m.id,
      nombre: m.nombre,
      slug: m.slug,
      activa: m.activa,
      modulos: porModulo.get(m.id) ?? 0,
      clases: porClase.get(m.id) ?? 0,
    })),
    cursos: (cursos.data ?? []).map(c => ({
      id: c.id,
      carreraId: c.carrera_id,
      materiaId: c.materia_id,
      titulo: c.titulo,
      publicado: c.publicado,
    })),
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Panel', href: '/admin' },
          { label: 'Estructura' },
        ]}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-bold text-tinta">Estructura del catálogo</h1>
        <p className="mt-1 mb-8 text-tinta-suave">
          Qué materias existen y en qué carreras se dictan. Para escribir clases, entrá a una
          materia desde el panel.
        </p>

        <PanelEstructura datos={datos} />
      </main>
    </>
  )
}
