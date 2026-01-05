import { cn } from '@/lib/utils'
import { Heart } from 'lucide-react'

interface HealthIndicatorProps {
  health: number
  maxHealth: number
  onChange: (newHealth: number) => void
  className?: string
}

export function HealthIndicator({ health, maxHealth, onChange, className }: HealthIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: maxHealth }).map((_, index) => {
        const filled = index < health
        return (
          <button
            key={index}
            onClick={() => onChange(index + 1 === health ? index : index + 1)}
            className={cn(
              'w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring',
              filled
                ? 'bg-accent border-accent text-accent-foreground'
                : 'bg-card border-border text-muted-foreground hover:border-accent/50'
            )}
            aria-label={`Health point ${index + 1}`}
          >
            <Heart fill={filled ? 'currentColor' : 'none'}  className="w-full h-full p-2" />
          </button>
        )
      })}
    </div>
  )
}
