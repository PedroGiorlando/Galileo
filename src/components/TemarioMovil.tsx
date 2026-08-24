'use client'

import { useEffect, useRef } from 'react'
import { ListTree, X } from 'lucide-react'
import type { ModuloConClases } from '@/lib/contenido'
import { Sidebar } from './Sidebar'

interface TemarioMovilProps {
  materiaSlug: string
  materiaNombre: string
  moduloNombre: string
  temario: ModuloConClases[]
  slugActual: string
  completados: string[]
}

/**
 * El temario en el celular: un botón flotante que abre un panel lateral.
 *
 * En escritorio el temario es una columna al costado y se ve siempre. En un
 * teléfono esa misma columna se apilaba ARRIBA del contenido, así que había que
 * pasar por casi 700px de índice antes de llegar a la primera línea de la
 * clase. Acá el contenido queda primero y el temario se pide cuando se lo
 * necesita.
 *
 * Es un <dialog> nativo y no un div con un fondo oscuro encima, porque
 * `showModal()` trae gratis cuatro cosas que a mano casi siempre salen mal:
 *
 *   1. Atrapa el foco: tabulando no te escapás a los links de atrás.
 *   2. Escape lo cierra.
 *   3. Pinta el fondo con ::backdrop.
 *   4. Deja inerte el resto de la página (ni clics ni lectores de pantalla).
 *
 * Lo único que hay que agregar a mano es cerrar al tocar el fondo, que el
 * estándar no cubre.
 */
export function TemarioMovil(props: TemarioMovilProps) {
  const dialogo = useRef<HTMLDialogElement>(null)

  // Al cambiar de clase hay que cerrarlo. Next navega del lado del cliente sin
  // recargar, así que el <dialog> se quedaría abierto sobre la clase nueva.
  // Depende del slug y no del clic en el link: así también cubre el botón
  // "atrás" del navegador.
  useEffect(() => {
    dialogo.current?.close()
  }, [props.slugActual])

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        // Abajo a la izquierda: la esquina de abajo a la derecha es donde va
        // por convención el botón de WhatsApp, que está en la hoja de ruta.
        className="fixed bottom-5 left-5 z-40 flex min-h-14 items-center gap-2 rounded-full bg-tinta pr-5 pl-4 text-sm font-medium text-white shadow-lg transition-transform active:scale-95 lg:hidden"
      >
        <ListTree size={20} />
        Temario
      </button>

      <dialog
        ref={dialogo}
        aria-label="Temario de la unidad"
        // El clic en el fondo llega con el <dialog> como destino, porque el
        // contenido de adentro no lo cubre. Si el destino es otra cosa, el clic
        // fue en el panel y no hay que cerrar nada.
        onClick={e => {
          if (e.target === dialogo.current) dialogo.current.close()
        }}
        className="m-0 h-dvh max-h-dvh w-80 max-w-[85vw] bg-papel p-0 backdrop:bg-tinta/60 lg:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-linea px-4 py-2">
            <span className="font-display font-bold text-tinta">Temario</span>
            <button
              type="button"
              onClick={() => dialogo.current?.close()}
              aria-label="Cerrar el temario"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-tinta-suave hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <Sidebar {...props} className="w-full" />
          </div>
        </div>
      </dialog>
    </>
  )
}
