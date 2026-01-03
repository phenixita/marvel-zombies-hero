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
import { useEffect, useState } from 'react'

interface DevourDialogProps {
  open: boolean
  hero: Hero | null
  onComplete: (heroId: string, hungerGained: number, wasSuccessful: boolean) => void
  onClose: () => void
}

type DevourStep = 'DICE_COUNT' | 'SUCCESS_CONFIRMATION' | 'HUNGER_RESULTS' | 'COMPLETE'

export function DevourDialog({ open, hero, onComplete, onClose }: DevourDialogProps) {
  const [step, setStep] = useState<DevourStep>('DICE_COUNT')
  const [diceCount, setDiceCount] = useState('')
  const [wasSuccessful, setWasSuccessful] = useState<boolean | null>(null)
  const [hungerResults, setHungerResults] = useState('')

  // Reset state when dialog opens
  useEffect(() => {
    if (open && hero) {
      const defaultDiceCount = hero.hunger + 1
      setDiceCount(defaultDiceCount.toString())
      setWasSuccessful(null)
      setHungerResults('')
      setStep('DICE_COUNT')
    }
  }, [open, hero])

  const handleDiceCountSubmit = () => {
    const dice = parseInt(diceCount)
    if (isNaN(dice) || dice < 0) return
    
    setTimeout(() => setStep('SUCCESS_CONFIRMATION'), 150)
  }

  const handleSuccessConfirmation = (success: boolean) => {
    setWasSuccessful(success)
    
    if (success) {
      // If successful, skip hunger results and go directly to complete
      setStep('COMPLETE')
      setTimeout(() => {
        if (hero) {
          onComplete(hero.id, 0, true) // 0 hunger gained when successful
        }
      }, 150)
    } else {
      // If failed, ask for hunger results
      setTimeout(() => setStep('HUNGER_RESULTS'), 150)
    }
  }

  const handleHungerResultsSubmit = () => {
    const hunger = parseInt(hungerResults)
    const dice = parseInt(diceCount)
    
    // Validate: hunger results cannot exceed dice count
    if (isNaN(hunger) || hunger < 0 || hunger > dice) {
      return
    }
    
    setStep('COMPLETE')
    
    // Complete the devour (failed)
    setTimeout(() => {
      if (hero) {
        onComplete(hero.id, hunger, false)
      }
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

  const totalDice = parseInt(diceCount) || 0
  const hungerCount = parseInt(hungerResults) || 0

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-2xl uppercase">
            Devour - {hero.name}
          </DialogTitle>
          <DialogDescription>
            {step === 'DICE_COUNT' && 'Enter the number of dice to roll'}
            {step === 'SUCCESS_CONFIRMATION' && 'Was the devour successful?'}
            {step === 'HUNGER_RESULTS' && 'How many hunger symbols (⚡) appeared?'}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Attack:</span>
                  <span className="font-rajdhani font-bold">{hero.baseAttackValue}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="text-foreground font-medium">Dice to Roll:</span>
                  <span className="font-rajdhani font-bold text-accent-11">
                    {hero.hunger + 1}
                  </span>
                </div>
              </div>

              <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                <p className="text-xs text-accent-11 font-medium">
                  💡 Devour uses Base Attack dice + Hunger dice + 1 bonus die
                </p>
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

          {/* Step 2: Success Confirmation */}
          {step === 'SUCCESS_CONFIRMATION' && (
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dice Rolled:</span>
                  <span className="font-rajdhani font-bold">{totalDice}</span>
                </div>
              </div>

              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 space-y-3">
                <h4 className="font-rajdhani font-bold text-sm uppercase tracking-wide text-destructive">
                  Target Priority Rules
                </h4>
                <ol className="text-xs space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="font-rajdhani font-bold text-destructive min-w-[16px]">1.</span>
                    <span>Superhero</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-rajdhani font-bold text-destructive min-w-[16px]">2.</span>
                    <span>Guard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-rajdhani font-bold text-destructive min-w-[16px]">3.</span>
                    <span>Soldier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-rajdhani font-bold text-destructive min-w-[16px]">4.</span>
                    <span>Specialist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-rajdhani font-bold text-destructive min-w-[16px]">5.</span>
                    <span className="font-medium">Bystander (Devour only)</span>
                  </li>
                </ol>
                <div className="bg-destructive/20 px-2 py-1.5 rounded text-xs font-medium text-center border border-destructive/30">
                  ⚠️ Only ONE target eliminated per Devour
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Was the devour successful?</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSuccessConfirmation(true)}
                    className="font-rajdhani font-bold uppercase h-12"
                    variant="default"
                  >
                    Yes (Success)
                  </Button>
                  <Button
                    onClick={() => handleSuccessConfirmation(false)}
                    className="font-rajdhani font-bold uppercase h-12"
                    variant="destructive"
                  >
                    No (Failed)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Hunger Results (only if failed) */}
          {step === 'HUNGER_RESULTS' && (
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dice Rolled:</span>
                  <span className="font-rajdhani font-bold">{totalDice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Result:</span>
                  <span className="font-rajdhani font-bold text-destructive">Failed</span>
                </div>
              </div>

              <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <p className="text-xs text-destructive font-medium">
                  ⚠️ Devour failed - You must add hunger symbols to your hunger track
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hunger Symbols (⚡)</label>
                <Input
                  type="number"
                  min="0"
                  max={totalDice}
                  value={hungerResults}
                  onChange={(e) => setHungerResults(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleHungerResultsSubmit)}
                  autoFocus
                  className="text-lg font-rajdhani font-bold text-center"
                />
                <p className="text-xs text-muted-foreground">
                  Current hunger: {hero.hunger}/4 → Will become: {Math.min(4, hero.hunger + hungerCount)}/4
                </p>
              </div>

              <Button
                onClick={handleHungerResultsSubmit}
                className="w-full font-rajdhani font-bold uppercase"
                disabled={
                  !hungerResults || 
                  parseInt(hungerResults) < 0 || 
                  parseInt(hungerResults) > totalDice
                }
              >
                Complete Devour
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
