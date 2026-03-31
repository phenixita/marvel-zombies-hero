import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConflictChoice, ConflictInfo } from '@/hooks/useCloudSync'
import { Cloud, HardDrive, RotateCcw } from 'lucide-react'

interface ConflictResolutionDialogProps {
  conflict: ConflictInfo | null
  onResolve: (choice: ConflictChoice) => void
}

function formatDate(ts: number): string {
  if (!ts) return 'Unknown'
  return new Date(ts).toLocaleString()
}

export function ConflictResolutionDialog({ conflict, onResolve }: ConflictResolutionDialogProps) {
  if (!conflict) return null

  return (
    <Dialog open={true} onOpenChange={() => { /* must choose */ }}>
      <DialogContent className="sm:max-w-[480px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-2xl uppercase">
            Game State Conflict
          </DialogTitle>
          <DialogDescription>
            A saved game was found in the cloud that differs from your local game.
            Choose which version to keep.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex items-center gap-2 font-rajdhani font-bold uppercase text-sm">
              <HardDrive className="w-4 h-4" />
              Local Game
            </div>
            <p className="text-sm text-muted-foreground">
              {conflict.localState.heroes.length} hero{conflict.localState.heroes.length !== 1 ? 'es' : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              Revision: {conflict.localRevision}
            </p>
            <p className="text-xs text-muted-foreground">
              Last modified: {formatDate(conflict.localTimestamp)}
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex items-center gap-2 font-rajdhani font-bold uppercase text-sm">
              <Cloud className="w-4 h-4" />
              Cloud Game
            </div>
            <p className="text-sm text-muted-foreground">
              {conflict.cloudState.heroes.length} hero{conflict.cloudState.heroes.length !== 1 ? 'es' : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              Revision: {conflict.cloudRevision}
            </p>
            <p className="text-xs text-muted-foreground">
              Last modified: {formatDate(conflict.cloudTimestamp)}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onResolve('local')} className="gap-2">
            <HardDrive className="w-4 h-4" />
            Keep Local
          </Button>
          <Button onClick={() => onResolve('cloud')} className="gap-2">
            <Cloud className="w-4 h-4" />
            Load Cloud
          </Button>
          <Button variant="secondary" onClick={() => onResolve('fresh')} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Start Fresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
