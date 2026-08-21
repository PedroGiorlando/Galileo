import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { FormularioAcceso } from '@/components/FormularioAcceso'
import { supabaseSesion } from '@/lib/supabase-servidor'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  robots: { index: false, follow: true },
}

export default async function RegistrarsePage() {
  const supabase = await supabaseSesion()
  const { data } = await supabase.auth.getUser()
  if (data.user) redirect('/mi-cuenta')

  return (
    <>
      <Header
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Crear cuenta' }]}
      />
      <main className="mx-auto max-w-md px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-tinta">Crear cuenta</h1>
        <p className="mt-1 mb-6 text-tinta-suave">
          Guardá tu progreso y seguí estudiando desde donde quieras.
        </p>

        <FormularioAcceso modo="registrarse" />

        <p className="mt-6 text-sm text-tinta-suave">
          ¿Ya tenés cuenta?{' '}
          <Link href="/ingresar" className="font-medium text-galileo hover:underline">
            Ingresá
          </Link>
        </p>
      </main>
    </>
  )
}
