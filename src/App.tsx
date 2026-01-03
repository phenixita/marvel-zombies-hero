import { AttackDialog } from '@/components/AttackDialog'
import { DevourDialog } from '@/components/DevourDialog'
import { GameInitDialog } from '@/components/GameInitDialog'
import { Header } from '@/components/Header'
import { HeroGrid } from '@/components/HeroGrid'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { PhaseConfirmationDialog } from '@/components/PhaseConfirmationDialog'
import { PowerEditDialog } from '@/components/PowerEditDialog'
import { StartTurnDialog } from '@/components/StartTurnDialog'
import { TurnTrackerSidebar } from '@/components/TurnTrackerSidebar'
import { usePersistentState } from '@/hooks/usePersistentState'
import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { GameState } from "./lib/GameState"
import { Hero } from "./lib/Hero"
import { Power } from "./lib/Power"
import { Round } from "./lib/Round"
import { Turn } from "./lib/Turn"

function App() {
  const [gameState, setGameState] = usePersistentState<GameState>(
    'marvel-zombies-game',
    {
      heroes: [],
      isAutomaticMode: false,
    }
  )

  const [editingPower, setEditingPower] = useState<{
    heroId: string
    powerIndex: number
    power: Power | null
  } | null>(null)

  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showInitDialog, setShowInitDialog] = useState(false)
  const [showStartTurnDialog, setShowStartTurnDialog] = useState(false)
  const [attackingHeroId, setAttackingHeroId] = useState<string | null>(null)
  const [devouringHeroId, setDevouringHeroId] = useState<string | null>(null)
  const [phaseConfirmation, setPhaseConfirmation] = useState<{
    open: boolean
    phase: 'START' | 'END' | 'GAME_OVER'
    message: string
    details?: string[]
    onConfirm: () => void
  } | null>(null)

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
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault()
        setShowStartTurnDialog(true)
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
      level: 0,
      baseAttackValue: 2,
      precision: 3,
      powers: [],
      availableActions: 3,
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
      ...current,
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
      ...current,
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

  const handleToggleAutomaticMode = () => {
    setGameState((current) => ({
      ...current,
      isAutomaticMode: !current?.isAutomaticMode,
    }))
  }

  const handleStartTurn = (heroIndex: number) => {
    const hero = gameState?.heroes[heroIndex]
    if (!hero) return

    const now = Date.now()
    const newTurn: Turn = {
      heroId: hero.id,
      startTime: now,
      phase: 'START',
      actionsTaken: 0,
    }

    setGameState((current) => {
      const currentRound = current?.currentRound
      
      // Reset available actions for the active hero
      const updatedHeroes = current?.heroes.map(h => 
        h.id === hero.id ? { ...h, availableActions: 3 } : h
      ) || []

      // Check if we need to start a new round
      const shouldStartNewRound = !currentRound || 
        currentRound.turns.length >= (current?.heroes.length || 0)

      if (shouldStartNewRound) {
        // Start a new round
        const newRound: Round = {
          number: (currentRound?.number || 0) + 1,
          turns: [newTurn],
          startTime: now,
        }
        
        // Close previous round if it exists
        if (currentRound) {
          currentRound.endTime = now
        }

        return {
          ...current,
          heroes: updatedHeroes,
          currentRound: newRound,
          currentTurn: newTurn,
        }
      } else {
        // Add turn to existing round
        const updatedRound: Round = {
          ...currentRound,
          turns: [...currentRound.turns, newTurn],
        }

        return {
          ...current,
          heroes: updatedHeroes,
          currentRound: updatedRound,
          currentTurn: newTurn,
        }
      }
    })

    setShowStartTurnDialog(false)
    
    // Start the START phase (increment hunger)
    startTurnPhase(hero)
  }

  const startTurnPhase = (hero: Hero) => {
    // Increment hunger (max 4)
    const newHunger = Math.min(4, hero.hunger + 1)
    const hungerIncreased = newHunger !== hero.hunger

    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map(h => 
        h.id === hero.id ? { ...h, hunger: newHunger } : h
      ) || [],
    }))

    // Show confirmation dialog
    setPhaseConfirmation({
      open: true,
      phase: 'START',
      message: hungerIncreased 
        ? `Hunger increased to ${newHunger}` 
        : `Hunger already at maximum (${newHunger})`,
      details: [
        'Turn phase: START',
        hungerIncreased ? `Hunger: ${hero.hunger} → ${newHunger}` : `Hunger: ${newHunger} (max)`,
      ],
      onConfirm: () => {
        setPhaseConfirmation(null)
        enterActionsPhase()
      },
    })
  }

  const enterActionsPhase = () => {
    setGameState((current) => ({
      ...current,
      currentTurn: current?.currentTurn ? {
        ...current.currentTurn,
        phase: 'ACTIONS',
      } : undefined,
    }))
    
    toast.success('Actions phase - Perform your 3 actions')
  }

  const handleEndTurn = () => {
    const activeTurn = gameState?.currentTurn
    if (!activeTurn) return

    const hero = gameState?.heroes.find(h => h.id === activeTurn.heroId)
    if (!hero) return

    endTurnPhase(hero)
  }

  const endTurnPhase = (hero: Hero) => {
    const details: string[] = ['Turn phase: END']
    let newHealth = hero.health
    let isGameOver = false

    // Check if Ravenous (hunger = 4)
    if (hero.hunger >= 4) {
      newHealth = Math.max(0, hero.health - 1)
      details.push(`Ravenous! Health reduced: ${hero.health} → ${newHealth}`)
      
      // Check for death
      if (newHealth === 0) {
        isGameOver = true
        details.push(`${hero.name} has died!`)
      }
    } else {
      details.push('Hunger < 4, no health penalty')
    }

    // Update hero health
    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map(h => 
        h.id === hero.id ? { ...h, health: newHealth } : h
      ) || [],
      currentTurn: current?.currentTurn ? {
        ...current.currentTurn,
        phase: 'END',
      } : undefined,
      gameOver: isGameOver,
    }))

    // Show confirmation dialog
    if (isGameOver) {
      setPhaseConfirmation({
        open: true,
        phase: 'GAME_OVER',
        message: `${hero.name} has reached 0 health and died!`,
        details: [
          'The game is over.',
          'Start a new game to continue playing.',
        ],
        onConfirm: () => {
          setPhaseConfirmation(null)
          setShowInitDialog(true)
        },
      })
    } else {
      setPhaseConfirmation({
        open: true,
        phase: 'END',
        message: 'Turn complete',
        details,
        onConfirm: () => {
          setPhaseConfirmation(null)
          // Set turn to IDLE
          setGameState((current) => ({
            ...current,
            currentTurn: undefined,
          }))
          toast.success(`${hero.name}'s turn ended`)
        },
      })
    }
  }

  const handleAttack = (heroId: string) => {
    setAttackingHeroId(heroId)
  }

  const handleAttackComplete = (heroId: string, hungerGained: number, attackSuccesses: number) => {
    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map(h => {
        if (h.id === heroId) {
          const newHunger = Math.min(4, h.hunger + hungerGained)
          const newLevel = h.level + attackSuccesses
          const newActions = Math.max(0, h.availableActions - 1)
          return { ...h, hunger: newHunger, level: newLevel, availableActions: newActions }
        }
        return h
      }) || [],
    }))
    setAttackingHeroId(null)
  }

  const handleDevour = (heroId: string) => {
    setDevouringHeroId(heroId)
  }

  const handleDevourComplete = (heroId: string, hungerGained: number, wasSuccessful: boolean) => {
    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map(h => {
        if (h.id === heroId) {
          const newHunger = wasSuccessful ? 0 : Math.min(4, h.hunger + hungerGained)
          const newActions = Math.max(0, h.availableActions - 1)
          return { ...h, hunger: newHunger, availableActions: newActions }
        }
        return h
      }) || [],
    }))
    setDevouringHeroId(null)
  }


  if (!gameState?.heroes || gameState.heroes.length === 0) {
    return (
      <>
        <GameInitDialog
          onStartNew={handleStartNewGame}
          onContinue={handleContinueGame}
          onClose={() => {}}
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
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <Header
          onShowKeyboardHelp={() => setShowKeyboardHelp(true)}
          onNewGame={() => setShowInitDialog(true)}
          onStartTurn={() => setShowStartTurnDialog(true)}
          isAutomaticMode={gameState?.isAutomaticMode || false}
          onToggleAutomaticMode={handleToggleAutomaticMode}
        />
      </header>

      <div className="flex flex-1">
        <TurnTrackerSidebar gameState={gameState} onUpdateHero={handleUpdateHero} />

        <main className="flex-1 container mx-auto px-4 py-8">
          <HeroGrid
            heroes={gameState?.heroes || []}
            onUpdateHero={handleUpdateHero}
            onEditPower={handleEditPower}
            activeTurnHeroId={gameState?.currentTurn?.heroId}
            currentTurnPhase={gameState?.currentTurn?.phase}
            onEndTurn={handleEndTurn}
            onAttack={handleAttack}
            onDevour={handleDevour}
          />
        </main>
      </div>

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
          onClose={() => setShowInitDialog(false)}
        />
      )}

      <StartTurnDialog
        open={showStartTurnDialog}
        heroes={gameState?.heroes || []}
        onSelectHero={handleStartTurn}
        onClose={() => setShowStartTurnDialog(false)}
      />

      <KeyboardShortcuts open={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />

      {phaseConfirmation && (
        <PhaseConfirmationDialog
          open={phaseConfirmation.open}
          phase={phaseConfirmation.phase}
          hero={gameState?.heroes.find(h => h.id === gameState?.currentTurn?.heroId) || null}
          message={phaseConfirmation.message}
          details={phaseConfirmation.details}
          isAutomaticMode={gameState?.isAutomaticMode || false}
          onConfirm={phaseConfirmation.onConfirm}
          onClose={() => setPhaseConfirmation(null)}
        />
      )}

      {attackingHeroId && (
        <AttackDialog
          open={true}
          hero={gameState?.heroes.find(h => h.id === attackingHeroId) || null}
          onComplete={handleAttackComplete}
          onClose={() => setAttackingHeroId(null)}
        />
      )}

      {devouringHeroId && (
        <DevourDialog
          open={true}
          hero={gameState?.heroes.find(h => h.id === devouringHeroId) || null}
          onComplete={handleDevourComplete}
          onClose={() => setDevouringHeroId(null)}
        />
      )}
    </div>
  )
}

export default App
