import { HeroActionPanel } from '@/components/HeroActionPanel'
import { HeroCard } from '@/components/HeroCard'
import { Hero } from "@/lib/Hero"
import { TurnPhase } from "@/lib/TurnPhase"

interface HeroGridProps {
  heroes: Hero[]
  onUpdateHero: (hero: Hero) => void
  onEditTrait: (heroId: string, traitIndex: number) => void
  activeTurnHeroId?: string
  playedHeroIds?: string[]
  currentTurnPhase?: TurnPhase
  onEndTurn: () => void
  onAttack?: (heroId: string) => void
  onDevour?: (heroId: string) => void
  onGainTrait?: (heroId: string) => void
}

export function HeroGrid({ heroes, onUpdateHero, onEditTrait: onEditTrait, activeTurnHeroId, playedHeroIds = [], currentTurnPhase, onEndTurn, onAttack, onDevour, onGainTrait }: HeroGridProps) {
  const activeHero = heroes.find(h => h.id === activeTurnHeroId)
  const showActionPanel = activeHero && currentTurnPhase === 'ACTIONS'

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        
        
          {showActionPanel && (
        <div className="sticky bottom-4 z-50 mt-auto">
          <HeroActionPanel
            hero={activeHero}
            onUpdateHero={onUpdateHero}
            onEndTurn={onEndTurn}
            onAttack={onAttack}
            onDevour={onDevour}
            onGainTrait={onGainTrait}
            className="rounded-xl border-2 shadow-2xl"
          />
        </div>
      )}
        
        {heroes.map((hero) => (
          <HeroCard
            key={hero.id}
            hero={hero}
            onUpdateHero={onUpdateHero}
            onEditTrait={(traitIndex) => onEditTrait(hero.id, traitIndex)}
            isActiveTurn={hero.id === activeTurnHeroId}
            hasPlayed={playedHeroIds.includes(hero.id)}
          />
        ))}
      </div>

    
    </div>
  )
}
