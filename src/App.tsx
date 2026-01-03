import { useEffect, useState } from 'react'
import { PowerEditDialog } from '@/components/PowerEditDialog'
import { GameInitDialog } from '@/components/GameInitDialog'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { Header } from '@/components/Header'
import { HeroGrid } from '@/components/HeroGrid'
import { Hero, Power, GameState } from '@/lib/types'
import { Toaster, toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePersistentState } from '@/hooks/usePersistentState'

function App() {
  const [gameState, setGameState] = usePersistentState<GameState>(
    'marvel-zombies-game',
    {
      heroes: []
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
    }))

    setEditingPower(null)
    toast.success('Power saved')
  }


  if (!gameState?.heroes || gameState.heroes.length === 0) {
    return (
      <>
        <GameInitDialog
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
        <Header
          onShowKeyboardHelp={() => setShowKeyboardHelp(true)}
          onNewGame={() => setShowInitDialog(true)}
        />
      </header>

      <main className="container mx-auto px-4 py-8">
        <HeroGrid
          heroes={gameState?.heroes || []}
          onUpdateHero={handleUpdateHero}
          onEditPower={handleEditPower}
        />
      </main>

      <PowerEditDialog
        open={editingPower !== null}
        onClose={() => setEditingPower(null)}
        power={editingPower?.power || null}
        onSave={handleSavePower}
      />

      {showInitDialog && (
        <GameInitDialog
          onStartNew={handleStartNewGame}
          onContinue={handleContinueGame}
        />
      )}

      <KeyboardShortcuts open={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
    </div>
  )
}

export default App
