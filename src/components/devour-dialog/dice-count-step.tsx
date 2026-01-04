import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Hero } from "@/lib/Hero"

interface DiceCountStepProps {
  hero: Hero
  diceCount: string
  onDiceCountChange: (value: string) => void
  onSubmit: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export function DiceCountStep({
  hero,
  diceCount,
  onDiceCountChange,
  onSubmit,
  onKeyDown
}: DiceCountStepProps) {
  return (
    <div className="space-y-3">
      <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Hunger:</span>
          <span className="font-rajdhani font-bold">{hero.hunger}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1 mt-1">
          <span className="text-foreground font-medium">Dice to Roll (Hunger + 1):</span>
          <span className="font-rajdhani font-bold text-accent-11 text-3xl">
            {hero.hunger} + 1 = {hero.hunger + 1}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Number of Dice</label>
        <Input
          type="number"
          min="0"
          value={diceCount}
          onChange={(e) => onDiceCountChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          className="text-lg font-rajdhani font-bold text-center"
        />
      </div>

      <Button
        onClick={onSubmit}
        className="w-full font-rajdhani font-bold uppercase"
        disabled={!diceCount || parseInt(diceCount) < 0}
      >
        Continue
      </Button>
    </div>
  )
}
