import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { KeyboardIcon, Play, Plus } from 'lucide-react'

interface HeaderProps {
    onShowKeyboardHelp: () => void
    onNewGame: () => void
    onStartTurn: () => void
    isAutomaticMode: boolean
    onToggleAutomaticMode: () => void
}

export function Header({ onShowKeyboardHelp, onNewGame, onStartTurn, isAutomaticMode, onToggleAutomaticMode }: HeaderProps) {
    return (
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
                </div>
            </div> 
    )
}
