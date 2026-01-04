import { AttackDialog } from '@/components/AttackDialog'
import { DevourDialog } from '@/components/DevourDialog'
import { GameInitDialog } from '@/components/GameInitDialog'
import { Header } from '@/components/Header'
import { HeroGrid } from '@/components/HeroGrid'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { PhaseConfirmationDialog } from '@/components/PhaseConfirmationDialog'
import { StartTurnDialog } from '@/components/StartTurnDialog'
import { TurnTrackerSidebar } from '@/components/TurnTrackerSidebar'
import { TraitEditDialog } from './components/TraitEditDialog'
import { usePersistentState } from '@/hooks/usePersistentState'
import { useGameDialogs } from '@/hooks/useGameDialogs'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { GameState } from "./lib/GameState"
import { Hero } from "./lib/Hero"
import { Trait } from "./lib/Trait"
import { createHero, clampHunger } from './lib/heroUtils'
import { 
  getAvailableHeroes, 
  createTurn, 
  createRound, 
  shouldStartNewRound,
  processStartPhase,
  processEndPhase,
  resetHeroActions,
  consumeAction
} from './lib/gameLogic'
import { Toaster, toast } from 'sonner'

function App() {
  const [gameState, setGameState] = usePersistentState<GameState>(
    'marvel-zombies-game',
    {
      heroes: [],
      isAutomaticMode: false,
    }
  )

  // Use custom hooks for dialog management
  const dialogs = useGameDialogs()

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    onNewGame: dialogs.openInitDialog,
    onShowKeyboardHelp: dialogs.openKeyboardHelp,
    onStartTurn: triggerStartTurn,
  })

  const handleStartNewGame = (heroCount: number) => {
    const newHeroes: Hero[] = Array.from({ length: heroCount }).map((_, index) => 
      createHero(`Hero ${index + 1}`)
    )

    setGameState({
      heroes: newHeroes,
    })

    dialogs.closeInitDialog()
    toast.success(`Game initialized with ${heroCount} hero${heroCount > 1 ? 'es' : ''}`)
  }

  const handleContinueGame = () => {
    dialogs.closeInitDialog()
  }

  const handleUpdateHero = (updatedHero: Hero) => {
    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map((h) => (h.id === updatedHero.id ? updatedHero : h)) || [],
    }))
  }

  const handleEditTrait = (heroId: string, traitIndex: number) => {
    const hero = gameState?.heroes.find((h) => h.id === heroId)
    if (!hero) return

    dialogs.openTraitEdit(heroId, traitIndex, hero.traits[traitIndex] || null)
  }

  const handleSaveTrait = (trait: Trait) => {
    if (!dialogs.editingTrait) return

    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map((hero) => {
        if (hero.id === dialogs.editingTrait!.heroId) {
          const newTraits = [...hero.traits]
          newTraits[dialogs.editingTrait!.traitIndex] = trait
          return { ...hero, traits: newTraits }
        }
        return hero
      }) || [],
    }))

    dialogs.closeTraitEdit()
    toast.success('Trait saved')
  }

  const handleToggleAutomaticMode = () => {
    setGameState((current) => ({
      ...current,
      isAutomaticMode: !current?.isAutomaticMode,
    }))
  }

  const triggerStartTurn = () => {
    if (gameState?.currentTurn) {
      toast.error('A turn is already in progress')
      return
    }

    const heroes = gameState?.heroes || []
    const availableHeroes = getAvailableHeroes(heroes, gameState?.currentRound)

    if (availableHeroes.length === 1) {
      handleStartTurn(availableHeroes[0].id)
    } else {
      dialogs.openStartTurnDialog()
    }
  }

  const handleStartTurn = (heroId: string) => {
    const hero = gameState?.heroes.find(h => h.id === heroId)
    if (!hero) return

    const newTurn = createTurn(heroId)

    setGameState((current) => {
      const totalHeroes = current?.heroes.length || 0
      const needsNewRound = shouldStartNewRound(current?.currentRound, totalHeroes)
      
      // Reset available actions for the active hero
      const updatedHeroes = current?.heroes.map(h => 
        h.id === hero.id ? resetHeroActions(h) : h
      ) || []

      if (needsNewRound) {
        // Start a new round
        const newRound = createRound(current?.currentRound, newTurn)

        return {
          ...current,
          heroes: updatedHeroes,
          currentRound: newRound,
          currentTurn: newTurn,
        }
      } else {
        // Add turn to existing round
        const updatedRound = {
          ...current!.currentRound!,
          turns: [...current!.currentRound!.turns, newTurn],
        }

        return {
          ...current,
          heroes: updatedHeroes,
          currentRound: updatedRound,
          currentTurn: newTurn,
        }
      }
    })

    dialogs.closeStartTurnDialog()
    
    // Start the START phase (increment hunger)
    startTurnPhase(hero)
  }

  const startTurnPhase = (hero: Hero) => {
    const { newHunger, hungerIncreased } = processStartPhase(hero)

    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map(h => 
        h.id === hero.id ? { ...h, hunger: newHunger } : h
      ) || [],
    }))

    // Show confirmation dialog
    dialogs.setPhaseConfirmation({
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
        dialogs.closePhaseConfirmation()
        enterActionsPhase()
      },
    })
  }

  const enterActionsPhase = () => {
    const activeTurn = gameState?.currentTurn
    const hero = gameState?.heroes.find(h => h.id === activeTurn?.heroId)
    const actionCount = hero && hero.level >= 7 ? 4 : 3

    setGameState((current) => ({
      ...current,
      currentTurn: current?.currentTurn ? {
        ...current.currentTurn,
        phase: 'ACTIONS',
      } : undefined,
    }))
    
    toast.success(`Actions phase - Perform your ${actionCount} actions`)
  }

  const handleEndTurn = () => {
    const activeTurn = gameState?.currentTurn
    if (!activeTurn) return

    const hero = gameState?.heroes.find(h => h.id === activeTurn.heroId)
    if (!hero) return

    endTurnPhase(hero)
  }

  const endTurnPhase = (hero: Hero) => {
    const { newHealth, isGameOver, wasRavenous } = processEndPhase(hero)
    
    const details: string[] = ['Turn phase: END']
    
    if (wasRavenous) {
      details.push(`Ravenous! Health reduced: ${hero.health} → ${newHealth}`)
      
      if (isGameOver) {
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
      dialogs.setPhaseConfirmation({
        open: true,
        phase: 'GAME_OVER',
        message: `${hero.name} has reached 0 health and died!`,
        details: [
          'The game is over.',
          'Start a new game to continue playing.',
        ],
        onConfirm: () => {
          dialogs.closePhaseConfirmation()
          dialogs.openInitDialog()
        },
      })
    } else {
      dialogs.setPhaseConfirmation({
        open: true,
        phase: 'END',
        message: 'Turn complete',
        details,
        onConfirm: () => {
          dialogs.closePhaseConfirmation()
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
    dialogs.openAttackDialog(heroId)
  }

  const handleAttackComplete = (heroId: string, hungerGained: number, enemiesDefeated: number) => {
    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map(h => {
        if (h.id === heroId) {
          const updatedHero = { 
            ...h, 
            hunger: clampHunger(h.hunger + hungerGained), 
            level: h.level + enemiesDefeated 
          }
          return consumeAction(updatedHero)
        }
        return h
      }) || [],
    }))
    dialogs.closeAttackDialog()
  }

  const handleDevour = (heroId: string) => {
    dialogs.openDevourDialog(heroId)
  }

  const handleDevourComplete = (heroId: string, hungerGained: number, wasSuccessful: boolean) => {
    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map(h => {
        if (h.id === heroId) {
          const updatedHero = { 
            ...h, 
            hunger: wasSuccessful ? 0 : clampHunger(h.hunger + hungerGained) 
          }
          return consumeAction(updatedHero)
        }
        return h
      }) || [],
    }))
    dialogs.closeDevourDialog()
  }

  const handleGainTrait = (heroId: string) => {
    const hero = gameState?.heroes.find(h => h.id === heroId)
    if (!hero) return

    const availableSlotIndex = [0, 1].find(idx => !hero.traits[idx])

    if (availableSlotIndex !== undefined) {
      // Consume action and open edit dialog
      setGameState((current) => ({
        ...current,
        heroes: current?.heroes.map(h => 
          h.id === heroId ? consumeAction(h) : h
        ) || [],
      }))
      handleEditTrait(heroId, availableSlotIndex)
    } else {
      // No slots available
      setGameState((current) => ({
        ...current,
        heroes: current?.heroes.map(h => 
          h.id === heroId ? consumeAction(h) : h
        ) || [],
      }))
      toast.info('No trait slots available! Evaluate manually what to do (e.g., replace an existing trait).', {
        duration: 5000,
      })
    }
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
          onShowKeyboardHelp={dialogs.openKeyboardHelp}
          onNewGame={dialogs.openInitDialog}
          onStartTurn={triggerStartTurn}
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
            onEditTrait={handleEditTrait}
            activeTurnHeroId={gameState?.currentTurn?.heroId}
            playedHeroIds={gameState?.currentRound?.turns.map(t => t.heroId) || []}
            currentTurnPhase={gameState?.currentTurn?.phase}
            onEndTurn={handleEndTurn}
            onAttack={handleAttack}
            onDevour={handleDevour}
            onGainTrait={handleGainTrait}
          />
        </main>
      </div>

      <TraitEditDialog
        open={dialogs.editingTrait !== null}
        onClose={dialogs.closeTraitEdit}
        trait={dialogs.editingTrait?.trait || null}
        onSave={handleSaveTrait}
      />

      {dialogs.showInitDialog && (
        <GameInitDialog
          onStartNew={handleStartNewGame}
          onContinue={handleContinueGame}
          onClose={dialogs.closeInitDialog}
        />
      )}

      <StartTurnDialog
        open={dialogs.showStartTurnDialog}
        heroes={getAvailableHeroes(gameState?.heroes || [], gameState?.currentRound)}
        onSelectHero={handleStartTurn}
        onClose={dialogs.closeStartTurnDialog}
      />

      <KeyboardShortcuts open={dialogs.showKeyboardHelp} onClose={dialogs.closeKeyboardHelp} />

      {dialogs.phaseConfirmation && (
        <PhaseConfirmationDialog
          open={dialogs.phaseConfirmation.open}
          phase={dialogs.phaseConfirmation.phase}
          hero={gameState?.heroes.find(h => h.id === gameState?.currentTurn?.heroId) || null}
          message={dialogs.phaseConfirmation.message}
          details={dialogs.phaseConfirmation.details}
          isAutomaticMode={gameState?.isAutomaticMode || false}
          onConfirm={dialogs.phaseConfirmation.onConfirm}
          onClose={dialogs.closePhaseConfirmation}
        />
      )}

      {dialogs.attackingHeroId && (
        <AttackDialog
          open={true}
          hero={gameState?.heroes.find(h => h.id === dialogs.attackingHeroId) || null}
          onComplete={handleAttackComplete}
          onClose={dialogs.closeAttackDialog}
        />
      )}

      {dialogs.devouringHeroId && (
        <DevourDialog
          open={true}
          hero={gameState?.heroes.find(h => h.id === dialogs.devouringHeroId) || null}
          onComplete={handleDevourComplete}
          onClose={dialogs.closeDevourDialog}
        />
      )}
    </div>
  )
}

export default App
