import { CheckCircle2, Lightbulb, Sparkles, Star } from 'lucide-react'
import type { SubtemaCompleto } from '../../data/topicData'

/**
 * Cada tipo de caja se ve distinto a propósito: el alumno aprende a reconocer
 * de un vistazo si lo que está leyendo es un ejemplo, un atajo o una
 * advertencia, sin tener que leerlo para saberlo.
 */
const ESTILOS_CAJA = {
  ejemplo: {
    icono: Sparkles,
    etiqueta: 'Ejemplo',
    caja: 'border-green-200 bg-green-50',
    titulo: 'text-green-800',
    texto: 'text-green-900',
  },
  tip: {
    icono: Lightbulb,
    etiqueta: 'Ojo con esto',
    caja: 'border-amber-200 bg-amber-50',
    titulo: 'text-amber-800',
    texto: 'text-amber-900',
  },
  nota: {
    icono: Star,
    etiqueta: 'Para recordar',
    caja: 'border-blue-200 bg-blue-50',
    titulo: 'text-blue-800',
    texto: 'text-blue-900',
  },
} as const

export function ExplicacionTab({ subtema }: { subtema: SubtemaCompleto }) {
  return (
    <div className="space-y-8">
      {/* Los objetivos viven acá y no en la solapa Lección: esa solapa solo
          existe cuando hay video cargado, y sin video los objetivos se
          perdían. Explicación es además la solapa por defecto. */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="mb-2 text-sm font-semibold text-green-800">En esta clase vas a aprender:</p>
        <ul className="space-y-1.5 text-sm text-green-900">
          {subtema.objetivos.map((obj, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-600" />
              {obj}
            </li>
          ))}
        </ul>
      </div>

      {subtema.explicacion.map((seccion, i) => {
        const estilo = seccion.caja ? ESTILOS_CAJA[seccion.caja.tipo] : null

        return (
          <section key={i}>
            <h2 className="mb-2 text-lg font-bold text-slate-900">{seccion.titulo}</h2>
            <p className="mb-3 leading-relaxed text-slate-600">{seccion.parrafo}</p>

            {seccion.caja && estilo && (
              <div className={`rounded-lg border p-4 ${estilo.caja}`}>
                <p
                  className={`mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase ${estilo.titulo}`}
                >
                  <estilo.icono size={14} />
                  {estilo.etiqueta}
                </p>
                {/* Los saltos de línea del contenido son significativos: las
                    fórmulas y los cálculos se cargan uno por renglón. Por eso
                    se respeta el texto tal cual se escribió, en monoespaciada
                    solo cuando parece una cuenta. */}
                <p className={`whitespace-pre-wrap text-sm leading-relaxed ${estilo.texto}`}>
                  {seccion.caja.contenido}
                </p>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
