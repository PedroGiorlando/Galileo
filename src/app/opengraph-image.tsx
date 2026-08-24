import { ImageResponse } from 'next/og'
import { NOMBRE } from '@/lib/sitio'

/**
 * La imagen que aparece al pegar un link del sitio en WhatsApp, y la que se ve
 * si alguien lo comparte en Instagram o Twitter.
 *
 * Se dibuja con JSX y Next la convierte en PNG durante el build: no hay archivo
 * de diseño que mantener ni que volver a exportar cuando cambien los colores.
 *
 * 1200×630 es la medida que esperan todas las plataformas. Con otra, recortan.
 *
 * Los colores van escritos a mano y no como variables de Tailwind: esto se
 * renderiza fuera del navegador, donde no existe ninguna hoja de estilos.
 */
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${NOMBRE} — preparación para el ingreso universitario`

export default function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#10192c',
          // La cuadrícula del cuaderno, la misma idea que ordena el sitio.
          backgroundImage:
            'linear-gradient(to right, #1d2942 1px, transparent 1px), linear-gradient(to bottom, #1d2942 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '18px',
              height: '64px',
              backgroundColor: '#0f9d58',
              borderRadius: '9px',
            }}
          />
          {/* Satori exige `display: flex` explícito en todo div con más de un
              hijo, así que el logo va como dos spans con gap en vez de texto
              con un span adentro. */}
          <div
            style={{
              display: 'flex',
              gap: '18px',
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: '-2px',
            }}
          >
            <span style={{ color: 'white' }}>ACADEMIA</span>
            <span style={{ color: '#0f9d58' }}>GALILEO</span>
          </div>
        </div>

        <div style={{ fontSize: 40, color: '#c3cadb', marginTop: '32px', lineHeight: 1.3 }}>
          Preparación para el ingreso a la UNCuyo y la UTN
        </div>

        <div style={{ display: 'flex', gap: '14px', marginTop: '48px' }}>
          {['Física', 'Matemática', 'Exámenes reales'].map(t => (
            <div
              key={t}
              style={{
                fontSize: 26,
                color: '#8e9ab5',
                border: '2px solid #2b3a5c',
                borderRadius: '999px',
                padding: '10px 26px',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
