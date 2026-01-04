import { HealthIndicator } from '@/components/HealthIndicator'
import { HungerScale } from '@/components/HungerScale'
import { PowerSlot } from '@/components/PowerSlot'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Hero } from "@/lib/Hero"
import { TurnPhase } from "@/lib/TurnPhase"
import { cn } from '@/lib/utils'
import { PencilSimple } from '@phosphor-icons/react'
import { useState } from 'react'

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
  const [isEditingBaseAttack, setIsEditingBaseAttack] = useState(false)
  const [baseAttackInput, setBaseAttackInput] = useState(hero.baseAttackValue.toString())
  const [isEditingPrecision, setIsEditingPrecision] = useState(false)
  const [precisionInput, setPrecisionInput] = useState(hero.precision.toString())

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      onUpdateHero({ ...hero, name: nameInput.trim() })
    }
    setIsEditingName(false)
  }

  const handleBaseAttackSubmit = () => {
    const value = parseInt(baseAttackInput)
    if (!isNaN(value) && value >= 0) {
      onUpdateHero({ ...hero, baseAttackValue: value })
    } else {
      setBaseAttackInput(hero.baseAttackValue.toString())
    }
    setIsEditingBaseAttack(false)
  }

  const handlePrecisionSubmit = () => {
    const value = parseInt(precisionInput)
    if (!isNaN(value) && value >= 0) {
      onUpdateHero({ ...hero, precision: value })
    } else {
      setPrecisionInput(hero.precision.toString())
    }
    setIsEditingPrecision(false)
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

  const isRavenous = hero.hunger >= 4

  return (
    <Card
      className={cn(
        'relative p-2 bg-card border-2 transition-all duration-200',
        'shadow-lg hover:shadow-xl',
        isActiveTurn
          ? 'border-accent-9 border-4 ring-2 ring-accent-9/20'
          : 'border-border hover:border-accent/30',
        isRavenous && 'border-destructive/80 animate-pulse',
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

            <div className="flex items-center gap-2">
              <Badge className={cn('text-white border-0 text-xs', getLevelColor(hero.level))}>
                Lvl {hero.level} - {getLevelCategory(hero.level)}
              </Badge>

              {isEditingBaseAttack ? (
                <Input
                  value={baseAttackInput}
                  onChange={(e) => setBaseAttackInput(e.target.value)}
                  onBlur={handleBaseAttackSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBaseAttackSubmit()
                    if (e.key === 'Escape') {
                      setBaseAttackInput(hero.baseAttackValue.toString())
                      setIsEditingBaseAttack(false)
                    }
                  }}
                  autoFocus
                  type="number"
                  min="0"
                  className="w-16 h-6 px-2 py-0 text-xs"
                />
              ) : (
                <button
                  onClick={() => setIsEditingBaseAttack(true)}
                  className="group/attack flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="text-muted-foreground">BASE ATTACK </span>
                  <span className="font-rajdhani font-bold">{hero.baseAttackValue}</span>
                  <PencilSimple className="w-3 h-3 opacity-0 group-hover/attack:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
            {isEditingPrecision ? (
              <Input
                value={precisionInput}
                onChange={(e) => setPrecisionInput(e.target.value)}
                onBlur={handlePrecisionSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePrecisionSubmit()
                  if (e.key === 'Escape') {
                    setPrecisionInput(hero.precision.toString())
                    setIsEditingPrecision(false)
                  }
                }}
                autoFocus
                type="number"
                min="1"
                defaultValue="3"
                max="6"
                className="w-16 h-6 px-2 py-0 text-xs"
              />
            ) : (
              <button
                onClick={() => setIsEditingPrecision(true)}
                className="group/attack flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
              >
                <span className="text-muted-foreground">PRECISION </span>
                <span className="font-rajdhani font-bold">{hero.precision}</span>
                <PencilSimple className="w-3 h-3 opacity-0 group-hover/attack:opacity-100 transition-opacity" />
              </button>
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
