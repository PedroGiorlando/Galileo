import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Academia Galileo',
    template: '%s | Academia Galileo',
  },
  description:
    'Apoyo escolar de primaria con explicaciones, ejemplos resueltos y ejercicios que se corrigen solos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  )
}
