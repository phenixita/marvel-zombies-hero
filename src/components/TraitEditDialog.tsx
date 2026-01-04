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
import { Trait } from "@/lib/Trait"
import { useEffect, useState } from 'react'

interface TraitEditDialogProps {
  open: boolean
  onClose: () => void
  trait: Trait | null
  onSave: (trait: Trait) => void
}

export function TraitEditDialog({ open, onClose, trait, onSave }: TraitEditDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (trait) {
      setTitle(trait.title)
      setDescription(trait.description)
    } else {
      setTitle('')
      setDescription('')
    }
  }, [trait, open])

  const handleSave = () => {
    if (!title.trim()) return

    onSave({
      id: trait?.id || crypto.randomUUID(),
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
            {trait ? 'Edit Trait' : 'Add Trait'}
          </DialogTitle>
          <DialogDescription>
            Define the hero's special ability and its effects
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="trait-title" className="font-rajdhani uppercase text-sm">
              Trait Name
            </Label>
            <Input
              id="trait-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., TELECINESI"
              className="font-rajdhani font-semibold uppercase"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trait-description" className="font-rajdhani uppercase text-sm">
              Description
            </Label>
            <Textarea
              id="trait-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the trait's effect..."
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
            Save Trait
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
