import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Hero } from "@/lib/Hero"
import { cn } from '@/lib/utils'
import { CheckCircle, Crosshair, Skull } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

interface DevourDialogProps {
  open: boolean
  hero: Hero | null
  onComplete: (heroId: string, hungerGained: number, wasSuccessful: boolean, enemiesDevoured: number) => void
  onClose: () => void
}

type DevourStep = 'DICE_COUNT' | 'ROLL_RESULTS' | 'ENEMIES_DEVOURED' | 'COMPLETE'

export function DevourDialog({ open, hero, onComplete, onClose }: DevourDialogProps) {
  const [step, setStep] = useState<DevourStep>('DICE_COUNT')
  const [diceCount, setDiceCount] = useState('0')
  const [rollResults, setRollResults] = useState<number[]>([])
  const [enemiesDevoured, setEnemiesDevoured] = useState('')

  // Reset state when dialog opens
  useEffect(() => {
    if (open && hero) {
      const defaultDiceCount = hero.hunger + 1
      setDiceCount(defaultDiceCount.toString())
      setRollResults([])
      setEnemiesDevoured('')
      setStep('DICE_COUNT')
    }
  }, [open, hero])

  const handleDiceCountSubmit = () => {
    const dice = parseInt(diceCount)
    if (isNaN(dice) || dice < 0) return

    const randomValues = new Uint32Array(dice)
    crypto.getRandomValues(randomValues)
    const results = Array.from(randomValues).map(val => (val % 6) + 1)

    setRollResults(results)
    setStep('ROLL_RESULTS')
  }

  const handleConfirmRoll = () => {
    const successCount = rollResults.filter(r => r >= 4).length

    if (successCount > 0) {
      setStep('ENEMIES_DEVOURED')
    } else {
      handleComplete(false, 0)
    }
  }

  const handleComplete = (wasSuccessful: boolean, devouredCount?: number) => {
    if (!hero) return

    const hunger = rollResults.filter(r => r === 1).length
    const parsedDevoured = parseInt(enemiesDevoured)
    const finalDevoured = wasSuccessful
      ? (devouredCount ?? (isNaN(parsedDevoured) ? 0 : parsedDevoured))
      : 0

    setStep('COMPLETE')

    setTimeout(() => {
      onComplete(hero.id, wasSuccessful ? 0 : hunger, wasSuccessful, finalDevoured)
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent, submitFn: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitFn()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!hero) return null

  const hungerCount = rollResults.filter(r => r === 1).length
  const successCount = rollResults.filter(r => r >= 4).length
  const isValidDevourCount = enemiesDevoured !== '' &&
    !isNaN(parseInt(enemiesDevoured)) &&
    parseInt(enemiesDevoured) >= 0 &&
    parseInt(enemiesDevoured) <= successCount

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-2xl uppercase">
            Devour - {hero.name}
          </DialogTitle>
          <DialogDescription>
            {step === 'DICE_COUNT' && 'Enter the number of dice to roll'}
            {step === 'ROLL_RESULTS' && 'Review the devour results'}
            {step === 'ENEMIES_DEVOURED' && 'How many enemies were devoured?'}
            {step === 'COMPLETE' && 'Devour complete!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Dice Count */}
          {step === 'DICE_COUNT' && (
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
                  onChange={(e) => setDiceCount(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleDiceCountSubmit)}
                  autoFocus
                  className="text-lg font-rajdhani font-bold text-center"
                />
              </div>

              <Button
                onClick={handleDiceCountSubmit}
                className="w-full font-rajdhani font-bold uppercase"
                disabled={!diceCount || parseInt(diceCount) < 0}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Roll Results */}
          {step === 'ROLL_RESULTS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto p-1">
                {rollResults.map((result, index) => {
                    const isHunger = result === 1
                    const isSuccess = result >= 4

                    return (
                        <div 
                            key={index}
                            className={cn(
                                "aspect-square flex items-center justify-center rounded-md border-2 text-xl font-rajdhani font-bold",
                                isHunger ? "border-destructive bg-destructive/10 text-destructive" : 
                                isSuccess ? "border-green-500 bg-green-500/10 text-green-500" :
                                "border-muted bg-muted/30 text-muted-foreground"
                            )}
                        >
                            {isHunger ? '⚡' : result}
                        </div>
                    )
                })}
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
                    onClick={() => setStep('DICE_COUNT')}
                    className="flex-1"
                  >
                    Re-roll
                  </Button>
                  <Button
                    onClick={handleConfirmRoll}
                    className="flex-[2] font-rajdhani font-bold uppercase"
                  >
                    Confirm Results
                  </Button>
              </div>
            </div>
          )}

          {/* Step 3: Enemies Devoured */}
          {step === 'ENEMIES_DEVOURED' && (
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
                  onChange={(e) => setEnemiesDevoured(e.target.value)}
                  onKeyDown={(e) => isValidDevourCount && handleKeyDown(e, () => handleComplete(true))}
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
                  onClick={() => setStep('ROLL_RESULTS')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => handleComplete(true)}
                  disabled={!isValidDevourCount}
                  className="flex-[2] font-rajdhani font-bold uppercase"
                >
                  Finish Devour
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
