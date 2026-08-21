import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, PencilLine, UserRound } from 'lucide-react'
import { Header } from '@/components/Header'
import { esAdmin, getResumenPorCurso, getUsuario } from '@/lib/progreso'
import { paletaDeMateria } from '@/lib/colores'

export const metadata: Metadata = {
  title: 'Mi cuenta',
  robots: { index: false, follow: false },
}

export default async function MiCuentaPage() {
  const usuario = await getUsuario()
  if (!usuario) redirect('/ingresar')

  const [resumen, admin] = await Promise.all([getResumenPorCurso(), esAdmin()])
  const totalHechas = resumen.reduce((n, r) => n + r.completadas, 0)

  return (
    <>
      <Header breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Mi cuenta' }]} />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-galileo/10">
            <UserRound size={26} className="text-galileo" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold text-tinta">Mi cuenta</h1>
            <p className="truncate text-tinta-suave">{usuario.email}</p>
          </div>
        </div>

        {admin && (
          <Link
            href="/admin"
            className="mb-8 flex items-center justify-between gap-3 rounded-2xl border border-linea bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-galileo/10">
                <PencilLine size={18} className="text-galileo" />
              </span>
              <span>
                <span className="block font-display font-semibold text-tinta">
                  Panel de contenido
                </span>
                <span className="block text-sm text-tinta-suave">Cargar y editar clases</span>
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-galileo" />
          </Link>
        )}

        <section>
          <h2 className="mb-1 font-display text-xl font-bold text-tinta">Tu avance</h2>
          <p className="mb-4 text-sm text-tinta-suave">
            {totalHechas === 0
              ? 'Todavía no completaste ninguna clase. Empezá cuando quieras.'
              : `Llevás ${totalHechas} ${totalHechas === 1 ? 'clase completada' : 'clases completadas'}.`}
          </p>

          <ul className="space-y-3">
            {resumen.map(r => {
              const paleta = paletaDeMateria(r.cursoSlug)
              const pct = r.total > 0 ? Math.round((r.completadas / r.total) * 100) : 0
              return (
                <li key={r.cursoId}>
                  <Link
                    href={`/preuniversitario/${r.cursoSlug}`}
                    className={`block rounded-2xl border border-linea bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm ${paleta.bordeActivo}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display font-semibold text-tinta">{r.cursoNombre}</span>
                      <span className="flex items-center gap-2 font-mono text-sm text-tinta-suave">
                        {r.completadas}/{r.total}
                        <ArrowRight size={14} className={paleta.texto} />
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-linea">
                      <div
                        className={`h-full rounded-full ${paleta.barra}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      </main>
    </>
  )
}
