import { Button } from '@/components/ui/button'
import { forwardRef } from 'react'

interface ActionButtonProps {
  variant?: 'secondary' | 'link'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ variant = 'secondary', disabled, onClick, children }, ref) => {
    return (
      <Button
        ref={ref}
        size="sm"
        variant={variant}
        className="h-10 text-[10px] uppercase font-bold tracking-tight"
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </Button>
    )
  }
)

ActionButton.displayName = 'ActionButton'