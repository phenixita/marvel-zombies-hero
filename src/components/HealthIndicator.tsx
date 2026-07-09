import { cn } from '@/lib/utils'
import { Heart, Skull } from 'lucide-react'

interface HealthIndicatorProps {
  health: number
  maxHealth: number
  onChange: (newHealth: number) => void
  className?: string
}

export function HealthIndicator({ health, maxHealth, onChange, className }: HealthIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1 sm:gap-2', className)}>
      {/* Dead state icon (0 health) */}
      <button
        onClick={() => onChange(0)}
        className={cn(
          'w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring',
          health === 0
            ? 'bg-destructive border-destructive text-destructive-foreground'
            : 'bg-card border-border text-muted-foreground hover:border-destructive/50'
        )}
        aria-label="Dead"
      >
        <Skull fill={health === 0 ? 'currentColor' : 'none'} className="w-full h-full p-1 sm:p-2" />
      </button>

      {/* Health points (1-5) */}
      {Array.from({ length: maxHealth }).map((_, index) => {
        const healthValue = index + 1
        const filled = healthValue <= health
        return (
          <button
            key={`health-${index}`}
            onClick={() => onChange(healthValue === health ? healthValue - 1 : healthValue)}
            className={cn(
              'w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring',
              filled
                ? 'bg-accent border-accent text-accent-foreground'
                : 'bg-card border-border text-muted-foreground hover:border-accent/50'
            )}
            aria-label={`Health point ${healthValue}`}
          >
            <Heart fill={filled ? 'currentColor' : 'none'} className="w-full h-full p-1 sm:p-2" />
          </button>
        )
      })}
    </div>
  )
}
