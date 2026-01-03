import { Hero } from '@/lib/types'
import { HeroCard } from '@/components/HeroCard'

interface HeroGridProps {
  heroes: Hero[]
  onUpdateHero: (hero: Hero) => void
  onEditPower: (heroId: string, powerIndex: number) => void
  activeTurnHeroId?: string
}

export function HeroGrid({ heroes, onUpdateHero, onEditPower, activeTurnHeroId }: HeroGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {heroes.map((hero) => (
        <HeroCard
          key={hero.id}
          hero={hero}
          onUpdateHero={onUpdateHero}
          onEditPower={(powerIndex) => onEditPower(hero.id, powerIndex)}
          isActiveTurn={hero.id === activeTurnHeroId}
        />
      ))}
    </div>
  )
}
