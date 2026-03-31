import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { LogOut } from 'lucide-react'

interface UserProfilePanelProps {
  open: boolean
  onClose: () => void
}

export function UserProfilePanel({ open, onClose }: UserProfilePanelProps) {
  const { user, signOut } = useAuth()

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

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
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
    </Sheet>
  )
}
