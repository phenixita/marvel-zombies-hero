import { useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
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
          </div>

          <HealthIndicator
            health={hero.health}
            maxHealth={5}
            onChange={handleHealthChange}
          />

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
