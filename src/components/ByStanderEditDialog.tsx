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
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Bystander } from '@/lib/Bystander'
import {
  BYSTANDER_TEMPLATES,
  getBystanderTemplateById,
  toPresetBystander,
} from '@/lib/bystanderTemplates'
import { useEffect, useMemo, useState } from 'react'

type Mode = 'preset' | 'custom'

interface ByStanderEditDialogProps {
  open: boolean
  onClose: () => void
  byStander: Bystander | null
  onSave: (byStander: Bystander) => void
}

export function ByStanderEditDialog({ open, onClose, byStander, onSave }: ByStanderEditDialogProps) {
  const sortedTemplates = useMemo(
    () => [...BYSTANDER_TEMPLATES].sort((a, b) => a.title.localeCompare(b.title)),
    []
  )

  const [mode, setMode] = useState<Mode>('preset')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(sortedTemplates[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) return

    if (byStander) {
      if (byStander.source === 'preset') {
        const matchingTemplate =
          getBystanderTemplateById(byStander.templateId) ??
          sortedTemplates.find((template) => template.title === byStander.title)

        setMode('preset')
        setSelectedTemplateId(matchingTemplate?.id ?? sortedTemplates[0]?.id ?? '')
        setTitle('')
        setDescription('')
      } else {
        setMode('custom')
        setSelectedTemplateId(sortedTemplates[0]?.id ?? '')
        setTitle(byStander.title)
        setDescription(byStander.description)
      }
      return
    }

    setMode('preset')
    setSelectedTemplateId(sortedTemplates[0]?.id ?? '')
    setTitle('')
    setDescription('')
  }, [byStander, open, sortedTemplates])

  const selectedTemplate = useMemo(
    () => sortedTemplates.find((template) => template.id === selectedTemplateId) ?? sortedTemplates[0],
    [selectedTemplateId, sortedTemplates]
  )

  const isEditingPreset = byStander?.source === 'preset'

  const handleSave = () => {
    if (mode === 'preset') {
      if (!selectedTemplate) return

      const presetBystander = toPresetBystander(selectedTemplate)
      onSave(
        byStander
          ? {
              ...presetBystander,
              id: byStander.id,
            }
          : presetBystander
      )
      onClose()
      return
    }

    if (!title.trim()) return

    onSave({
      id: byStander?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      source: 'custom',
    })
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
            {byStander ? 'Edit Bystander' : 'Add Bystander'}
          </DialogTitle>
          <DialogDescription>
            Define the bystander and the special ability gained
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isEditingPreset && (
            <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
              <TabsList className="w-full">
                <TabsTrigger value="preset" className="flex-1 font-rajdhani uppercase">From List</TabsTrigger>
                <TabsTrigger value="custom" className="flex-1 font-rajdhani uppercase">Custom</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {mode === 'preset' ? (
            <>
              <div className="space-y-2">
                <Label className="font-rajdhani uppercase text-sm">Bystander Name</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bystander..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-rajdhani uppercase text-sm">Ability Gained</Label>
                <div className="rounded-md border bg-muted/40 p-3 text-sm leading-relaxed text-foreground/90">
                  {selectedTemplate?.description ?? 'No ability available for this bystander.'}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="bystander-title" className="font-rajdhani uppercase text-sm">
                  Bystander Name
                </Label>
                <Input
                  id="bystander-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., MARY JANE"
                  className="font-rajdhani font-semibold uppercase"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bystander-description" className="font-rajdhani uppercase text-sm">
                  Ability Gained
                </Label>
                <Textarea
                  id="bystander-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe the ability gained by devouring this bystander..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={mode === 'custom' && !title.trim()}>
            Save Bystander
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
