import { useEffect, useState } from 'react'

// Storage can be disabled or full; listening should still work in memory.
export function useSavedState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? 'null')
      return Array.isArray(parsed) && parsed.every(item => typeof item === 'string' || (item && typeof item === 'object' && ('id' in item || ('name' in item && Array.isArray(item.tracks))))) ? parsed as T : fallback
    } catch { return fallback }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* Keep session state. */ } }, [key, value])
  return [value, setValue] as const
}
