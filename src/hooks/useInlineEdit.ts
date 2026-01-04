import { useState, useCallback } from 'react'

/**
 * Custom hook for inline editing functionality
 */
export function useInlineEdit<T extends string | number>(
  initialValue: T,
  onSave: (value: T) => void,
  options?: {
    validator?: (value: string) => boolean
    parser?: (value: string) => T
  }
) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(String(initialValue))

  const startEdit = useCallback(() => {
    setInputValue(String(initialValue))
    setIsEditing(true)
  }, [initialValue])

  const cancelEdit = useCallback(() => {
    setInputValue(String(initialValue))
    setIsEditing(false)
  }, [initialValue])

  const saveEdit = useCallback(() => {
    // Validate if validator provided
    if (options?.validator && !options.validator(inputValue)) {
      cancelEdit()
      return
    }

    // Parse value if parser provided, otherwise use as-is
    const parsedValue = options?.parser 
      ? options.parser(inputValue) 
      : inputValue as T

    onSave(parsedValue)
    setIsEditing(false)
  }, [inputValue, onSave, options, cancelEdit])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }, [saveEdit, cancelEdit])

  return {
    isEditing,
    inputValue,
    setInputValue,
    startEdit,
    cancelEdit,
    saveEdit,
    handleKeyDown,
  }
}
