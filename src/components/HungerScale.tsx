import { cn } from '@/lib/utils'
import { Skull } from 'lucide-react'

interface HungerScaleProps {
  hunger: number
  maxHunger: number
  onChange: (newHunger: number) => void
  className?: string
}

export function HungerScale({ hunger, maxHunger, onChange, className }: HungerScaleProps) {
  return (
    <div className={cn('flex flex-col-reverse gap-1', className)}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground">
        <Skull className="w-6 h-6" />
      </div>
      {Array.from({ length: maxHunger + 1 }).map((_, index) => {
        const active = index <= hunger
        return (
          <button
            key={index}
            onClick={() => onChange(index)}
            className={cn(
              'w-10 h-10 rounded border-2 flex items-center justify-center font-bold transition-all duration-200',
              'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring',
              active
                ? 'bg-primary border-primary text-primary-foreground scale-105'
                : 'bg-card border-border text-muted-foreground hover:border-primary/50'
            )}
            aria-label={`Hunger level ${index}`}
          >
            {index}
          </button>
        )
      })}
    </div>
  )
}
