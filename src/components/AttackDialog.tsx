import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Hero } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AttackDialogProps {
  open: boolean
  hero: Hero | null
  onComplete: (heroId: string, hungerGained: number, attackSuccesses: number) => void
  onClose: () => void
}

type AttackStep = 'DICE_COUNT' | 'HUNGER_RESULTS' | 'ATTACK_SUCCESSES' | 'COMPLETE'

export function AttackDialog({ open, hero, onComplete, onClose }: AttackDialogProps) {
  const [step, setStep] = useState<AttackStep>('DICE_COUNT')
  const [diceCount, setDiceCount] = useState('')
  const [hungerResults, setHungerResults] = useState('')
  const [attackSuccesses, setAttackSuccesses] = useState('')

  // Reset state when dialog opens
  useEffect(() => {
    if (open && hero) {
      const defaultDiceCount = hero.hunger + hero.baseAttackValue
      setDiceCount(defaultDiceCount.toString())
      setHungerResults('')
      setAttackSuccesses('')
      setStep('DICE_COUNT')
    }
  }, [open, hero])

  const handleDiceCountSubmit = () => {
    const dice = parseInt(diceCount)
    if (isNaN(dice) || dice < 0) return
    
    setTimeout(() => setStep('HUNGER_RESULTS'), 150)
  }

  const handleHungerResultsSubmit = () => {
    const hunger = parseInt(hungerResults)
    const dice = parseInt(diceCount)
    
    // Validate: hunger results cannot exceed dice count
    if (isNaN(hunger) || hunger < 0 || hunger > dice) {
      return
    }
    
    setTimeout(() => setStep('ATTACK_SUCCESSES'), 150)
  }

  const handleAttackSuccessesSubmit = () => {
    const successes = parseInt(attackSuccesses)
    const dice = parseInt(diceCount)
    const hunger = parseInt(hungerResults)
    
    // Validate: attack successes cannot exceed dice count
    if (isNaN(successes) || successes < 0 || successes > dice) {
      return
    }
    
    setStep('COMPLETE')
    
    // Complete the attack
    setTimeout(() => {
      if (hero) {
        onComplete(hero.id, hunger, successes)
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
  const successCount = parseInt(attackSuccesses) || 0

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-2xl uppercase">
            Attack - {hero.name}
          </DialogTitle>
          <DialogDescription>
            {step === 'DICE_COUNT' && 'Enter the number of dice to roll'}
            {step === 'HUNGER_RESULTS' && 'How many hunger symbols (⚡) appeared?'}
            {step === 'ATTACK_SUCCESSES' && 'How many valid attack successes?'}
            {step === 'COMPLETE' && 'Attack complete!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1: Dice Count */}
          {step === 'DICE_COUNT' && (
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Attack:</span>
                  <span className="font-rajdhani font-bold">{hero.baseAttackValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hunger:</span>
                  <span className="font-rajdhani font-bold">{hero.hunger}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="text-foreground font-medium">Total Dice:</span>
                  <span className="font-rajdhani font-bold text-accent-11">
                    {hero.hunger + hero.baseAttackValue}
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

          {/* Step 2: Hunger Results */}
          {step === 'HUNGER_RESULTS' && (
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dice Rolled:</span>
                  <span className="font-rajdhani font-bold">{totalDice}</span>
                </div>
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
                Continue
              </Button>
            </div>
          )}

          {/* Step 3: Attack Successes */}
          {step === 'ATTACK_SUCCESSES' && (
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dice Rolled:</span>
                  <span className="font-rajdhani font-bold">{totalDice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hunger Symbols:</span>
                  <span className="font-rajdhani font-bold text-destructive">{hungerCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Valid Attack Successes</label>
                <Input
                  type="number"
                  min="0"
                  max={totalDice}
                  value={attackSuccesses}
                  onChange={(e) => setAttackSuccesses(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleAttackSuccessesSubmit)}
                  autoFocus
                  className="text-lg font-rajdhani font-bold text-center"
                />
                <p className="text-xs text-muted-foreground">
                  Current level: {hero.level} → Will become: {hero.level + successCount}
                </p>
              </div>

              <Button
                onClick={handleAttackSuccessesSubmit}
                className="w-full font-rajdhani font-bold uppercase"
                disabled={
                  !attackSuccesses || 
                  parseInt(attackSuccesses) < 0 || 
                  parseInt(attackSuccesses) > totalDice
                }
              >
                Complete Attack
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
