import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EnemiesDevouredStepProps {
  successCount: number
  enemiesDevoured: string
  onChange: (value: string) => void
  onBack: () => void
  onFinish: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isValid: boolean
}

export function EnemiesDevouredStep({
  successCount,
  enemiesDevoured,
  onChange,
  onBack,
  onFinish,
  onKeyDown,
  isValid
}: EnemiesDevouredStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg text-center space-y-2">
        <div className="text-sm text-muted-foreground uppercase tracking-wider">Successes Available</div>
        <div className="text-4xl font-rajdhani font-bold text-green-500">{successCount}</div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Enemies Devoured</label>
        <Input
          type="number"
          min="0"
          max={successCount}
          placeholder="Enter amount..."
          value={enemiesDevoured}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          className="text-2xl font-rajdhani font-bold text-center h-16"
        />
        <p className="text-xs text-muted-foreground text-center">
          Cannot exceed {successCount} successes
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={onFinish}
          disabled={!isValid}
          className="flex-[2] font-rajdhani font-bold uppercase"
        >
          Finish Devour
        </Button>
      </div>
    </div>
  )
}
