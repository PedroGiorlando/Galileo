import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { MedioBorrador } from '@/lib/borrador'
import { EditorMedios } from './EditorMedios'

// La acción de subir imágenes habla con Supabase; acá no se usa.
vi.mock('@/app/admin/acciones-medios', () => ({ subirImagen: vi.fn() }))

const polea = (cambios: Partial<Extract<MedioBorrador, { tipo: 'polea-mesa' }>>): MedioBorrador => ({
  tipo: 'polea-mesa',
  m1: '50',
  m2: '20',
  muEstatico: '',
  muCinetico: '',
  gravedad: '9,8',
  mostrarValores: false,
  ...cambios,
})

const dibujar = (medio: MedioBorrador) =>
  renderToStaticMarkup(
    <EditorMedios medios={[medio]} onChange={() => {}} materiaSlug="fisica" claseSlug="x" etiqueta="Medios" />,
  )

describe('animación en el panel', () => {
  it('con los datos completos muestra la vista previa', () => {
    expect(dibujar(polea({}))).toContain('Caja de 50 kg sobre una mesa')
  })

  it('sin una masa avisa qué falta y no muestra una animación rota', () => {
    const html = dibujar(polea({ m1: '' }))
    expect(html).toContain('Falta la masa')
    expect(html).toContain('Completá los datos para ver la animación.')
    expect(html).not.toContain('role="img"')
  })

  it('marca el μc mayor que el μe', () => {
    expect(dibujar(polea({ muEstatico: '0,2', muCinetico: '0,3' }))).toContain('μc no puede ser mayor que μe')
  })

  it('ofrece agregar una animación', () => {
    expect(renderToStaticMarkup(
      <EditorMedios medios={[]} onChange={() => {}} materiaSlug="fisica" claseSlug="x" etiqueta="Medios" />,
    )).toContain('Agregar animación')
  })
})
