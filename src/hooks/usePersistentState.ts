import { useEffect, useState } from "react"

const STORAGE_TEST_KEY = "__marvel_zombies_storage_test__"

const canUseLocalStorage = () => {
  if (typeof window === "undefined") {
    return false
  }

  try {
    window.localStorage.setItem(STORAGE_TEST_KEY, STORAGE_TEST_KEY)
    window.localStorage.removeItem(STORAGE_TEST_KEY)
    return true
  } catch {
    return false
  }
}

const readValue = <T,>(key: string, fallback: T) => {
  if (typeof window === "undefined") {
    return fallback
  }

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
  const initialStorageAvailable = canUseLocalStorage()
  const [storageAvailable, setStorageAvailable] = useState(initialStorageAvailable)
  const [state, setState] = useState<T>(() => {
    if (!initialStorageAvailable) {
      return fallback
    }

    return readValue(key, fallback)
  })

  useEffect(() => {
    if (!storageAvailable) {
      return
    }

    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      setStorageAvailable(false)
    }
  }, [key, state, storageAvailable])

  return [state, setState, storageAvailable] as const
}
