import { useState } from 'react'

/**
 * Mismo contrato que useState, pero lee el valor inicial de localStorage
 * y escribe ahí en cada cambio. Si localStorage falla (modo privado, cuota
 * llena) simplemente no persiste — la app sigue funcionando en memoria.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

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
