import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/useAuth'
import { ThemePreference, UserPreferences } from '@/lib/UserPreferences'
import { UserStats } from '@/lib/UserStats'
import { deleteAllCloudData } from '@/lib/cloudDataService'
import { Cloud, LogOut, Zap, Trash2, Gamepad2, Users, Dice1, Monitor, Image } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BackgroundPickerDialog } from '@/components/BackgroundPickerDialog'

interface UserProfilePanelProps {
  open: boolean
  onClose: () => void
  preferences: UserPreferences
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void
  stats?: UserStats
}

function parseThemePreference(value: string): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value
  }
  return 'system'
}

export function UserProfilePanel({ open, onClose, preferences, onUpdatePreferences, stats }: UserProfilePanelProps) {
  const { user, signOut } = useAuth()
  const [deleteStep, setDeleteStep] = useState<0 | 1>(0)
  const [deleting, setDeleting] = useState(false)
  const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(false)

  if (!user) return null

  const displayName = user.displayName ?? 'Player'
  const email = user.email ?? ''
  const initials = (user.displayName ?? user.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  const handleDeleteCloudData = async () => {
    if (!user) return
    setDeleting(true)
    try {
      await deleteAllCloudData(user.uid)
      toast.success('Cloud data deleted successfully')
      setDeleteStep(0)
    } catch {
      toast.error('Failed to delete cloud data')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) { onClose(); setDeleteStep(0) } }}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="font-rajdhani text-2xl uppercase">
            Profile
          </SheetTitle>
          <SheetDescription>
            Your Google account details
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col items-center gap-4 px-4 py-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user.photoURL ?? undefined}
              alt={displayName}
            />
            <AvatarFallback className="text-xl font-rajdhani font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-1">
            <p className="font-rajdhani font-bold text-xl uppercase tracking-wide">
              {displayName}
            </p>
            {email && (
              <p className="text-sm text-muted-foreground">{email}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Statistics Section */}
        {stats && (
          <>
            <div className="px-4 py-6 space-y-4">
              <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Statistics
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border p-3">
                  <Gamepad2 className="w-5 h-5 text-muted-foreground" />
                  <span className="font-rajdhani font-bold text-2xl">{stats.gamesPlayed}</span>
                  <span className="text-xs text-muted-foreground">Games</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border p-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="font-rajdhani font-bold text-2xl">{stats.heroesCreated}</span>
                  <span className="text-xs text-muted-foreground">Heroes</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border p-3">
                  <Dice1 className="w-5 h-5 text-muted-foreground" />
                  <span className="font-rajdhani font-bold text-2xl">{stats.devourRolls}</span>
                  <span className="text-xs text-muted-foreground">Devours</span>
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        <div className="px-4 py-6 space-y-5">
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Preferences
          </h3>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="cloud-sync" className="cursor-pointer">Cloud Sync</Label>
            </div>
            <Switch
              id="cloud-sync"
              checked={preferences.cloudSyncEnabled}
              onCheckedChange={(checked) => onUpdatePreferences({ cloudSyncEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="auto-mode-default" className="cursor-pointer">Auto Mode Default</Label>
            </div>
            <Switch
              id="auto-mode-default"
              checked={preferences.defaultAutomaticMode}
              onCheckedChange={(checked) => onUpdatePreferences({ defaultAutomaticMode: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="theme-mode" className="cursor-pointer">Theme</Label>
            </div>
            <Select
              value={preferences.theme}
              onValueChange={(value) => onUpdatePreferences({ theme: parseThemePreference(value) })}
            >
              <SelectTrigger id="theme-mode" className="w-36">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-muted-foreground" />
              <Label>Sfondo</Label>
            </div>
            <div className="flex items-center gap-2">
              {preferences.backgroundMode !== 'default' && preferences.backgroundImage && (
                <img
                  src={preferences.backgroundImage}
                  alt="Sfondo attuale"
                  className="w-10 h-10 rounded object-cover border border-border"
                />
              )}
              <Button variant="outline" size="sm" onClick={() => setBackgroundPickerOpen(true)}>
                Cambia sfondo
              </Button>
              {preferences.backgroundMode !== 'default' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdatePreferences({ backgroundMode: 'default', backgroundImage: undefined })}
                >
                  Rimuovi
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="px-4 py-6 space-y-4">
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Danger Zone
          </h3>

          <AlertDialog open={deleteStep === 1} onOpenChange={(open) => { if (!open) setDeleteStep(0) }}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setDeleteStep(1)}
              >
                <Trash2 className="w-4 h-4" />
                Delete Cloud Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-rajdhani text-xl uppercase">
                  Delete all cloud data?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your cloud-saved game state, preferences, and statistics.
                  Your local game data on this device will NOT be affected.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCloudData}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting…' : 'Yes, delete everything'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Separator />

        <SheetFooter>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </SheetFooter>
      </SheetContent>

      <BackgroundPickerDialog
        open={backgroundPickerOpen}
        onClose={() => setBackgroundPickerOpen(false)}
        onSave={(mode, image) => {
          onUpdatePreferences({ backgroundMode: mode, backgroundImage: image })
          setBackgroundPickerOpen(false)
        }}
      />
    </Sheet>
  )
}
