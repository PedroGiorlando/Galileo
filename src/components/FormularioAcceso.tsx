'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { ingresar, registrarse, type ResultadoAuth } from '@/app/ingresar/acciones'

function Boton({ etiqueta }: { etiqueta: string }) {
  // useFormStatus lee el estado del <form> que lo contiene, así que tiene que
  // vivir en un componente aparte del que renderiza ese form.
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-galileo px-4 py-2.5 font-medium text-white transition-colors hover:bg-galileo-oscuro disabled:opacity-60"
    >
      {pending ? 'Un momento...' : etiqueta}
    </button>
  )
}

export function FormularioAcceso({ modo }: { modo: 'ingresar' | 'registrarse' }) {
  const esRegistro = modo === 'registrarse'
  const [estado, accion] = useActionState<ResultadoAuth | null, FormData>(
    esRegistro ? registrarse : ingresar,
    null,
  )

  const error = estado && 'error' in estado ? estado.error : null
  const aviso = estado && 'ok' in estado ? estado.aviso : null

  return (
    <form action={accion} className="space-y-4">
      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {aviso && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          {aviso}
        </p>
      )}

      <label className="block space-y-1">
        <span className="text-sm font-medium text-tinta">Correo</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="tunombre@correo.com"
          className="w-full rounded-lg border border-linea bg-white px-3 py-2.5 text-sm focus:border-galileo focus:outline-none"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-tinta">Contraseña</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete={esRegistro ? 'new-password' : 'current-password'}
          className="w-full rounded-lg border border-linea bg-white px-3 py-2.5 text-sm focus:border-galileo focus:outline-none"
        />
        {esRegistro && (
          <span className="block text-xs text-tinta-suave">Al menos 8 caracteres.</span>
        )}
      </label>

      <Boton etiqueta={esRegistro ? 'Crear cuenta' : 'Ingresar'} />
    </form>
  )
}
