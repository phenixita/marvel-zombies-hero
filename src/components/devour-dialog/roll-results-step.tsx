import { Button } from '@/components/ui/button'
import { CheckCircle, Crosshair, Skull } from '@phosphor-icons/react'
import { RollCell } from './roll-cell'

interface RollResultsStepProps {
  rollResults: number[]
  onReroll: () => void
  onConfirm: () => void
}

export function RollResultsStep({
  rollResults,
  onReroll,
  onConfirm
}: RollResultsStepProps) {
  const hungerCount = rollResults.filter(r => r === 1).length
  const successCount = rollResults.filter(r => r >= 4).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto p-1">
        {rollResults.map((result, index) => (
          <RollCell key={index} result={result} />
        ))}
      </div>

      <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skull className="text-destructive" weight="fill" />
            <span className="text-muted-foreground">Hunger Gained:</span>
          </div>
          <span className="font-rajdhani font-bold text-destructive text-lg">{hungerCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="text-foreground" />
            <span className="text-muted-foreground">Total Dice:</span>
          </div>
          <span className="font-rajdhani font-bold text-lg">{rollResults.length}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" weight="fill" />
            <span className="text-foreground font-medium">Valid Successes:</span>
          </div>
          <span className="font-rajdhani font-bold text-green-500 text-xl">{successCount}</span>
        </div>
        <div className="text-xs text-muted-foreground text-center pt-1">
          (Success on 4+)
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onReroll}
          className="flex-1"
        >
          Re-roll
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-[2] font-rajdhani font-bold uppercase"
        >
          Confirm Results
        </Button>
      </div>
    </div>
  )
}
