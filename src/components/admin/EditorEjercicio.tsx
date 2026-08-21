'use client'

import type { EjercicioBorrador, PreguntaBorrador, TipoEjercicio } from '@/lib/borrador'
import { Bloque, Campo, Casilla, ListaDeTextos, Numero, Texto, TextoLargo } from './campos'

/**
 * Un ejercicio y una pregunta, sacados del formulario grande.
 *
 * Ahora los ejercicios viven dentro de un trabajo práctico y las preguntas
 * dentro de una evaluación, así que el mismo editor se usa en varios lugares.
 * Tenerlo suelto evita repetir cien líneas por cada nivel de anidamiento.
 */

const TIPOS: { valor: TipoEjercicio; label: string; ayuda: string }[] = [
  {
    valor: 'libre',
    label: 'Respuesta libre',
    ayuda: 'Lista separada por comas. El orden y los espacios no importan al corregir.',
  },
  { valor: 'multiple', label: 'Selección múltiple', ayuda: 'El alumno tilda una o varias opciones.' },
  { valor: 'si-no', label: 'Sí / No', ayuda: 'Respuesta binaria.' },
]

const claseSelect =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'

export function EditorEjercicio({
  ejercicio: e,
  indice,
  puedeQuitar,
  onCambiar,
  onQuitar,
}: {
  ejercicio: EjercicioBorrador
  indice: number
  puedeQuitar: boolean
  onCambiar: (cambio: Partial<EjercicioBorrador>) => void
  onQuitar: () => void
}) {
  const tipo = TIPOS.find(t => t.valor === e.tipo)

  return (
    <Bloque titulo={`Ejercicio ${indice + 1}`} puedeQuitar={puedeQuitar} onQuitar={onQuitar}>
      <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
        <Campo label="Tipo" ayuda={tipo?.ayuda}>
          <select
            className={claseSelect}
            value={e.tipo}
            onChange={ev => onCambiar({ tipo: ev.target.value as TipoEjercicio })}
          >
            {TIPOS.map(t => (
              <option key={t.valor} value={t.valor}>
                {t.label}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Puntos">
          <Numero value={e.puntos} onChange={v => onCambiar({ puntos: v })} />
        </Campo>
      </div>

      <Campo label="Enunciado">
        <TextoLargo value={e.enunciado} onChange={v => onCambiar({ enunciado: v })} rows={2} />
      </Campo>

      {e.tipo === 'libre' && (
        <Campo
          label="Respuesta correcta"
          ayuda="Separada por comas: 0,7,14,21. No uses este tipo para respuestas en palabras."
        >
          <Texto value={e.respuestaLibre} onChange={v => onCambiar({ respuestaLibre: v })} />
        </Campo>
      )}

      {e.tipo === 'multiple' && (
        <>
          <Campo label="Opciones">
            <ListaDeTextos
              items={e.opciones}
              minimo={2}
              onChange={opciones => onCambiar({ opciones })}
              etiquetaAgregar="Agregar opción"
            />
          </Campo>
          <Campo label="Cuáles son correctas">
            <div className="flex flex-wrap gap-3">
              {e.opciones.filter(Boolean).map(op => (
                <Casilla
                  key={op}
                  label={op}
                  checked={e.correctasMultiple.includes(op)}
                  onChange={v =>
                    onCambiar({
                      correctasMultiple: v
                        ? [...e.correctasMultiple, op]
                        : e.correctasMultiple.filter(x => x !== op),
                    })
                  }
                />
              ))}
              {e.opciones.every(o => !o) && (
                <p className="text-sm text-slate-400">Escribí las opciones primero.</p>
              )}
            </div>
          </Campo>
        </>
      )}

      {e.tipo === 'si-no' && (
        <Campo label="Respuesta correcta">
          <select
            className={claseSelect}
            value={e.correctaSiNo}
            onChange={ev => onCambiar({ correctaSiNo: ev.target.value as 'Sí' | 'No' })}
          >
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </Campo>
      )}

      <Campo
        label="Explicación"
        ayuda="Se le muestra al alumno cuando se equivoca. Decí por qué, no repitas la respuesta."
      >
        <TextoLargo value={e.explicacion} onChange={v => onCambiar({ explicacion: v })} rows={2} />
      </Campo>
    </Bloque>
  )
}

export function EditorPregunta({
  pregunta: p,
  indice,
  nombreRadio,
  puedeQuitar,
  onCambiar,
  onQuitar,
}: {
  pregunta: PreguntaBorrador
  indice: number
  nombreRadio: string
  puedeQuitar: boolean
  onCambiar: (cambio: Partial<PreguntaBorrador>) => void
  onQuitar: () => void
}) {
  return (
    <Bloque titulo={`Pregunta ${indice + 1}`} puedeQuitar={puedeQuitar} onQuitar={onQuitar}>
      <Campo label="Pregunta">
        <TextoLargo value={p.pregunta} onChange={v => onCambiar({ pregunta: v })} rows={2} />
      </Campo>

      <Campo label="Opciones" ayuda="Marcá el punto de la que es correcta.">
        <div className="space-y-2">
          {p.opciones.map((op, j) => (
            <div key={j} className="flex items-center gap-2">
              <input
                type="radio"
                name={nombreRadio}
                className="h-4 w-4 shrink-0 accent-green-600"
                checked={p.respuestaCorrectaIndex === j}
                onChange={() => onCambiar({ respuestaCorrectaIndex: j })}
                aria-label={`Marcar la opción ${j + 1} como correcta`}
              />
              <div className="flex-1">
                <Texto
                  value={op}
                  onChange={v =>
                    onCambiar({ opciones: p.opciones.map((x, k) => (k === j ? v : x)) })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Campo>

      <Campo label="Explicación">
        <TextoLargo value={p.explicacion} onChange={v => onCambiar({ explicacion: v })} rows={2} />
      </Campo>
    </Bloque>
  )
}
