import { HungerScale } from '@/components/HungerScale'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import { Hero } from "@/lib/Hero"
import { clampHealth, clampHunger, getLevelCategory, getLevelColor, isRavenous } from '@/lib/heroUtils'
import { cn } from '@/lib/utils'
import { PencilSimple } from '@phosphor-icons/react'
import { HealthIndicator } from './HealthIndicator'
import { TraitSlot } from './TraitSlot'

interface HeroCardProps {
  hero: Hero
  onUpdateHero: (hero: Hero) => void
  onEditTrait: (traitIndex: number) => void
  onEditByStander: () => void
  isActiveTurn?: boolean
  hasPlayed?: boolean
  className?: string
}

export function HeroCard({ hero, onUpdateHero, onEditTrait, onEditByStander, isActiveTurn = false, hasPlayed = false, className }: HeroCardProps) {
  // Inline editing hooks
  const nameEdit = useInlineEdit(hero.name, (value) => {
    if (value.trim()) {
      onUpdateHero({ ...hero, name: value.trim() })
    }
  })

  const baseAttackEdit = useInlineEdit(hero.baseAttackValue, (value) => {
    onUpdateHero({ ...hero, baseAttackValue: value })
  }, {
    validator: (val) => {
      const parsed = parseInt(val)
      return !isNaN(parsed) && parsed >= 0
    },
    parser: (val) => parseInt(val)
  })

  const precisionEdit = useInlineEdit(hero.precision, (value) => {
    onUpdateHero({ ...hero, precision: value })
  }, {
    validator: (val) => {
      const parsed = parseInt(val)
      return !isNaN(parsed) && parsed >= 1 && parsed <= 6
    },
    parser: (val) => parseInt(val)
  })

  const levelEdit = useInlineEdit(hero.level, (value) => {
    onUpdateHero({ ...hero, level: value })
  }, {
    validator: (val) => {
      const parsed = parseInt(val)
      return !isNaN(parsed) && parsed >= 0
    },
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

  const handleDeleteByStander = () => {
    onUpdateHero({ ...hero, byStander: null })
  }

  return (
    <Card
      className={cn(
        'relative border-2 transition-all duration-200 flex flex-col p-0 gap-0 overflow-hidden',
        'shadow-lg hover:shadow-xl',
        isActiveTurn
          ? 'border-accent-9 border-4 ring-2 ring-accent-9/20'
          : 'border-border hover:border-accent/30',
        className
      )}
    >
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-6 p-4 flex-1">
        {/* Column 1: Hunger Scale (spans 3 rows) */}
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

        {/* Row 1, Columns 2-4: Health, Name and Stats */}
        <div className="col-span-3 flex items-center justify-between gap-6">


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

        {/* Row 2, Column 2: ByStander Slot */}
        <TraitSlot
          trait={hero.byStander}
          onEdit={onEditByStander}
          onDelete={hero.byStander ? handleDeleteByStander : undefined}
          emptyText="Add Bystander"
          icon="user"
        />

        {/* Row 2, Columns 3-4: Trait Slots */}
        {Array.from({ length: 2 }).map((_, index) => (
          <TraitSlot
            key={index}
            trait={hero.traits[index] || null}
            onEdit={() => onEditTrait(index)}
            onDelete={hero.traits[index] ? () => handleDeleteTrait(index) : undefined}
          />
        ))}

        {/* Row 3, Columns 2-4: Stats (Base Attack & Precision) */}
        <div className="col-span-3 flex items-center justify-start gap-8 pl-2">
          {/* Base Attack */}
          <div>
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
          </div>

          {/* Precision */}
          <div>
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
                className="w-16 h-8 px-2 py-0"
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
      </div>

      {/* Footer: EXP Bar */}
      <div
        className={cn(
          "w-full py-1.5 flex items-center justify-center gap-3 cursor-pointer transition-colors hover:brightness-110 mt-auto",
          getLevelColor(hero.level)
        )}
        onClick={levelEdit.startEdit}
      >
        {levelEdit.isEditing ? (
          <Input
            value={levelEdit.inputValue}
            onChange={(e) => levelEdit.setInputValue(e.target.value)}
            onBlur={levelEdit.saveEdit}
            onKeyDown={levelEdit.handleKeyDown}
            autoFocus
            type="number"
            min="0"
            className="w-24 h-8 px-2 py-0 text-sm bg-white/90 text-black border-none text-center font-bold"
          />
        ) : (
          <>
            <span className="uppercase text-[10px] font-bold tracking-widest text-white/90">EXP</span>
            <span className="font-rajdhani font-bold text-2xl text-white leading-none">{hero.level}</span>
            <span className="text-[10px] font-medium text-white/90 uppercase tracking-wide opacity-90">- {getLevelCategory(hero.level)}</span>
            <PencilSimple className="w-3.5 h-3.5 text-white/80" />
          </>
        )}
      </div>
    </Card>
  )
}
