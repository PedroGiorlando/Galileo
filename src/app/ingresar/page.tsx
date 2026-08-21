import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { FormularioAcceso } from '@/components/FormularioAcceso'
import { supabaseSesion } from '@/lib/supabase-servidor'

export const metadata: Metadata = {
  title: 'Ingresar',
  robots: { index: false, follow: true },
}

const MENSAJES: Record<string, string> = {
  'sin-codigo': 'Ese link no traía el código de confirmación. Probá ingresar directamente.',
  'link-vencido': 'El link de confirmación ya venció o fue usado. Ingresá con tu correo y contraseña.',
}

export default async function IngresarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const aviso = error ? MENSAJES[error] : null

  const supabase = await supabaseSesion()
  const { data } = await supabase.auth.getUser()
  if (data.user) redirect('/mi-cuenta')

  return (
    <>
      <Header
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Ingresar' }]}
      />
      <main className="mx-auto max-w-md px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-tinta">Ingresar</h1>
        <p className="mt-1 mb-6 text-tinta-suave">
          Entrá para que tu progreso te siga en cualquier dispositivo.
        </p>

        {aviso && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            {aviso}
          </p>
        )}

        <FormularioAcceso modo="ingresar" />

        <p className="mt-6 text-sm text-tinta-suave">
          ¿Todavía no tenés cuenta?{' '}
          <Link href="/registrarse" className="font-medium text-galileo hover:underline">
            Creá una
          </Link>
        </p>
      </main>
    </>
  )
}
