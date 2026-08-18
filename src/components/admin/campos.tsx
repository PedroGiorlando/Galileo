'use client'

import { Plus, Trash2 } from 'lucide-react'

/**
 * Piezas chicas del formulario del panel. No son un "sistema de formularios":
 * son los cuatro patrones que se repiten en la carga de un tema. Sin librería
 * de formularios — el estado lo maneja TemaForm con useState y el schema Zod
 * valida al guardar.
 */

const claseInput =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'

export function Campo({
  label,
  ayuda,
  error,
  children,
}: {
  label: string
  ayuda?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {ayuda && <span className="block text-xs text-slate-500">{ayuda}</span>}
      {children}
      {error && <span className="block text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}

export function Texto({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      className={claseInput}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  )
}

export function TextoLargo({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <textarea
      className={claseInput}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  )
}

export function Numero({
  value,
  onChange,
  min = 1,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
}) {
  return (
    <input
      type="number"
      min={min}
      className={claseInput}
      value={Number.isFinite(value) ? value : ''}
      onChange={e => onChange(e.target.valueAsNumber)}
    />
  )
}

export function Casilla({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        className="h-4 w-4 accent-green-600"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      {label}
    </label>
  )
}

/** Editor de una lista de textos: objetivos, pasos de un ejemplo, opciones. */
export function ListaDeTextos({
  items,
  onChange,
  etiquetaAgregar,
  placeholder,
  minimo = 1,
  largo,
}: {
  items: string[]
  onChange: (items: string[]) => void
  etiquetaAgregar: string
  placeholder?: (i: number) => string
  minimo?: number
  largo?: boolean
}) {
  const Entrada = largo ? TextoLargo : Texto

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 w-5 shrink-0 text-right text-xs text-slate-400">{i + 1}.</span>
          <div className="flex-1">
            <Entrada
              value={item}
              placeholder={placeholder?.(i)}
              onChange={v => onChange(items.map((x, j) => (j === i ? v : x)))}
            />
          </div>
          <button
            type="button"
            title="Quitar"
            disabled={items.length <= minimo}
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="mt-1 rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="flex items-center gap-1 pl-7 text-sm font-medium text-green-700 hover:text-green-800"
      >
        <Plus size={14} /> {etiquetaAgregar}
      </button>
    </div>
  )
}

/** Tarjeta para un ítem de una lista de objetos (una sección, un ejercicio...). */
export function Bloque({
  titulo,
  onQuitar,
  puedeQuitar = true,
  children,
}: {
  titulo: string
  onQuitar: () => void
  puedeQuitar?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">{titulo}</h4>
        <button
          type="button"
          title="Quitar"
          disabled={!puedeQuitar}
          onClick={onQuitar}
          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {children}
    </div>
  )
}

export function BotonAgregar({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
    >
      <Plus size={16} /> {children}
    </button>
  )
}
