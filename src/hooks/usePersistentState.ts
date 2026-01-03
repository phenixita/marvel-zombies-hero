import { useEffect, useState } from "react"

const readValue = <T,>(key: string, fallback: T) => {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return fallback
    }

    return JSON.parse(raw) as T
  } catch {
    window.localStorage.removeItem(key)
    return fallback
  }
}

export function usePersistentState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => readValue(key, fallback))

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState] as const
}
