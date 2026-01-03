import { useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Hero } from '@/lib/types'

interface PhaseConfirmationDialogProps {
  open: boolean
  phase: 'START' | 'END' | 'GAME_OVER'
  hero: Hero | null
  message: string
  details?: string[]
  isAutomaticMode: boolean
  onConfirm: () => void
  onClose: () => void
}

export function PhaseConfirmationDialog({
  open,
  phase,
  hero,
  message,
  details,
  isAutomaticMode,
  onConfirm,
  onClose,
}: PhaseConfirmationDialogProps) {
  // Auto-proceed in automatic mode after a brief delay for visual feedback
  useEffect(() => {
    if (open && isAutomaticMode && phase !== 'GAME_OVER') {
      const timer = setTimeout(() => {
        onConfirm()
      }, 800) // 800ms delay to show the message briefly
      
      return () => clearTimeout(timer)
    }
  }, [open, isAutomaticMode, phase, onConfirm])

  const getPhaseTitle = () => {
    switch (phase) {
      case 'START':
        return `Turn Started: ${hero?.name}`
      case 'END':
        return `Turn Ended: ${hero?.name}`
      case 'GAME_OVER':
        return 'Game Over'
      default:
        return 'Turn Update'
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case 'GAME_OVER':
        return 'text-destructive'
      case 'START':
        return 'text-accent-11'
      case 'END':
        return 'text-foreground'
      default:
        return 'text-foreground'
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className={`font-rajdhani text-2xl uppercase ${getPhaseColor()}`}>
            {getPhaseTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p className="text-base font-medium">{message}</p>
            
            {details && details.length > 0 && (
              <ul className="space-y-1 text-sm">
                {details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-accent-11 mt-0.5">→</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}

            {isAutomaticMode && phase !== 'GAME_OVER' && (
              <p className="text-xs text-muted-foreground italic pt-2">
                Auto-proceeding in automatic mode...
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onConfirm}>
            {phase === 'GAME_OVER' ? 'End Game' : 'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
