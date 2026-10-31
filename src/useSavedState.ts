import { useEffect, useState } from 'react'
import { readSaved } from './library'

export function useSavedState<T>(key: string, fallback: T, validate: (value: unknown) => value is T) {
  const [value, setValue] = useState<T>(() => {
    try { return readSaved(localStorage, key, fallback, validate) } catch { return fallback }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* Keep session state when storage is disabled or full. */ } }, [key, value])
  return [value, setValue] as const
}
