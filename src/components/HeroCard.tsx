import { HealthIndicator } from '@/components/HealthIndicator'
import { HungerScale } from '@/components/HungerScale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Hero } from "@/lib/Hero"
import { cn } from '@/lib/utils'
import { PencilSimple } from '@phosphor-icons/react'
import { useState } from 'react'
import { TraitSlot } from './TraitSlot'

interface HeroCardProps {
  hero: Hero
  onUpdateHero: (hero: Hero) => void
  onEditTrait: (traitIndex: number) => void
  isActiveTurn?: boolean
  hasPlayed?: boolean
  className?: string
}

export function HeroCard({ hero, onUpdateHero, onEditTrait: onEditTrait, isActiveTurn = false, hasPlayed = false, className }: HeroCardProps) {
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

  const handleDeleteTrait = (traitIndex: number) => {
    const newTraits = hero.traits.filter((_, idx) => idx !== traitIndex)
    onUpdateHero({ ...hero, traits: newTraits })
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
        'relative border-2 transition-all duration-200',
        'shadow-lg hover:shadow-xl',
        isActiveTurn
          ? 'border-accent-9 border-4 ring-2 ring-accent-9/20'
          : 'border-border hover:border-accent/30',
        className
      )}
    >
      <div className="grid grid-cols-[auto_1fr] gap-6 p-2">
        {/* Column 1: Hunger Scale */}
        <div className={cn(
          "row-span-3 flex flex-col items-center justify-center",
          isRavenous && "animate-pulse text-destructive"
        )}>
          <HungerScale
            hunger={hero.hunger}
            maxHunger={4}
            onChange={handleHungerChange}
          />
        </div>

        {/* Column 2, Row 1: Name and Health */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
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
                className="font-rajdhani font-bold text-2xl uppercase tracking-tight border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 h-auto py-0"
              />
            ) : (
              <div className="group flex items-center gap-2">
                <h2 className={cn(
                  'font-rajdhani font-bold text-3xl uppercase tracking-tight leading-none',
                  isActiveTurn ? 'text-accent-11' : (hasPlayed ? 'text-muted-foreground/60' : 'text-foreground')
                )}>
                  {hero.name}
                </h2>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-50 hover:opacity-100 transition-opacity"
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
        </div>

        {/* Column 2, Row 2: Stats (EXP, Base Attack, Precision) */}
        <div className="flex items-center gap-6">
          <Badge className={cn('text-white border-0 text-sm px-3 py-1', getLevelColor(hero.level))}>
            EXP: {hero.level} - {getLevelCategory(hero.level)}
          </Badge>

          <div className="flex items-center gap-4">
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
                className="w-16 h-8 px-2 py-0 text-sm"
              />
            ) : (
              <button
                onClick={() => setIsEditingBaseAttack(true)}
                className="group/attack flex items-center gap-2 px-3 py-1.5 rounded font-medium bg-muted hover:bg-muted/80 transition-colors text-sm"
              >
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Base Attack</span>
                <span className="font-rajdhani font-bold text-lg">{hero.baseAttackValue}</span>
                <PencilSimple className="w-3 h-3 opacity-50 group-hover/attack:opacity-100 transition-opacity" />
              </button>
            )}

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
                max="6"
                className="w-16 h-8 px-2 py-0 text-sm"
              />
            ) : (
              <button
                onClick={() => setIsEditingPrecision(true)}
                className="group/precision flex items-center gap-2 px-3 py-1.5 rounded font-medium bg-muted hover:bg-muted/80 transition-colors text-sm"
              >
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Precision</span>
                <span className="font-rajdhani font-bold text-lg">{hero.precision}+</span>
                <PencilSimple className="w-3 h-3 opacity-50 group-hover/precision:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>

        {/* Column 2, Row 3: Trait Slots */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <TraitSlot
              key={index}
              trait={hero.traits[index] || null}
              onEdit={() => onEditTrait(index)}
              onDelete={hero.traits[index] ? () => handleDeleteTrait(index) : undefined}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
