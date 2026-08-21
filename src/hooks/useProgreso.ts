'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabaseNavegador } from '@/lib/supabase'
import { importarProgresoLocal, marcarClase } from '@/app/acciones-progreso'

/**
 * De dónde sale el progreso, en un solo lugar.
 *
 * Se resuelve entero en el navegador, y eso es una decisión, no una comodidad:
 * el temario y las clases son páginas estáticas, y leer la sesión en el
 * servidor las volvería dinámicas. Ya vimos ese efecto con la cabecera —
 * alcanzó con leer cookies en un componente compartido para que todas las
 * páginas dejaran de prerenderizarse.
 *
 * Dos fuentes según quién mire:
 *
 * - Sin sesión: localStorage. Un alumno puede completar clases sin
 *   registrarse, y eso es lo que después lo empuja a crear la cuenta.
 * - Con sesión: la tabla `progreso`, que lo sigue en cualquier dispositivo.
 *
 * Al iniciar sesión, lo que había en localStorage se sube una vez. Sin eso,
 * quien completó cinco clases y recién ahí se registró las perdería todas.
 */
export function useProgreso(cursoSlug: string) {
  const clave = `galileo:completados:${cursoSlug}`
  const [completados, setCompletados] = useState<string[]>([])
  const [hayUsuario, setHayUsuario] = useState(false)
  const [cargando, setCargando] = useState(true)

  const leerLocal = useCallback((): string[] => {
    try {
      const guardado = window.localStorage.getItem(clave)
      return guardado ? (JSON.parse(guardado) as string[]) : []
    } catch {
      return []
    }
  }, [clave])

  useEffect(() => {
    const supabase = supabaseNavegador()
    let vivo = true

    async function resolver() {
      const { data } = await supabase.auth.getUser()
      if (!vivo) return

      if (!data.user) {
        setHayUsuario(false)
        setCompletados(leerLocal())
        setCargando(false)
        return
      }

      setHayUsuario(true)

      // RLS limita esta consulta a las filas del propio usuario, así que no
      // hace falta filtrar por user_id: la base no devolvería las de otro
      // aunque se lo pidiera.
      const { data: filas } = await supabase
        .from('progreso')
        .select('subtemas!inner(slug, cursos!inner(slug))')
        .eq('completado', true)
        .eq('subtemas.cursos.slug', cursoSlug)
        .overrideTypes<{ subtemas: { slug: string } }[]>()

      if (!vivo) return
      const deLaBase = (filas ?? []).map(f => f.subtemas.slug)

      // Con sesión, lo local ya no manda: se sube y se borra, así no queda una
      // segunda fuente de verdad desincronizándose en silencio.
      const locales = leerLocal()
      const nuevos = locales.filter(s => !deLaBase.includes(s))

      if (nuevos.length > 0) {
        await importarProgresoLocal(cursoSlug, nuevos)
        if (!vivo) return
      }
      try {
        window.localStorage.removeItem(clave)
      } catch {
        // Sin localStorage no hay nada que limpiar.
      }

      setCompletados([...new Set([...deLaBase, ...nuevos])])
      setCargando(false)
    }

    resolver()
    return () => {
      vivo = false
    }
  }, [clave, cursoSlug, leerLocal])

  async function alternar(slug: string, subtemaId: number) {
    const estaba = completados.includes(slug)
    const anterior = completados
    const siguiente = estaba ? completados.filter(s => s !== slug) : [...completados, slug]

    // Se actualiza la pantalla antes de esperar al servidor: marcar una clase
    // tiene que sentirse instantáneo.
    setCompletados(siguiente)

    if (hayUsuario) {
      const r = await marcarClase(subtemaId, !estaba)
      // Si el servidor rechaza, se vuelve atrás en vez de dejar en pantalla un
      // estado que la base no tiene.
      if (!r.ok) setCompletados(anterior)
      return
    }

    try {
      window.localStorage.setItem(clave, JSON.stringify(siguiente))
    } catch {
      // Sin localStorage el progreso dura lo que dure la pestaña.
    }
  }

  return { completados, alternar, hayUsuario, cargando }
}
