import { Button } from '@/components/ui/button'
import { consumeAction } from '@/lib/gameLogic'
import { Hero } from "@/lib/Hero"
import { getMaxActions, isRavenous } from '@/lib/heroUtils'
import { cn } from '@/lib/utils'
import { Stop } from '@phosphor-icons/react'
import { actionButtonClassName } from './styles'

interface HeroActionPanelProps {
  hero: Hero | undefined
  onUpdateHero: (hero: Hero) => void
  onEndTurn: () => void
  onAttack?: (heroId: string) => void
  onDevour?: (heroId: string) => void
  onGainTrait?: (heroId: string) => void
  className?: string
}

export function HeroActionPanel({ hero, onUpdateHero, onEndTurn, onAttack, onDevour, onGainTrait, className }: HeroActionPanelProps) {
  const ravenous = hero ? isRavenous(hero) : false
  const actionsRemaining = hero?.availableActions ?? 0
  const totalActions = hero ? getMaxActions(hero.level) : 0
  const actionsExhausted = actionsRemaining === 0

  const isActionDisabled = actionsExhausted || ravenous || !hero

  const handleAction = (action: 'devour' | 'attack' | 'move' | 'interact' | 'open_door' | 'gain_trait') => {
    if (actionsRemaining <= 0) return

    if (action === 'attack') {
      onAttack?.(hero!.id)
      return
    }

    if (action === 'devour') {
      onDevour?.(hero!.id)
      return
    }

    if (action === 'gain_trait') {
      onGainTrait?.(hero!.id)
      return
    }

    onUpdateHero(consumeAction(hero!))
  }

  return (
    <div className={cn(
      "bg-card/95 backdrop-blur-sm border-t-2 border-accent/20 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-full duration-300",
      className
    )}>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold"> {hero ? "Active Hero" : "Waiting..."}</span>
            <span className="font-rajdhani font-bold text-xl text-accent-11 uppercase">{hero?.name}</span>
            {ravenous && (<span className="text-xs text-red-500 font-bold mt-1 uppercase">Ravenous!</span>)}
          </div>

          <div className="h-10 w-[2px] bg-border hidden md:block" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Actions</span>
            <span className={cn(
              "font-rajdhani font-bold text-2xl",
              actionsExhausted ? "text-muted-foreground" : "text-accent-11"
            )}>{actionsRemaining}/{totalActions}</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
          <Button
            size="sm"
            variant="secondary"
            className={actionButtonClassName}
            disabled={isActionDisabled}
            onClick={() => handleAction('move')}
          >
            Move
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={actionButtonClassName}
            disabled={isActionDisabled}
            onClick={() => handleAction('attack')}
          >
            Attack
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={actionButtonClassName}
            disabled={!hero || hero.hunger < 1 || actionsExhausted}
            onClick={() => handleAction('devour')}
          >
            Devour
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={actionButtonClassName}
            disabled={isActionDisabled}
            onClick={() => handleAction('open_door')}
          >
            Open Door
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={actionButtonClassName}
            disabled={isActionDisabled}
            onClick={() => handleAction('gain_trait')}
          >
            Gain Trait
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={actionButtonClassName}
            disabled={isActionDisabled}
            onClick={() => handleAction('interact')}
          >
            Interact
          </Button>
        </div>

        <Button
          variant="default"
          className="w-full md:w-32 h-10 font-rajdhani font-bold uppercase"
          onClick={onEndTurn}
          disabled={!hero}
        >
          <Stop /> End Turn
        </Button>
      </div>
    </div>
  )
}
