import { Button } from '@/components/ui/button'
import { KeyboardIcon, Plus } from 'lucide-react'
import { Play } from '@phosphor-icons/react'

interface HeaderProps {
    onShowKeyboardHelp: () => void
    onNewGame: () => void
    onStartTurn: () => void
}

export function Header({ onShowKeyboardHelp, onNewGame, onStartTurn }: HeaderProps) {
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
                    <div className="flex items-center gap-2 border-l border-border pl-4">
                        <Button
                            variant="default"
                            onClick={onStartTurn}
                            title="Start Turn (Ctrl/Cmd+T)"
                            className="gap-2"
                        >
                            <Play className="w-4 h-4" weight="fill" />
                            Start Turn
                        </Button>
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
