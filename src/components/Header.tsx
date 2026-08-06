import { Search, GraduationCap } from 'lucide-react'

interface HeaderProps {
  breadcrumbs: string[]
}

const NAV_LINKS = ['Inicio', 'Cursos', 'Nosotros', 'Método', 'Preguntas Frecuentes', 'Contacto']

export function Header({ breadcrumbs }: HeaderProps) {
  return (
    <div>
      <header className="flex items-center justify-between bg-slate-900 px-6 py-3 text-white">
        <div className="flex items-center gap-2 font-bold">
          <GraduationCap className="text-green-500" />
          <span>
            ACADEMIA <span className="text-green-500">GALILEO</span>
          </span>
        </div>

        <nav className="hidden gap-6 text-sm md:flex">
          {NAV_LINKS.map(link => (
            <span
              key={link}
              className={link === 'Cursos' ? 'text-green-400' : 'text-slate-200'}
            >
              {link}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Search size={18} className="text-slate-300" />
          <button className="rounded-md border border-slate-600 px-3 py-1.5 text-sm">
            Iniciar sesión
          </button>
          <button className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium">
            Registrate
          </button>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-6 py-2 text-sm text-slate-500">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb}>
            {i > 0 && <span className="mx-2">›</span>}
            <span className={i === breadcrumbs.length - 1 ? 'font-medium text-slate-700' : ''}>
              {crumb}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
