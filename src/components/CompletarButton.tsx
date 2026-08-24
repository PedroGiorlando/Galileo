import { CheckCircle2 } from 'lucide-react'

interface CompletarButtonProps {
  completado: boolean
  onClick: () => void
}

export function CompletarButton({ completado, onClick }: CompletarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium ${
        completado
          ? 'border-green-600 bg-green-50 text-green-700'
          : 'border-slate-300 text-slate-600'
      }`}
    >
      <CheckCircle2 size={16} />
      {completado ? 'Completado' : 'Marcar como completado'}
    </button>
  )
}
