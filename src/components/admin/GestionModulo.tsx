'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { borrarClase, borrarModulo, crearClase, crearModulo } from '@/app/admin/acciones'

/**
 * Alta y baja de módulos y clases.
 *
 * Las bajas se niegan del lado del servidor si hay contenido escrito, así que
 * acá no hace falta ninguna ventana de confirmación: el error que vuelve dice
 * exactamente qué falta y no hay forma de perder trabajo por un clic apurado.
 */

function Mensaje({ texto }: { texto: string | null }) {
  if (!texto) return null
  return (
    <p role="alert" className="mt-2 text-xs font-medium text-red-600">
      {texto}
    </p>
  )
}

export function NuevoModulo({ materiaId }: { materiaId: number }) {
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, empezar] = useTransition()
  const router = useRouter()

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    empezar(async () => {
      const r = await crearModulo(materiaId, nombre)
      if (r.ok) {
        setNombre('')
        router.refresh()
      } else {
        setError(r.error)
      }
    })
  }

  return (
    <form onSubmit={enviar} className="rounded-2xl border border-dashed border-linea p-4">
      <label className="block text-sm font-medium text-tinta">Agregar un módulo</label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Termodinámica"
          className="min-w-0 flex-1 rounded-lg border border-linea px-3 py-2 text-sm focus:border-galileo focus:outline-none"
        />
        <button
          type="submit"
          disabled={enviando || nombre.trim().length < 3}
          className="flex items-center gap-1.5 rounded-lg bg-galileo px-4 py-2 text-sm font-medium text-white hover:bg-galileo-oscuro disabled:opacity-50"
        >
          {enviando ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Agregar
        </button>
      </div>
      <Mensaje texto={error} />
    </form>
  )
}

export function BorrarModulo({ moduloId }: { moduloId: number }) {
  const [error, setError] = useState<string | null>(null)
  const [enviando, empezar] = useTransition()
  const router = useRouter()

  return (
    <>
      <button
        type="button"
        title="Borrar módulo"
        disabled={enviando}
        onClick={() =>
          empezar(async () => {
            setError(null)
            const r = await borrarModulo(moduloId)
            if (r.ok) router.refresh()
            else setError(r.error)
          })
        }
        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
      >
        {enviando ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
      <Mensaje texto={error} />
    </>
  )
}

export function NuevaClase({ materiaId, moduloId }: { materiaId: number; moduloId: number }) {
  const [titulo, setTitulo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, empezar] = useTransition()
  const router = useRouter()

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    empezar(async () => {
      const r = await crearClase(materiaId, moduloId, titulo)
      if (r.ok) {
        setTitulo('')
        router.refresh()
      } else {
        setError(r.error)
      }
    })
  }

  return (
    <form onSubmit={enviar} className="mt-3 flex flex-wrap gap-2 border-t border-linea pt-3">
      <input
        type="text"
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
        placeholder="Título de una clase nueva"
        className="min-w-0 flex-1 rounded-lg border border-linea px-3 py-1.5 text-sm focus:border-galileo focus:outline-none"
      />
      <button
        type="submit"
        disabled={enviando || titulo.trim().length < 3}
        className="flex items-center gap-1.5 rounded-lg border border-linea px-3 py-1.5 text-sm font-medium text-tinta-suave hover:bg-slate-50 disabled:opacity-50"
      >
        {enviando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Agregar clase
      </button>
      <Mensaje texto={error} />
    </form>
  )
}

export function BorrarClase({ claseId }: { claseId: number }) {
  const [error, setError] = useState<string | null>(null)
  const [enviando, empezar] = useTransition()
  const router = useRouter()

  return (
    <span className="relative">
      <button
        type="button"
        title="Borrar clase"
        disabled={enviando}
        onClick={() =>
          empezar(async () => {
            setError(null)
            const r = await borrarClase(claseId)
            if (r.ok) router.refresh()
            else setError(r.error)
          })
        }
        className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
      >
        {enviando ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
      {error && (
        <span className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 shadow-sm">
          {error}
        </span>
      )}
    </span>
  )
}
