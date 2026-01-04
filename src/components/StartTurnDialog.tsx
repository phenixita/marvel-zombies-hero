import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Hero } from "@/lib/Hero"
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface StartTurnDialogProps {
  open: boolean
  heroes: Hero[]
  onSelectHero: (heroId: string) => void
  onClose: () => void
}

export function StartTurnDialog({ open, heroes, onSelectHero, onClose }: StartTurnDialogProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)

  useEffect(() => {
    if (!open) {
      setSelectedNumber(null)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape to close
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Check if key is a digit
      const digit = parseInt(e.key)
      if (isNaN(digit) || digit < 1 || digit > heroes.length) {
        return
      }

      // Valid number pressed - auto-confirm
      setSelectedNumber(digit)
      setTimeout(() => {
        onSelectHero(heroes[digit - 1].id) // Use hero ID from the filtered list
      }, 150) // Brief delay for visual feedback
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, heroes, onSelectHero, onClose])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-2xl uppercase">
            Start Turn
          </DialogTitle>
          <DialogDescription>
            {heroes.length === 1 
              ? `Press 1 to start ${heroes[0].name}'s turn`
              : `Press a number (1-${heroes.length}) to select which hero's turn it is`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {heroes.map((hero, index) => {
            const heroNumber = index + 1
            const isSelected = selectedNumber === heroNumber

            return (
              <button
                key={hero.id}
                onClick={() => {
                  setSelectedNumber(heroNumber)
                  setTimeout(() => onSelectHero(hero.id), 150)
                }}
                className={cn(
                  'w-full p-4 rounded-lg border-2 transition-all duration-150',
                  'flex items-center gap-4 hover:border-accent/50',
                  isSelected
                    ? 'border-accent bg-accent/10 scale-[0.98]'
                    : 'border-border bg-card'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-rajdhani font-bold text-xl',
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {heroNumber}
                </div>
                <div className="flex-1 text-left">
                  <div className={cn(
                    'font-rajdhani font-semibold text-lg uppercase',
                    isSelected ? 'text-accent' : 'text-foreground'
                  )}>
                    {hero.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Health: {hero.health}/5 | Hunger: {hero.hunger}/4
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
