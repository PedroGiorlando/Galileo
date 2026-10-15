import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { medioAGuardar, poleaVacia } from '@/lib/borrador'
import type { Medio } from '@/lib/schemas'
import { Medios } from './Medios'

describe('animación a medio cargar', () => {
  /**
   * Una clase sin publicar se guarda sin validar. Así queda en la base una
   * animación recién agregada: los campos vacíos no se escriben, y un "abc"
   * en un número viaja como null. La vista previa existe justamente para esas
   * clases, así que no puede caerse con ellas.
   */
  it('sin masas no rompe la página', () => {
    const guardada = JSON.parse(JSON.stringify(medioAGuardar(poleaVacia()))) as Medio
    expect(renderToStaticMarkup(<Medios medios={[guardada]} />)).toContain('Animación incompleta')
  })

  it('con un número que no es número tampoco', () => {
    const guardada = { tipo: 'polea-mesa', m1: 50, m2: 20, muEstatico: null } as unknown as Medio
    expect(renderToStaticMarkup(<Medios medios={[guardada]} />)).toContain('Animación incompleta')
  })

  it('una animación completa se dibuja', () => {
    const html = renderToStaticMarkup(<Medios medios={[{ tipo: 'polea-mesa', m1: 50, m2: 20 }]} />)
    expect(html).toContain('role="img"')
    expect(html).not.toContain('Animación incompleta')
  })
})
