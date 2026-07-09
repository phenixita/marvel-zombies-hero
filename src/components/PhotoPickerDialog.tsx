import { useEffect, useRef, useState } from 'react'
import { Camera, RotateCcw, Trash2, Upload } from 'lucide-react'
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

interface PhotoPickerDialogProps {
  open: boolean
  onClose: () => void
  currentPhoto?: string
  onSave: (photo: string | undefined) => void
}

export function PhotoPickerDialog({ open, onClose, currentPhoto, onSave }: PhotoPickerDialogProps) {
  const [tab, setTab] = useState('upload')
  const [preview, setPreview] = useState<string | undefined>()
  const [snapped, setSnapped] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [hasStream, setHasStream] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setHasStream(false)
  }

  const startCamera = async () => {
    setCameraError(null)
    setSnapped(false)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = s
      setHasStream(true)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch {
      setCameraError('Impossibile accedere alla fotocamera. Verifica i permessi del browser.')
    }
  }

  useEffect(() => {
    if (!open) {
      stopCamera()
      setPreview(undefined)
      setTab('upload')
      setSnapped(false)
      setCameraError(null)
    }
  }, [open])

  useEffect(() => () => stopCamera(), [])

  const handleTabChange = (newTab: string) => {
    setTab(newTab)
    setPreview(undefined)
    if (newTab === 'camera') {
      setSnapped(false)
      startCamera()
    } else {
      stopCamera()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string
      setPreview(await resizeImage(raw))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSnap = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    stopCamera()
    setSnapped(true)
    setPreview(await resizeImage(dataUrl))
  }

  const handleRetake = () => {
    setPreview(undefined)
    setSnapped(false)
    startCamera()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Foto personaggio</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={handleTabChange} className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1 gap-1.5">
              <Upload className="w-4 h-4" />
              Carica
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex-1 gap-1.5">
              <Camera className="w-4 h-4" />
              Fotocamera
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-center gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Anteprima"
                  className="w-40 h-40 rounded-full object-cover border-2 border-accent"
                />
              ) : (
                <div
                  className="w-40 h-40 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-accent/60 transition-colors"
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
                {preview ? 'Cambia immagine' : 'Scegli immagine'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="camera" className="mt-4">
            <div className="flex flex-col items-center gap-4">
              {cameraError ? (
                <p className="text-destructive text-sm text-center px-2">{cameraError}</p>
              ) : preview ? (
                <img
                  src={preview}
                  alt="Foto scattata"
                  className="w-full max-h-60 rounded-lg object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-h-60 rounded-lg object-cover bg-black"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />

              {snapped ? (
                <Button variant="outline" size="sm" onClick={handleRetake}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Riprova
                </Button>
              ) : !cameraError ? (
                <Button size="sm" onClick={handleSnap} disabled={!hasStream}>
                  <Camera className="w-4 h-4 mr-1" />
                  Scatta
                </Button>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          {currentPhoto && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onSave(undefined)}
              className="sm:mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Rimuovi foto
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={() => onSave(preview)} disabled={!preview}>
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
