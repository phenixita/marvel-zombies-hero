import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GameHistoryEntry } from '@/lib/GameState'
import { useState } from 'react'

interface GameInitDialogProps {
  onStartNew: (heroCount: number) => void
  onContinue: () => void
  archivedGames?: GameHistoryEntry[]
  onRestoreArchived?: (sessionId: string) => void
  onClose?: () => void
}

export function GameInitDialog({
  onStartNew,
  onContinue,
  archivedGames = [],
  onRestoreArchived,
  onClose,
}: GameInitDialogProps) {

  const INIT_DEFAULT_HERO_COUNT = 2
  const [showHeroCountDialog, setShowHeroCountDialog] = useState(true)
  const [heroCount, setHeroCount] = useState(INIT_DEFAULT_HERO_COUNT)


  const handleConfirmReset = () => {
    setShowHeroCountDialog(true)
  }

  const handleRestore = (sessionId: string) => {
    setShowHeroCountDialog(false)
    onRestoreArchived?.(sessionId)
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
            {archivedGames.length > 0 && (
              <div className="space-y-2">
                <Label className="font-rajdhani uppercase text-sm">
                  Restore Archived Game
                </Label>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {archivedGames.map((entry) => (
                    <Button
                      key={entry.sessionId}
                      variant="outline"
                      className="w-full justify-between text-left"
                      onClick={() => handleRestore(entry.sessionId)}
                    >
                      <span className="truncate">
                        {entry.state.heroes.length} hero{entry.state.heroes.length !== 1 ? 'es' : ''}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {entry.archivedAt > 0 ? new Date(entry.archivedAt).toLocaleString() : 'Archived session'}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

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
            <Button
              variant="secondary"
              onClick={() => {
                setShowHeroCountDialog(false)
                onContinue()
              }}
            >
              Continue
            </Button>
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
