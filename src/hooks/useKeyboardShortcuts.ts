import { useEffect } from 'react'

/**
 * Custom hook to manage global keyboard shortcuts
 */
export function useKeyboardShortcuts(handlers: {
  onNewGame: () => void
  onShowKeyboardHelp: () => void
  onStartTurn: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+N - New Game
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handlers.onNewGame()
      }
      
      // Cmd/Ctrl+K - Show Keyboard Help
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handlers.onShowKeyboardHelp()
      }
      
      // Cmd/Ctrl+T - Start Turn
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault()
        handlers.onStartTurn()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
