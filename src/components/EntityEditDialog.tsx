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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea'
import { Trait } from "@/lib/Trait"
import { useEffect, useState } from 'react'

interface EntityEditDialogProps {
  open: boolean
  onClose: () => void
  entity: Trait | null
  onSave: (entity: Trait) => void
  templates?: { title: string, description: string }[]
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

export function EntityEditDialog({ open, onClose, entity, onSave, templates, labels }: EntityEditDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [currentId, setCurrentId] = useState<string | null>(null)

  useEffect(() => {
    if (entity) {
      setTitle(entity.title)
      setDescription(entity.description)
      setCurrentId(entity.id)
    } else {
      setTitle('')
      setDescription('')
      setCurrentId(null)
    }
  }, [entity, open])

  const handleSave = () => {
    if (!title.trim()) return

    onSave({
      id: currentId || crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
    })

    setTitle('')
    setDescription('')
    setCurrentId(null)
    onClose()
  }

  const handleTemplateSelect = (value: string) => {
    const template = templates?.find(t => t.title === value)
    if (template) {
      setTitle(template.title)
      setDescription(template.description)
    }
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
          {templates && templates.length > 0 && !entity && (
            <div className="space-y-2">
              <Label className="font-rajdhani uppercase text-sm">Select Template (Optional)</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a trait template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.title} value={template.title}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
