import { useEffect, useState } from 'react'
import { ArrowsClockwise, Keyboard } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { HeroCard } from '@/components/HeroCard'
import { PowerEditDialog } from '@/components/PowerEditDialog'
import { GameInitDialog } from '@/components/GameInitDialog'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { Hero, Power, GameState } from '@/lib/types'
import { Toaster, toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePersistentState } from '@/hooks/usePersistentState'

function App() {
  const [gameState, setGameState] = usePersistentState<GameState>(
    'marvel-zombies-game',
    {
      heroes: [],
      initialized: false,
    }
  )
 
  const [editingPower, setEditingPower] = useState<{
    heroId: string
    powerIndex: number
    power: Power | null
  } | null>(null)

  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showInitDialog, setShowInitDialog] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setShowInitDialog(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowKeyboardHelp(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
 

  const handleStartNewGame = (heroCount: number) => {
    const newHeroes: Hero[] = Array.from({ length: heroCount }).map((_, index) => ({
      id: crypto.randomUUID(),
      name: `Hero ${index + 1}`,
      health: 5,
      hunger: 0,
      powers: [],
    }))

    setGameState({
      heroes: newHeroes,
      initialized: true,
    })

    setShowInitDialog(false)
    toast.success(`Game initialized with ${heroCount} hero${heroCount > 1 ? 'es' : ''}`)
  }

  const handleContinueGame = () => {
    setShowInitDialog(false)
  }

  const handleUpdateHero = (updatedHero: Hero) => {
    setGameState((current) => ({
      heroes: current?.heroes.map((h) => (h.id === updatedHero.id ? updatedHero : h)) || [],
      initialized: current?.initialized || false,
    }))
  }

  const handleEditPower = (heroId: string, powerIndex: number) => {
    const hero = gameState?.heroes.find((h) => h.id === heroId)
    if (!hero) return

    setEditingPower({
      heroId,
      powerIndex,
      power: hero.powers[powerIndex] || null,
    })
  }

  const handleSavePower = (power: Power) => {
    if (!editingPower) return

    setGameState((current) => ({
      heroes: current?.heroes.map((hero) => {
        if (hero.id === editingPower.heroId) {
          const newPowers = [...hero.powers]
          newPowers[editingPower.powerIndex] = power
          return { ...hero, powers: newPowers }
        }
        return hero
      }) || [],
      initialized: current?.initialized || false,
    }))

    setEditingPower(null)
    toast.success('Power saved')
  }
 

  if (!gameState?.initialized) {
    return (
      <> 
        <GameInitDialog
          hasExistingGame={false}
          onStartNew={handleStartNewGame}
          onContinue={handleContinueGame}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="font-rajdhani font-bold text-4xl uppercase tracking-tight text-accent">
              Marvel Zombies
            </h1>
            <p className="text-muted-foreground">Hero Turn Tracker</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" /> 

      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-rajdhani font-bold text-3xl uppercase tracking-tight text-accent">
              Marvel Zombies
            </h1>
            <p className="text-sm text-muted-foreground">Hero Turn Tracker</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKeyboardHelp(true)}
              title="Keyboard Shortcuts (Ctrl/Cmd+K)"
            >
              <Keyboard className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowInitDialog(true)}
              title="New Game (Ctrl/Cmd+N)"
            >
              <ArrowsClockwise className="w-5 h-5 mr-2" />
              New Game
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gameState?.heroes.map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              onUpdateHero={handleUpdateHero}
              onEditPower={(powerIndex) => handleEditPower(hero.id, powerIndex)}
            />
          ))}
        </div>
      </main>

      <PowerEditDialog
        open={editingPower !== null}
        onClose={() => setEditingPower(null)}
        power={editingPower?.power || null}
        onSave={handleSavePower}
      />

      {showInitDialog && (
        <GameInitDialog
          hasExistingGame={gameState?.initialized || false}
          onStartNew={handleStartNewGame}
          onContinue={handleContinueGame}
        />
      )}

      <KeyboardShortcuts open={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
    </div>
  )
}

export default App
