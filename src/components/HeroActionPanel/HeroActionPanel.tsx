import { consumeAction, restoreAction } from '@/lib/gameLogic'
import { Hero } from "@/lib/Hero"
import { getMaxActions, isRavenous } from '@/lib/heroUtils'
import { cn } from '@/lib/utils'
import { ActionButton } from './ActionButton'
import { EndTurnButton } from './EndTurnButton'

interface HeroActionPanelProps {
  hero: Hero | undefined
  onUpdateHero: (hero: Hero) => void
  onEndTurn: () => void
  onAttack?: (heroId: string) => void
  onDevour?: (heroId: string) => void
  onGainTrait?: (heroId: string) => void
  onIncrementTurnCounter: (heroId: string) => void
  onDecrementTurnCounter: (heroId: string) => void
  className?: string
}

export function HeroActionPanel({ hero, onUpdateHero, onEndTurn, onAttack, onDevour, onGainTrait, onIncrementTurnCounter, onDecrementTurnCounter, className }: HeroActionPanelProps) {
  const ravenous = hero ? isRavenous(hero) : false
  const actionsRemaining = hero?.availableActions ?? 0
  const totalActions = hero ? getMaxActions(hero.level) : 0
  const actionsExhausted = actionsRemaining === 0

  const isActionDisabled = actionsExhausted || ravenous || !hero
  const isMoveDisabled = actionsExhausted || !hero

  const handleAction = (action: 'devour' | 'attack' | 'move' | 'interact' | 'open_door' | 'gain_trait' | 'increment_turn_counter' | 'decrement_turn_counter') => {
    
    if (action === 'increment_turn_counter') {
      onUpdateHero(restoreAction(hero!))
      return
    }

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

        <div className="flex-1 grid grid-cols-4 gap-3 w-full">
          <ActionButton
            variant="secondary"
            disabled={isMoveDisabled}
            onClick={() => handleAction('move')}
          >
            Move
          </ActionButton>
          <ActionButton
            variant="secondary"
            disabled={isActionDisabled}
            onClick={() => handleAction('attack')}
          >
            Attack
          </ActionButton>
          <ActionButton
            variant="secondary"
            disabled={!hero || hero.hunger < 1 || actionsExhausted}
            onClick={() => handleAction('devour')}
          >
            Devour
          </ActionButton>
          <ActionButton
            variant="link"
            disabled={actionsRemaining >= totalActions || !hero}
            onClick={() => handleAction('increment_turn_counter')}
          >
            Add action
          </ActionButton>
          <ActionButton
            variant="secondary"
            disabled={isActionDisabled}
            onClick={() => handleAction('open_door')}
          >
            Open Door
          </ActionButton>
          <ActionButton
            variant="secondary"
            disabled={isActionDisabled}
            onClick={() => handleAction('gain_trait')}
          >
            Gain Trait
          </ActionButton>
          <ActionButton
            variant="secondary"
            disabled={isActionDisabled}
            onClick={() => handleAction('interact')}
          >
            Interact
          </ActionButton>
          <ActionButton
            variant="link"
            disabled={actionsRemaining <= 0 || !hero }
            onClick={() => handleAction('decrement_turn_counter')}
          >
            Remove action
          </ActionButton>
        </div>

        <EndTurnButton
          disabled={!hero}
          onClick={onEndTurn}
        />
      </div>
    </div>
  )
}
