import { Button } from '@/components/ui/button'
import { Hero } from "@/lib/Hero"
import { cn } from '@/lib/utils'

interface HeroActionPanelProps {
  hero: Hero
  onUpdateHero: (hero: Hero) => void
  onEndTurn: () => void
  onAttack?: (heroId: string) => void
  onDevour?: (heroId: string) => void
  className?: string
}

export function HeroActionPanel({ hero, onUpdateHero, onEndTurn, onAttack, onDevour, className }: HeroActionPanelProps) {
  const isRavenous = hero.hunger >= 4
  const actionsRemaining = hero.availableActions ?? 0
  const actionsExhausted = actionsRemaining === 0

  const handleAction = (action: 'devour' | 'attack' | 'move' | 'interact' | 'open_door' | 'gain_trait') => {
    if (actionsRemaining <= 0) return

    // Special actions that open dialogs
    if (action === 'attack') {
      onAttack?.(hero.id)
      return
    }

    if (action === 'devour') {
      onDevour?.(hero.id)
      return
    }

    // Generic actions simply consume an action
    onUpdateHero({
      ...hero,
      availableActions: Math.max(0, actionsRemaining - 1)
    })
  }

  return (
    <div className={cn(
      "bg-card/95 backdrop-blur-sm border-t-2 border-accent/20 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-full duration-300",
      className
    )}>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Active Hero</span>
            <span className="font-rajdhani font-bold text-xl text-accent-11 uppercase">{hero.name}</span>
          </div>
          
          <div className="h-10 w-[2px] bg-border hidden md:block" />
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Actions</span>
            <span className={cn(
              "font-rajdhani font-bold text-2xl",
              actionsExhausted ? "text-muted-foreground" : "text-accent-11"
            )}>{actionsRemaining}/3</span>
          </div>
        </div>

        {isRavenous && (
          <div className="bg-destructive/20 px-3 py-1 rounded border border-destructive/30 text-xs text-destructive font-bold uppercase tracking-tighter animate-pulse">
            Ravenous - Only Devour allowed!
          </div>
        )}

        <div className="flex-1 grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
          <Button
            size="sm"
            variant="secondary"
            className="h-10 text-[10px] uppercase font-bold tracking-tight"
            disabled={actionsExhausted || isRavenous}
            onClick={() => handleAction('move')}
          >
            Move
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-10 text-[10px] uppercase font-bold tracking-tight"
            disabled={actionsExhausted || isRavenous}
            onClick={() => handleAction('attack')}
          >
            Attack
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-10 text-[10px] uppercase font-bold tracking-tight"
            disabled={actionsExhausted}
            onClick={() => handleAction('devour')}
          >
            Devour
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-10 text-[10px] uppercase font-bold tracking-tight"
            disabled={actionsExhausted || isRavenous}
            onClick={() => handleAction('open_door')}
          >
            Open Door
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-10 text-[10px] uppercase font-bold tracking-tight"
            disabled={actionsExhausted || isRavenous}
            onClick={() => handleAction('gain_trait')}
          >
            Gain Trait
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-10 text-[10px] uppercase font-bold tracking-tight"
            disabled={actionsExhausted || isRavenous}
            onClick={() => handleAction('interact')}
          >
            Interact
          </Button>
        </div>

        <Button
          variant="default"
          className="w-full md:w-32 h-10 font-rajdhani font-bold uppercase bg-accent-9 hover:bg-accent-10 text-white"
          onClick={onEndTurn}
        >
          End Turn
        </Button>
      </div>
    </div>
  )
}
