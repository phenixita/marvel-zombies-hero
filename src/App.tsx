import { AttackDialog } from '@/components/AttackDialog'
import { DevourDialog } from '@/components/DevourDialog'
import { GameInitDialog } from '@/components/GameInitDialog'
import { Header } from '@/components/Header'
import { HeroGrid } from '@/components/HeroGrid'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { PhaseConfirmationDialog } from '@/components/PhaseConfirmationDialog'
import { StartTurnDialog } from '@/components/StartTurnDialog'
import { useGameDialogs } from '@/hooks/useGameDialogs'
import { useEventHistory } from '@/hooks/useEventHistory'
import { Toaster, toast } from 'sonner'
import { ByStanderEditDialog } from './components/ByStanderEditDialog'
import { TraitEditDialog } from './components/TraitEditDialog'
import { GameState } from "./lib/GameState"
import { GameEventType } from "./lib/GameEvent"
import { Hero } from "./lib/Hero"
import { Trait } from "./lib/Trait"
import {
  consumeAction,
  createRound,
  createTurn,
  getAvailableHeroes,
  processEndPhase,
  processStartPhase,
  resetHeroActions,
  shouldStartNewRound
} from './lib/gameLogic'
import { clampHunger, createHero } from './lib/heroUtils'

function App() {
  const { 
    state: gameState, 
    canUndo, 
    canRedo, 
    undo, 
    redo, 
    recordEvent,
    clearHistory 
  } = useEventHistory({
    heroes: [],
    isAutomaticMode: false,
  })

  // Use custom hooks for dialog management
  const dialogs = useGameDialogs()

  // Helper to update state with event recording
  const updateStateWithEvent = (
    type: GameEventType, 
    description: string, 
    updateFn: (current: GameState) => GameState
  ) => {
    const newState = updateFn(gameState)
    recordEvent(type, description, newState)
  }

 

  const handleStartNewGame = (heroCount: number) => {
    const newHeroes: Hero[] = Array.from({ length: heroCount }).map((_, index) => 
      createHero(`Hero ${index + 1}`)
    )

    const newState: GameState = {
      heroes: newHeroes,
      isAutomaticMode: false,
    }
    
    recordEvent('GAME_INIT', `New game with ${heroCount} hero${heroCount > 1 ? 'es' : ''}`, newState)
    clearHistory() // Clear history when starting a new game

    dialogs.closeInitDialog()
    toast.success(`Game initialized with ${heroCount} hero${heroCount > 1 ? 'es' : ''}`)
  }

  const handleContinueGame = () => {
    dialogs.closeInitDialog()
  }

  const handleUpdateHero = (updatedHero: Hero) => {
    updateStateWithEvent(
      'HERO_UPDATE',
      `Updated ${updatedHero.name}`,
      (current) => ({
        ...current,
        heroes: current?.heroes.map((h) => (h.id === updatedHero.id ? updatedHero : h)) || [],
      })
    )
  }

  const handleEditTrait = (heroId: string, traitIndex: number) => {
    const hero = gameState?.heroes.find((h) => h.id === heroId)
    if (!hero) return

    dialogs.openTraitEdit(heroId, traitIndex, hero.traits[traitIndex] || null)
  }

  const handleEditByStander = (heroId: string) => {
    const hero = gameState?.heroes.find((h) => h.id === heroId)
    if (!hero) return

    dialogs.openByStanderEdit(heroId, hero.byStander)
  }

  const handleSaveTrait = (trait: Trait) => {
    if (!dialogs.editingTrait) return

    updateStateWithEvent(
      'TRAIT_SAVE',
      `Saved trait for hero`,
      (current) => ({
        ...current,
        heroes: current?.heroes.map((hero) => {
          if (hero.id === dialogs.editingTrait!.heroId) {
            const newTraits = [...hero.traits]
            newTraits[dialogs.editingTrait!.traitIndex] = trait
            return { ...hero, traits: newTraits }
          }
          return hero
        }) || [],
      })
    )

    dialogs.closeTraitEdit()
    toast.success('Trait saved')
  }

  const handleSaveByStander = (byStander: Trait) => {
    if (!dialogs.editingByStander) return

    updateStateWithEvent(
      'BYSTANDER_SAVE',
      `Saved bystander for hero`,
      (current) => ({
        ...current,
        heroes: current?.heroes.map((hero) => 
          hero.id === dialogs.editingByStander!.heroId 
            ? { ...hero, byStander } 
            : hero
        ) || [],
      })
    )

    dialogs.closeByStanderEdit()
    toast.success('Bystander saved')
  }

  const handleToggleAutomaticMode = () => {
    updateStateWithEvent(
      'AUTOMATIC_MODE_TOGGLE',
      `Automatic mode ${!gameState?.isAutomaticMode ? 'enabled' : 'disabled'}`,
      (current) => ({
        ...current,
        isAutomaticMode: !current?.isAutomaticMode,
      })
    )
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

    const totalHeroes = gameState?.heroes.length || 0
    const needsNewRound = shouldStartNewRound(gameState?.currentRound, totalHeroes)
    
    // Reset available actions for the active hero
    const updatedHeroes = gameState?.heroes.map(h => 
      h.id === hero.id ? resetHeroActions(h) : h
    ) || []

    let newState: GameState
    if (needsNewRound) {
      // Start a new round
      const newRound = createRound(gameState?.currentRound, newTurn)

      newState = {
        ...gameState,
        heroes: updatedHeroes,
        currentRound: newRound,
        currentTurn: newTurn,
      }
    } else {
      // Add turn to existing round
      const updatedRound = {
        ...gameState!.currentRound!,
        turns: [...gameState!.currentRound!.turns, newTurn],
      }

      newState = {
        ...gameState,
        heroes: updatedHeroes,
        currentRound: updatedRound,
        currentTurn: newTurn,
      }
    }

    recordEvent('TURN_START', `${hero.name} started their turn`, newState)

    dialogs.closeStartTurnDialog()
    
    // Start the START phase (increment hunger)
    startTurnPhase(hero)
  }

  const startTurnPhase = (hero: Hero) => {
    const { newHunger, hungerIncreased } = processStartPhase(hero)

    updateStateWithEvent(
      'HERO_HUNGER_CHANGE',
      `${hero.name} hunger ${hungerIncreased ? `increased to ${newHunger}` : `at max (${newHunger})`}`,
      (current) => ({
        ...current,
        heroes: current?.heroes.map(h => 
          h.id === hero.id ? { ...h, hunger: newHunger } : h
        ) || [],
      })
    )

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

    updateStateWithEvent(
      'PHASE_CHANGE',
      `Entered ACTIONS phase`,
      (current) => ({
        ...current,
        currentTurn: current?.currentTurn ? {
          ...current.currentTurn,
          phase: 'ACTIONS',
        } : undefined,
      })
    )
    
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
    updateStateWithEvent(
      'TURN_END',
      `${hero.name} ended their turn${wasRavenous ? ' (ravenous)' : ''}`,
      (current) => ({
        ...current,
        heroes: current?.heroes.map(h => 
          h.id === hero.id ? { ...h, health: newHealth } : h
        ) || [],
        currentTurn: current?.currentTurn ? {
          ...current.currentTurn,
          phase: 'END',
        } : undefined,
        gameOver: isGameOver,
      })
    )

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
          updateStateWithEvent(
            'PHASE_CHANGE',
            `Turn completed, returned to IDLE`,
            (current) => ({
              ...current,
              currentTurn: undefined,
            })
          )
          toast.success(`${hero.name}'s turn ended`)
        },
      })
    }
  }

  const handleAttack = (heroId: string) => {
    dialogs.openAttackDialog(heroId)
  }

  const handleAttackComplete = (heroId: string, hungerGained: number, enemiesDefeated: number) => {
    const hero = gameState?.heroes.find(h => h.id === heroId)
    updateStateWithEvent(
      'ATTACK',
      `${hero?.name || 'Hero'} attacked (hunger +${hungerGained}, defeated ${enemiesDefeated})`,
      (current) => ({
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
      })
    )
    dialogs.closeAttackDialog()
  }

  const handleDevour = (heroId: string) => {
    dialogs.openDevourDialog(heroId)
  }

  const handleDevourComplete = (heroId: string, hungerGained: number, wasSuccessful: boolean, enemiesDevoured: number) => {
    const hero = gameState?.heroes.find(h => h.id === heroId)
    updateStateWithEvent(
      'DEVOUR',
      `${hero?.name || 'Hero'} devoured ${wasSuccessful ? '(success)' : '(failed)'}`,
      (current) => ({
        ...current,
        heroes: current?.heroes.map(h => {
          if (h.id === heroId) {
            const updatedHero = { 
              ...h, 
              hunger: wasSuccessful ? 0 : clampHunger(h.hunger + hungerGained),
              level: h.level + enemiesDevoured,
            }
            return consumeAction(updatedHero)
          }
          return h
        }) || [],
      })
    )
    dialogs.closeDevourDialog()
  }

  const handleGainTrait = (heroId: string) => {
    const hero = gameState?.heroes.find(h => h.id === heroId)
    if (!hero) return

    const availableSlotIndex = [0, 1].find(idx => !hero.traits[idx])

    if (availableSlotIndex !== undefined) {
      // Consume action and open edit dialog
      updateStateWithEvent(
        'GAIN_TRAIT',
        `${hero.name} gaining trait (action consumed)`,
        (current) => ({
          ...current,
          heroes: current?.heroes.map(h => 
            h.id === heroId ? consumeAction(h) : h
          ) || [],
        })
      )
      handleEditTrait(heroId, availableSlotIndex)
    } else {
      // No slots available
      updateStateWithEvent(
        'ACTION_CONSUME',
        `${hero.name} tried to gain trait (no slots, action consumed)`,
        (current) => ({
          ...current,
          heroes: current?.heroes.map(h => 
            h.id === heroId ? consumeAction(h) : h
          ) || [],
        })
      )
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
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      </header>

      <div className="flex flex-1">

        <main className="flex-1 container mx-auto px-4 py-8">
          <HeroGrid
            heroes={gameState?.heroes || []}
            onUpdateHero={handleUpdateHero}
            onEditTrait={handleEditTrait}
            onEditByStander={handleEditByStander}
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

      <ByStanderEditDialog
        open={dialogs.editingByStander !== null}
        onClose={dialogs.closeByStanderEdit}
        byStander={dialogs.editingByStander?.byStander || null}
        onSave={handleSaveByStander}
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
