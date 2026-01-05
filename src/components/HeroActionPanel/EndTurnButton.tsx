import { Button } from '@/components/ui/button'
import { Square } from 'lucide-react'
import { forwardRef } from 'react'

interface EndTurnButtonProps {
  disabled?: boolean
  onClick?: () => void
}

export const EndTurnButton = forwardRef<HTMLButtonElement, EndTurnButtonProps>(
  ({ disabled, onClick }, ref) => {
    return (
      <Button
        ref={ref}
        variant="default"
        className="w-full md:w-32 h-10 font-rajdhani font-bold uppercase"
        disabled={disabled}
        onClick={onClick}
      >
        <Square fill='white' /> End Turn
      </Button>
    )
  }
)

EndTurnButton.displayName = 'EndTurnButton'