import { SyncStatusIndicator } from '@/components/SyncStatusIndicator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { UserProfilePanel } from '@/components/UserProfilePanel'
import { useAuth } from '@/hooks/useAuth'
import { SyncStatus } from '@/hooks/useCloudSync'
import { UserPreferences } from '@/lib/UserPreferences'
import { UserStats } from '@/lib/UserStats'
import { KeyboardIcon, LogIn, Play, Plus } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
    onShowKeyboardHelp: () => void
    onNewGame: () => void
    onStartTurn: () => void
    isAutomaticMode: boolean
    onToggleAutomaticMode: () => void
    profileOpen?: boolean
    onProfileOpenChange?: (open: boolean) => void
    preferences: UserPreferences
    onUpdatePreferences: (patch: Partial<UserPreferences>) => void
    syncStatus?: SyncStatus
    stats?: UserStats
}

function AuthSection({ onOpenProfile }: { onOpenProfile: () => void }) {
    const { user, loading, signIn } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
            </div>
        )
    }

    if (user) {
        const initials = (user.displayName ?? user.email ?? '?')
            .split(' ')
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()

        return (
            <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/50 transition-colors cursor-pointer"
                title="Open profile (Ctrl/Cmd+L)"
            >
                <Avatar className="h-8 w-8">
                    <AvatarImage
                        src={user.photoURL ?? undefined}
                        alt={user.displayName ?? 'User avatar'}
                    />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-rajdhani font-bold uppercase tracking-wide truncate max-w-[120px]">
                    {user.displayName ?? user.email ?? 'Player'}
                </span>
            </button>
        )
    }

    return (
        <Button
            variant="ghost"
            onClick={signIn}
            title="Sign in with Google (Ctrl/Cmd+L)"
            className="gap-2"
        >
            <LogIn className="w-4 h-4" />
            Sign in
        </Button>
    )
}

export function Header({ onShowKeyboardHelp, onNewGame, onStartTurn, isAutomaticMode, onToggleAutomaticMode, profileOpen, onProfileOpenChange, preferences, onUpdatePreferences, syncStatus, stats }: HeaderProps) {
    const [localProfileOpen, setLocalProfileOpen] = useState(false)
    const isProfileOpen = profileOpen ?? localProfileOpen
    const setProfileOpen = onProfileOpenChange ?? setLocalProfileOpen

    return (
        <>
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div>
                    <h1 className="font-rajdhani font-bold text-3xl uppercase tracking-tight text-accent">
                        Marvel Zombies
                    </h1>
                    <p className="text-sm text-muted-foreground">Hero Turn Tracker</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Action Panel */}
                    <div className="flex items-center gap-4 border-l border-border pl-4">
                        <Button
                            variant="default"
                            onClick={onStartTurn}
                            title="Start Turn (Ctrl/Cmd+T)"
                            className="gap-2"
                        >
                            <Play className="w-4 h-4" />
                            Start Turn
                        </Button>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="auto-mode"
                                checked={isAutomaticMode}
                                onCheckedChange={onToggleAutomaticMode}
                            />
                            <Label htmlFor="auto-mode" className="text-xs cursor-pointer uppercase tracking-wider">
                                Auto
                            </Label>
                        </div>
                    </div>

                    {/* Utility Buttons */}
                    <div className="flex items-center gap-2 border-l border-border pl-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onShowKeyboardHelp}
                            title="Keyboard Shortcuts (Ctrl/Cmd+K)"
                        >
                            <KeyboardIcon className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onNewGame}
                            title="New Game (Ctrl/Cmd+N)"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Game
                        </Button>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-2 border-l border-border pl-4">
                        {syncStatus && <SyncStatusIndicator status={syncStatus} />}
                        <AuthSection onOpenProfile={() => setProfileOpen(true)} />
                    </div>
                </div>
            </div>

            <UserProfilePanel
                open={isProfileOpen}
                onClose={() => setProfileOpen(false)}
                preferences={preferences}
                onUpdatePreferences={onUpdatePreferences}
                stats={stats}
            />
        </>
    )
}
