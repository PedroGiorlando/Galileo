import { useEffect, useState } from 'react'

/**
 * Mismo contrato que useState, pero persiste en localStorage.
 *
 * El valor guardado NO se lee en el inicializador de useState: ese código
 * también corre en el servidor, donde `window` no existe. Si el servidor
 * renderiza el default y el cliente renderiza el valor guardado, los dos HTML
 * no coinciden y React tira un hydration mismatch.
 *
 * Por eso el primer render siempre usa `defaultValue` y el valor guardado se
 * lee en un efecto, que solo corre en el navegador y después de montar.
 *
 * ponytail: eso hace que un usuario que vuelve vea un parpadeo (default →
 * valor real). Es aceptable mientras el progreso sea anónimo; en la Fase 2 el
 * progreso viene de la base en el render del servidor y el parpadeo desaparece.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) setValue(JSON.parse(stored) as T)
    } catch {
      // localStorage no disponible (modo privado, cuota llena): seguimos en memoria.
    }
  }, [key])

  const setAndPersist = (next: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = next instanceof Function ? next(prev) : next
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // localStorage no disponible: seguimos solo en memoria.
      }
      return resolved
    })
  }

  return [value, setAndPersist]
}
