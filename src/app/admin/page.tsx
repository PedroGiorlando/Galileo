import type { Metadata } from 'next'
import { EditorTema } from '@/components/admin/EditorTema'

// El panel nunca se indexa: no es contenido, y además va a estar detrás de login.
export const metadata: Metadata = {
  title: 'Editar tema',
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Panel de contenido</h1>
        <p className="text-sm text-slate-500">Cargá y editá los temas del curso.</p>
      </header>
      <EditorTema />
    </div>
  )
}
