import Link from 'next/link'
import { GraduationCap, Menu, Search, X } from 'lucide-react'
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
      {/* flex-wrap no es decorativo: es la red de seguridad. Sin él, el día que
          un botón cambie de texto la cabecera desborda y aparece la barra
          horizontal. Con él, en el peor caso baja a dos renglones. */}
      <header className="relative flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-slate-900 px-4 py-2 text-white sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-bold">
          <GraduationCap className="shrink-0 text-green-500" />
          <span className="whitespace-nowrap">
            {/* En 375px no entran las dos palabras junto a los botones. La que
                se va es la genérica: la marca es "Galileo". */}
            <span className="hidden sm:inline">ACADEMIA </span>
            <span className="text-green-500">GALILEO</span>
          </span>
        </Link>

        <nav className="hidden gap-x-5 text-sm lg:flex">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center text-slate-200 hover:text-green-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* En celular la lupa se va adentro del menú: el espacio de la barra
              lo necesitan el logo y los botones de sesión. */}
          <Link
            href="/buscar"
            aria-label="Buscar"
            className="hidden h-11 w-11 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800 hover:text-green-400 sm:flex"
          >
            <Search size={18} />
          </Link>
          <BotonesSesion />

          {/* Menú de celular con <details>, el desplegable nativo del navegador.
              La alternativa era useState, que obligaría a poner 'use client' en
              toda la cabecera; y la cabecera está en cada página, así que eso se
              paga en todas. Acá no baja ni una línea de JavaScript. */}
          <details className="group lg:hidden">
            <summary
              aria-label="Menú"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-md text-slate-300 hover:bg-slate-800 [&::-webkit-details-marker]:hidden"
            >
              <Menu size={20} className="group-open:hidden" />
              <X size={20} className="hidden group-open:block" />
            </summary>

            {/* `hidden group-open:flex` en vez de confiar en que <details>
                esconda solo su contenido: al posicionar el menú en absoluto se
                escapa de ese ocultado y quedaba a la vista con el desplegable
                cerrado. Y el ancho va fijo porque un `inset-x-0` acá se mide
                contra el propio <details>, que son los 44px del botón. */}
            <nav className="absolute top-full right-0 z-40 hidden w-64 flex-col rounded-b-lg border border-slate-700 bg-slate-900 px-4 pb-2 shadow-xl group-open:flex">
              {[...NAV_LINKS, { label: 'Buscar', href: '/buscar' }].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-11 items-center border-b border-slate-800 text-slate-200 last:border-0 hover:text-green-400"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>
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
