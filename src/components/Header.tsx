import Link from 'next/link'
import { GraduationCap, Search } from 'lucide-react'
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
 * Todas las entradas llevan a una página real. Las que todavía no tienen
 * contenido muestran "en preparación" y piden `noindex`, así que sirven para
 * ver el producto completo mientras se construye sin que Google indexe páginas
 * vacías. Cuando cada una tenga contenido, se reemplaza el placeholder y el
 * menú no cambia.
 */
const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Cursos', href: '/preuniversitario' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Método', href: '/metodo' },
  { label: 'Preguntas Frecuentes', href: '/preguntas-frecuentes' },
  { label: 'Contacto', href: '/contacto' },
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

        {/* Envuelve en vez de deslizar: una barra de desplazamiento horizontal
            en la cabecera esconde la mitad del menú y nadie la busca. Sin menú
            hamburguesa, que pediría estado y volvería cliente toda la cabecera. */}
        <nav className="order-3 flex w-full flex-wrap gap-x-5 gap-y-1 text-sm lg:order-none lg:w-auto">
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

        <div className="flex items-center gap-3">
          <Link href="/buscar" aria-label="Buscar" className="text-slate-300 hover:text-green-400">
            <Search size={18} />
          </Link>
          <BotonesSesion />
        </div>
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
