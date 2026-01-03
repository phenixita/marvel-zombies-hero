import { useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { HealthIndicator } from '@/components/HealthIndicator'
import { HungerScale } from '@/components/HungerScale'
import { PowerSlot } from '@/components/PowerSlot'
import { Hero, Power } from '@/lib/types'
import { cn } from '@/lib/utils'

interface HeroCardProps {
  hero: Hero
  onUpdateHero: (hero: Hero) => void
  onEditPower: (powerIndex: number) => void
  isActiveTurn?: boolean
  className?: string
}

export function HeroCard({ hero, onUpdateHero, onEditPower, isActiveTurn = false, className }: HeroCardProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(hero.name)

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      onUpdateHero({ ...hero, name: nameInput.trim() })
    }
    setIsEditingName(false)
  }

  const handleHealthChange = (newHealth: number) => {
    onUpdateHero({ ...hero, health: Math.max(0, Math.min(5, newHealth)) })
  }

  const handleHungerChange = (newHunger: number) => {
    onUpdateHero({ ...hero, hunger: Math.max(0, Math.min(4, newHunger)) })
  }

  const handleDeletePower = (powerIndex: number) => {
    const newPowers = hero.powers.filter((_, idx) => idx !== powerIndex)
    onUpdateHero({ ...hero, powers: newPowers })
  }

  const handleAction = (action: 'devour' | 'attack' | 'collect') => {
    const currentActions = hero.availableActions ?? 0
    if (currentActions <= 0) return

    const updates: Partial<Hero> = {
      availableActions: currentActions - 1
    }

    if (action === 'devour') {
      updates.hunger = 0
    }

    onUpdateHero({ ...hero, ...updates })
  }

  const getLevelColor = (level: number): string => {
    if (level <= 6) return 'bg-blue-500'
    if (level <= 21) return 'bg-yellow-500'
    if (level <= 42) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getLevelCategory = (level: number): string => {
    if (level <= 6) return 'Blue'
    if (level <= 21) return 'Yellow'
    if (level <= 42) return 'Orange'
    return 'Red'
  }

  return (
    <Card
      className={cn(
        'relative p-6 bg-card border-2 transition-all duration-200',
        'shadow-lg hover:shadow-xl',
        isActiveTurn 
          ? 'border-accent-9 border-4 ring-2 ring-accent-9/20' 
          : 'border-border hover:border-accent/30',
        className
      )}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <HungerScale
            hunger={hero.hunger}
            maxHunger={4}
            onChange={handleHungerChange}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            {isEditingName ? (
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSubmit()
                  if (e.key === 'Escape') {
                    setNameInput(hero.name)
                    setIsEditingName(false)
                  }
                }}
                autoFocus
                className="font-rajdhani font-bold text-2xl uppercase tracking-tight border-0 border-b-2 rounded-none px-0 focus-visible:ring-0"
              />
            ) : (
              <div className="group flex items-center gap-2">
                <h2 className={cn(
                  'font-rajdhani font-bold text-2xl uppercase tracking-tight',
                  isActiveTurn ? 'text-accent-11' : 'text-foreground'
                )}>
                  {hero.name}
                </h2>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsEditingName(true)}
                >
                  <PencilSimple className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            <Badge className={cn('text-white border-0 text-xs', getLevelColor(hero.level))}>
              Lvl {hero.level} - {getLevelCategory(hero.level)}
            </Badge>
          </div>

          <HealthIndicator
            health={hero.health}
            maxHealth={5}
            onChange={handleHealthChange}
          />

          {isActiveTurn && (
            <div className="bg-accent/10 p-3 rounded-md border border-accent/20 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between text-sm font-medium text-accent-11">
                <span className="uppercase tracking-wider text-xs">Actions Available</span>
                <span className="font-rajdhani font-bold text-xl">{hero.availableActions ?? 0}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-[10px] sm:text-xs uppercase font-bold tracking-tight"
                  disabled={(hero.availableActions ?? 0) <= 0}
                  onClick={() => handleAction('devour')}
                >
                  Devour
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-[10px] sm:text-xs uppercase font-bold tracking-tight"
                  disabled={(hero.availableActions ?? 0) <= 0 || hero.hunger >= 4}
                  onClick={() => handleAction('attack')}
                >
                  Attack
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 text-[10px] sm:text-xs uppercase font-bold tracking-tight"
                  disabled={(hero.availableActions ?? 0) <= 0 || hero.hunger >= 4}
                  onClick={() => handleAction('collect')}
                >
                  Collect
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <PowerSlot
                key={index}
                power={hero.powers[index] || null}
                onEdit={() => onEditPower(index)}
                onDelete={hero.powers[index] ? () => handleDeletePower(index) : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
