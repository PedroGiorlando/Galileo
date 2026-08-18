'use client'

import { useState } from 'react'
import { Check, Copy, Database } from 'lucide-react'
import { TemaForm } from './TemaForm'
import { contenidoDesdeTema, metaDesdeTema } from '@/lib/borrador'
import { tema } from '@/data/topicData'
import type { TemaContenido, TemaMeta } from '@/lib/schemas'

/**
 * ponytail: todavía no hay base de datos, así que "guardar" deja el JSON ya
 * validado a la vista para copiarlo. El día que Supabase esté conectado, lo
 * único que cambia es `onGuardar`: pasa a ser una Server Action que hace el
 * upsert. TemaForm no se entera.
 */
export function EditorTema() {
  const [guardado, setGuardado] = useState<{ meta: TemaMeta; contenido: TemaContenido } | null>(null)
  const [copiado, setCopiado] = useState(false)

  const json = guardado ? JSON.stringify(guardado, null, 2) : ''

  async function copiar() {
    await navigator.clipboard.writeText(json)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <Database size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="text-sm text-amber-900">
          <p className="font-semibold">Todavía sin base de datos conectada.</p>
          <p className="mt-0.5 text-amber-800">
            El formulario valida todo igual. Al guardar vas a ver el contenido listo para cargar;
            cuando Supabase esté configurado, el mismo botón escribe directo en la base.
          </p>
        </div>
      </div>

      {guardado && (
        <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-green-800">
              <Check size={16} /> Contenido válido — {guardado.contenido.ejercicios.length} ejercicios,{' '}
              {guardado.contenido.quiz.length} preguntas
            </p>
            <button
              type="button"
              onClick={copiar}
              className="flex items-center gap-1.5 rounded-md border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              <Copy size={14} /> {copiado ? 'Copiado' : 'Copiar JSON'}
            </button>
          </div>
          <pre className="max-h-64 overflow-auto rounded border border-green-200 bg-white p-3 text-xs text-slate-700">
            {json}
          </pre>
        </div>
      )}

      <TemaForm
        metaInicial={metaDesdeTema(tema)}
        contenidoInicial={contenidoDesdeTema(tema)}
        onGuardar={(meta, contenido) => {
          setGuardado({ meta, contenido })
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    </div>
  )
}
