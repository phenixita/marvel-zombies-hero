import { Button } from '@/components/ui/button'
import { consumeAction } from '@/lib/gameLogic'
import { Hero } from "@/lib/Hero"
import { getMaxActions, isRavenous } from '@/lib/heroUtils'
import { cn } from '@/lib/utils'
import { Stop } from '@phosphor-icons/react'
import { actionButtonClassName, actionsBoxClassName, actionsCountBaseClassName, buttonsGridClassName, containerClassName, endTurnButtonClassName, headerClassName, heroNameClassName, infoClassName, layoutClassName, ravenousClassName, separatorClassName, smallLabelClassName } from './styles'

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
  const isMoveDisabled = actionsExhausted || !hero

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
      containerClassName,
      className
    )}>
      <div className={layoutClassName}>
        <div className={headerClassName}>
          <div className={infoClassName}>
            <span className={smallLabelClassName}> {hero ? "Active Hero" : "Waiting..."}</span>
            <span className={heroNameClassName}>{hero?.name}</span>
            {ravenous && (<span className={ravenousClassName}>Ravenous!</span>)}
          </div>

          <div className={separatorClassName} />

          <div className={actionsBoxClassName}>
            <span className={smallLabelClassName}>Actions</span>
            <span className={cn(
              actionsCountBaseClassName,
              actionsExhausted ? "text-muted-foreground" : "text-accent-11"
            )}>{actionsRemaining}/{totalActions}</span>
          </div>
        </div>

        <div className={buttonsGridClassName}>
          <Button
            size="sm"
            variant="secondary"
            className={actionButtonClassName}
            disabled={isMoveDisabled}
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
          className={endTurnButtonClassName}
          onClick={onEndTurn}
          disabled={!hero}
        >
          <Stop /> End Turn
        </Button>
      </div>
    </div>
  )
}
