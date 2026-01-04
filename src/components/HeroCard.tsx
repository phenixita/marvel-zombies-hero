import { HealthIndicator } from '@/components/HealthIndicator'
import { HungerScale } from '@/components/HungerScale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Hero } from "@/lib/Hero"
import { cn } from '@/lib/utils'
import { getLevelColor, getLevelCategory, clampHealth, clampHunger, isRavenous } from '@/lib/heroUtils'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import { PencilSimple } from '@phosphor-icons/react'
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
  // Inline editing hooks
  const nameEdit = useInlineEdit(hero.name, (value) => {
    if (value.trim()) {
      onUpdateHero({ ...hero, name: value.trim() })
    }
  })

  const baseAttackEdit = useInlineEdit(hero.baseAttackValue, (value) => {
    onUpdateHero({ ...hero, baseAttackValue: value })
  }, {
    validator: (val) => !isNaN(parseInt(val)) && parseInt(val) >= 0,
    parser: (val) => parseInt(val)
  })

  const precisionEdit = useInlineEdit(hero.precision, (value) => {
    onUpdateHero({ ...hero, precision: value })
  }, {
    validator: (val) => !isNaN(parseInt(val)) && parseInt(val) >= 1 && parseInt(val) <= 6,
    parser: (val) => parseInt(val)
  })

  const handleHealthChange = (newHealth: number) => {
    onUpdateHero({ ...hero, health: clampHealth(newHealth) })
  }

  const handleHungerChange = (newHunger: number) => {
    onUpdateHero({ ...hero, hunger: clampHunger(newHunger) })
  }

  const handleDeleteTrait = (traitIndex: number) => {
    const newTraits = hero.traits.filter((_, idx) => idx !== traitIndex)
    onUpdateHero({ ...hero, traits: newTraits })
  }

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
          isRavenous(hero) && "animate-pulse text-destructive"
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
            {nameEdit.isEditing ? (
              <Input
                value={nameEdit.inputValue}
                onChange={(e) => nameEdit.setInputValue(e.target.value)}
                onBlur={nameEdit.saveEdit}
                onKeyDown={nameEdit.handleKeyDown}
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
                  onClick={nameEdit.startEdit}
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
            {baseAttackEdit.isEditing ? (
              <Input
                value={baseAttackEdit.inputValue}
                onChange={(e) => baseAttackEdit.setInputValue(e.target.value)}
                onBlur={baseAttackEdit.saveEdit}
                onKeyDown={baseAttackEdit.handleKeyDown}
                autoFocus
                type="number"
                min="0"
                className="w-16 h-8 px-2 py-0 text-sm"
              />
            ) : (
              <button
                onClick={baseAttackEdit.startEdit}
                className="group/attack flex items-center gap-2 px-3 py-1.5 rounded font-medium bg-muted hover:bg-muted/80 transition-colors text-sm"
              >
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Base Attack</span>
                <span className="font-rajdhani font-bold text-lg">{hero.baseAttackValue}</span>
                <PencilSimple className="w-3 h-3 opacity-50 group-hover/attack:opacity-100 transition-opacity" />
              </button>
            )}

            {precisionEdit.isEditing ? (
              <Input
                value={precisionEdit.inputValue}
                onChange={(e) => precisionEdit.setInputValue(e.target.value)}
                onBlur={precisionEdit.saveEdit}
                onKeyDown={precisionEdit.handleKeyDown}
                autoFocus
                type="number"
                min="1"
                max="6"
                className="w-16 h-8 px-2 py-0 text-sm"
              />
            ) : (
              <button
                onClick={precisionEdit.startEdit}
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
