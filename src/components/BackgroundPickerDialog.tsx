import { useEffect, useRef, useState } from 'react'
import { Dices, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { resizeImage } from '@/lib/imageUtils'
import { getRandomBackgroundUrl } from '@/lib/backgroundUtils'
import { BackgroundMode } from '@/lib/UserPreferences'

interface BackgroundPickerDialogProps {
  open: boolean
  onClose: () => void
  onSave: (mode: BackgroundMode, image: string | undefined) => void
}

export function BackgroundPickerDialog({ open, onClose, onSave }: BackgroundPickerDialogProps) {
  const [tab, setTab] = useState('device')
  const [devicePreview, setDevicePreview] = useState<string | undefined>()
  const [randomPreview, setRandomPreview] = useState<string | undefined>()

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setTab('device')
      setDevicePreview(undefined)
      setRandomPreview(undefined)
    }
  }, [open])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string
      setDevicePreview(await resizeImage(raw, 1600, 0.7))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleGenerateRandom = () => {
    setRandomPreview(getRandomBackgroundUrl())
  }

  const handleSave = () => {
    if (tab === 'device' && devicePreview) {
      onSave('device', devicePreview)
    } else if (tab === 'random' && randomPreview) {
      onSave('random', randomPreview)
    }
  }

  const canSave = (tab === 'device' && !!devicePreview) || (tab === 'random' && !!randomPreview)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sfondo app</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="device" className="flex-1 gap-1.5">
              <Upload className="w-4 h-4" />
              Da questo device
            </TabsTrigger>
            <TabsTrigger value="random" className="flex-1 gap-1.5">
              <Dices className="w-4 h-4" />
              Casuale
            </TabsTrigger>
          </TabsList>

          <TabsContent value="device" className="mt-4">
            <div className="flex flex-col items-center gap-4">
              {devicePreview ? (
                <img
                  src={devicePreview}
                  alt="Anteprima sfondo"
                  className="w-full h-40 rounded-lg object-cover border border-border"
                />
              ) : (
                <div
                  className="w-full h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-accent/60 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {devicePreview ? 'Cambia immagine' : 'Scegli immagine'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="random" className="mt-4">
            <div className="flex flex-col items-center gap-4">
              {randomPreview ? (
                <img
                  src={randomPreview}
                  alt="Anteprima sfondo casuale"
                  className="w-full h-40 rounded-lg object-cover border border-border"
                />
              ) : (
                <div className="w-full h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Dices className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleGenerateRandom}>
                {randomPreview ? "Un'altra" : 'Genera'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
