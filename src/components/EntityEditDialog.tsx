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

interface EntityEditDialogProps {
  open: boolean
  onClose: () => void
  entity: Trait | null
  onSave: (entity: Trait) => void
  labels: {
    dialogTitle: string
    dialogDescription: string
    titleLabel: string
    titlePlaceholder: string
    descriptionLabel: string
    descriptionPlaceholder: string
    saveButton: string
  }
}

export function EntityEditDialog({ open, onClose, entity, onSave, labels }: EntityEditDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (entity) {
      setTitle(entity.title)
      setDescription(entity.description)
    } else {
      setTitle('')
      setDescription('')
    }
  }, [entity, open])

  const handleSave = () => {
    if (!title.trim()) return

    onSave({
      id: entity?.id || crypto.randomUUID(),
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
            {labels.dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {labels.dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="entity-title" className="font-rajdhani uppercase text-sm">
              {labels.titleLabel}
            </Label>
            <Input
              id="entity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={labels.titlePlaceholder}
              className="font-rajdhani font-semibold uppercase"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entity-description" className="font-rajdhani uppercase text-sm">
              {labels.descriptionLabel}
            </Label>
            <Textarea
              id="entity-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={labels.descriptionPlaceholder}
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
            {labels.saveButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
