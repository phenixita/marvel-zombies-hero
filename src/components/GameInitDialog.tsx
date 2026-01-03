import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface GameInitDialogProps {
  onStartNew: (heroCount: number) => void
  onContinue: () => void
  onClose?: () => void
}

export function GameInitDialog({   onStartNew, onContinue, onClose }: GameInitDialogProps) {
 
  const [showHeroCountDialog, setShowHeroCountDialog] = useState(true)
  const [heroCount, setHeroCount] = useState(4)


  const handleConfirmReset = () => {
    setShowHeroCountDialog(true)
  }

  const handleCreateGame = () => {
    const count = Math.max(1, Math.min(6, heroCount))
    setShowHeroCountDialog(false)
    onStartNew(count)
  }

  return (
    <>

      <Dialog open={showHeroCountDialog} onOpenChange={(open) => {
        setShowHeroCountDialog(open)
        if (!open) onClose?.()
      }} >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-rajdhani text-2xl uppercase">
              Initialize Game
            </DialogTitle>
            <DialogDescription>
              How many heroes are you tracking in this session?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hero-count" className="font-rajdhani uppercase text-sm">
                Number of Heroes (1-6)
              </Label>
              <Input
                id="hero-count"
                type="number"
                min={1}
                max={6}
                value={heroCount}
                onChange={(e) => setHeroCount(parseInt(e.target.value) || 1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateGame()
                }}
                className="text-center text-2xl font-bold"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setShowHeroCountDialog(false)
              onClose?.()
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateGame}>
              Start Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
