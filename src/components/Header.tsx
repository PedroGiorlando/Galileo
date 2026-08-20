import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { BotonesSesion } from './BotonesSesion'

/**
 * Un tramo del breadcrumb. Sin `href` se renderiza como texto: el último tramo
 * es la página actual, y algunos intermedios (como el nombre de una unidad) no
 * tienen página propia a la que llevar.
 */
export interface Miga {
  label: string
  href?: string
}

interface HeaderProps {
  breadcrumbs: Miga[]
}

/**
 * ponytail: el menú tiene solo lo que existe. "Nosotros", "Método" y
 * "Preguntas Frecuentes" están en el diseño pero todavía no hay páginas
 * detrás, y un link que no lleva a ningún lado es peor que no tenerlo.
 * Vuelven cuando haya contenido. Lo mismo con el buscador.
 */
const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Cursos', href: '/preuniversitario' },
]

export function Header({ breadcrumbs }: HeaderProps) {
  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-4 py-3 text-white sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <GraduationCap className="text-green-500" />
          <span>
            ACADEMIA <span className="text-green-500">GALILEO</span>
          </span>
        </Link>

        {/* Sin menú hamburguesa: con dos links entran en pantalla igual, y un
            desplegable exigiría estado de cliente para nada. */}
        <nav className="order-3 flex w-full gap-6 text-sm sm:order-none sm:w-auto">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-200 hover:text-green-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <BotonesSesion />
      </header>

      <nav
        aria-label="Ruta de navegación"
        className="flex flex-wrap items-center border-b border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 sm:px-6"
      >
        {breadcrumbs.map((miga, i) => {
          const ultimo = i === breadcrumbs.length - 1
          return (
            <span key={`${miga.label}-${i}`} className="flex items-center">
              {i > 0 && <span className="mx-2 text-slate-300">›</span>}
              {miga.href && !ultimo ? (
                <Link href={miga.href} className="hover:text-green-700 hover:underline">
                  {miga.label}
                </Link>
              ) : (
                <span
                  className={ultimo ? 'font-medium text-slate-700' : ''}
                  aria-current={ultimo ? 'page' : undefined}
                >
                  {miga.label}
                </span>
              )}
            </span>
          )
        })}
      </nav>
    </div>
  )
}
