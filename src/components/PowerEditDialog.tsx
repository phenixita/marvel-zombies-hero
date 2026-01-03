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
import { Textarea } from '@/components/ui/textarea'
import { Power } from "@/lib/Power"
import { useEffect, useState } from 'react'

interface PowerEditDialogProps {
  open: boolean
  onClose: () => void
  power: Power | null
  onSave: (power: Power) => void
}

export function PowerEditDialog({ open, onClose, power, onSave }: PowerEditDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (power) {
      setTitle(power.title)
      setDescription(power.description)
    } else {
      setTitle('')
      setDescription('')
    }
  }, [power, open])

  const handleSave = () => {
    if (!title.trim()) return

    onSave({
      id: power?.id || crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
    })

    setTitle('')
    setDescription('')
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-2xl uppercase">
            {power ? 'Edit Power' : 'Add Power'}
          </DialogTitle>
          <DialogDescription>
            Define the hero's special ability and its effects
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="power-title" className="font-rajdhani uppercase text-sm">
              Power Name
            </Label>
            <Input
              id="power-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., TELECINESI"
              className="font-rajdhani font-semibold uppercase"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="power-description" className="font-rajdhani uppercase text-sm">
              Description
            </Label>
            <Textarea
              id="power-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the power's effect..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Power
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
