import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AnimacionPolea } from './AnimacionPolea'

describe('AnimacionPolea', () => {
  it('arranca quieta, con las masas del ejercicio y sin dar la respuesta', () => {
    const html = renderToStaticMarkup(<AnimacionPolea tipo="polea-mesa" m1={50} m2={20} />)
    expect(html).toContain('Reproducir')
    expect(html).not.toContain('polea-anda')
    expect(html).toContain('= 20 kg')
    expect(html).not.toContain('m/s²')
  })

  it('con mostrarValores, muestra a y T', () => {
    const html = renderToStaticMarkup(
      <AnimacionPolea tipo="polea-mesa" m1={50} m2={20} mostrarValores />,
    )
    expect(html).toContain('a = 2,8 m/s² · T = 140 N')
  })

  it('no usa id: puede haber dos en la misma página', () => {
    const html = renderToStaticMarkup(<AnimacionPolea tipo="polea-mesa" m1={50} m2={20} />)
    expect(html).not.toMatch(/\sid="/)
  })
})
