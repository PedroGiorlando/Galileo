import { useState } from 'react'
import { PlayCircle, FileText, PencilLine, ClipboardCheck, MapPin } from 'lucide-react'
import { tema, TOTAL_TEMAS_GRADO, temarioSidebar } from './data/topicData'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { RightPanel } from './components/RightPanel'
import { LeccionTab } from './components/tabs/LeccionTab'
import { ExplicacionTab } from './components/tabs/ExplicacionTab'
import { EjemplosTab } from './components/tabs/EjemplosTab'
import { EjerciciosTab } from './components/tabs/EjerciciosTab'
import { AutoevaluacionTab } from './components/tabs/AutoevaluacionTab'

const TABS = [
  { id: 'leccion', label: 'Lección', icon: PlayCircle },
  { id: 'explicacion', label: 'Explicación escrita', icon: FileText },
  { id: 'ejemplos', label: 'Ejemplos resueltos', icon: PencilLine },
  { id: 'ejercicios', label: 'Ejercicios', icon: ClipboardCheck },
  { id: 'autoevaluacion', label: 'Autoevaluación', icon: MapPin },
] as const

type TabId = (typeof TABS)[number]['id']

function App() {
  const [tabActivo, setTabActivo] = useState<TabId>('leccion')
  const [completado, setCompletado] = useLocalStorage('galileo:tema-7-completado', false)

  const completedCount = temarioSidebar.filter(t => t.completado).length + (completado ? 1 : 0)
  const courseProgressPercent = (completedCount / TOTAL_TEMAS_GRADO) * 100

  const tabProps = {
    completado,
    onMarcarCompletado: () => setCompletado(prev => !prev),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header breadcrumbs={['Inicio', 'Primaria', tema.grado, tema.categoria, tema.titulo]} />

      <main className="mx-auto flex max-w-7xl gap-6 p-6">
        <Sidebar temaActualCompletado={completado} />

        <div className="min-w-0 flex-1 space-y-4">
          <div role="tablist" className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tabActivo === tab.id}
                onClick={() => setTabActivo(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  tabActivo === tab.id ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className={tabActivo === 'leccion' ? '' : 'hidden'}><LeccionTab {...tabProps} /></div>
            <div className={tabActivo === 'explicacion' ? '' : 'hidden'}><ExplicacionTab {...tabProps} /></div>
            <div className={tabActivo === 'ejemplos' ? '' : 'hidden'}><EjemplosTab {...tabProps} /></div>
            <div className={tabActivo === 'ejercicios' ? '' : 'hidden'}><EjerciciosTab {...tabProps} /></div>
            <div className={tabActivo === 'autoevaluacion' ? '' : 'hidden'}><AutoevaluacionTab {...tabProps} /></div>
          </div>
        </div>

        <RightPanel
          courseProgressPercent={courseProgressPercent}
          completedCount={completedCount}
          totalCount={TOTAL_TEMAS_GRADO}
        />
      </main>
    </div>
  )
}

export default App
