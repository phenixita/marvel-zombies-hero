import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Hero } from "@/lib/Hero"
import { useEffect, useState } from 'react'
import { DiceCountStep, EnemiesDevouredStep, RollResultsStep } from './devour-dialog'
import { DevourStep } from './DevourStep'

interface DevourDialogProps {
  open: boolean
  hero: Hero | null
  onComplete: (heroId: string, hungerGained: number, wasSuccessful: boolean, enemiesDevoured: number) => void
  onClose: () => void
}

export function DevourDialog({ open, hero, onComplete, onClose }: DevourDialogProps) {
  const [step, setStep] = useState<DevourStep>('DICE_COUNT')
  const [diceCount, setDiceCount] = useState('0')
  const [rollResults, setRollResults] = useState<number[]>([])
  const [enemiesDevoured, setEnemiesDevoured] = useState('')


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
          {step === 'DICE_COUNT' && (
            <DiceCountStep
              hero={hero}
              diceCount={diceCount}
              onDiceCountChange={setDiceCount}
              onSubmit={handleDiceCountSubmit}
              onKeyDown={(e) => handleKeyDown(e, handleDiceCountSubmit)}
            />
          )}

          {step === 'ROLL_RESULTS' && (
            <RollResultsStep
              rollResults={rollResults}
              onReroll={() => setStep('DICE_COUNT')}
              onConfirm={handleConfirmRoll}
            />
          )}

          {step === 'ENEMIES_DEVOURED' && (
            <EnemiesDevouredStep
              successCount={successCount}
              enemiesDevoured={enemiesDevoured}
              onChange={setEnemiesDevoured}
              onBack={() => setStep('ROLL_RESULTS')}
              onFinish={() => handleComplete(true)}
              onKeyDown={(e) => isValidDevourCount && handleKeyDown(e, () => handleComplete(true))}
              isValid={isValidDevourCount}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
