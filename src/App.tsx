import { AttackDialog } from '@/components/AttackDialog'
import { DevourDialog } from '@/components/DevourDialog'
import { GameInitDialog } from '@/components/GameInitDialog'
import { Header } from '@/components/Header'
import { HeroGrid } from '@/components/HeroGrid'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { PhaseConfirmationDialog } from '@/components/PhaseConfirmationDialog'
import { StartTurnDialog } from '@/components/StartTurnDialog'
import { useGameDialogs } from '@/hooks/useGameDialogs'
import { usePersistentState } from '@/hooks/usePersistentState'
import { Toaster, toast } from 'sonner'
import { ByStanderEditDialog } from './components/ByStanderEditDialog'
import { TraitEditDialog } from './components/TraitEditDialog'
import {
  archiveCurrentGameIfNeeded,
  createGameSessionId,
  GameState,
  isGameStateEmpty,
  normalizeGameState,
} from "./lib/GameState"
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
import { useAuth } from '@/hooks/useAuth'
import { useCloudSync } from '@/hooks/useCloudSync'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useUserStats } from '@/hooks/useUserStats'
import { ConflictResolutionDialog } from '@/components/ConflictResolutionDialog'
import { useCallback, useEffect, useState } from 'react'


function App() {
  const [gameState, setGameState] = usePersistentState<GameState>(
    'marvel-zombies-game',
    {
      gameSessionId: createGameSessionId(),
      heroes: [],
      isAutomaticMode: false,
    }
  )

  // Use custom hooks for dialog management
  const dialogs = useGameDialogs()
  const { user, signIn } = useAuth()
  const { preferences, updatePreferences } = useUserPreferences()
  const { stats, incrementStat } = useUserStats()
  const [profileOpen, setProfileOpen] = useState(false)

  // Cloud sync
  const { syncStatus, conflict, resolveConflict } = useCloudSync({
    gameState,
    setGameState: (s) => setGameState(s),
  })

  // Global keyboard shortcut: Ctrl/Cmd+L → open login or profile
  const handleGlobalKeyboard = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault()
      if (user) {
        setProfileOpen(prev => !prev)
      } else {
        signIn()
      }
    }
  }, [user, signIn])

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyboard)
    return () => window.removeEventListener('keydown', handleGlobalKeyboard)
  }, [handleGlobalKeyboard])

  useEffect(() => {
    setGameState((current) => normalizeGameState(current))
  }, [setGameState])

 

  const handleStartNewGame = (heroCount: number) => {
    const newHeroes: Hero[] = Array.from({ length: heroCount }).map((_, index) => 
      createHero(`Hero ${index + 1}`)
    )

    setGameState((current) => {
      const normalizedCurrent = normalizeGameState(current)
      const withArchivedCurrent = archiveCurrentGameIfNeeded(normalizedCurrent)
      const reuseCurrentSessionId =
        isGameStateEmpty(normalizedCurrent) && !!normalizedCurrent.gameSessionId

      return normalizeGameState({
        gameSessionId: reuseCurrentSessionId
          ? normalizedCurrent.gameSessionId
          : createGameSessionId(),
        heroes: newHeroes,
        isAutomaticMode: preferences.defaultAutomaticMode,
        gameOver: false,
        gameHistory: withArchivedCurrent.gameHistory,
      })
    })

    // Track stats
    incrementStat('gamesPlayed')
    incrementStat('heroesCreated', heroCount)

    dialogs.closeInitDialog()
    toast.success(`Game initialized with ${heroCount} hero${heroCount > 1 ? 'es' : ''}`)
  }

  const handleRestoreArchivedGame = (sessionId: string) => {
    let restoredHeroCount = 0

    setGameState((current) => {
      const normalizedCurrent = normalizeGameState(current)
      const history = normalizedCurrent.gameHistory ?? []
      const selectedEntry = history.find((entry) => entry.sessionId === sessionId)

      if (!selectedEntry) {
        return normalizedCurrent
      }

      // Remove selected history first to prevent re-adding duplicates during archive.
      let nextHistory = history.filter((entry) => entry.sessionId !== sessionId)
      if (!isGameStateEmpty(normalizedCurrent)) {
        const archivedCurrent = archiveCurrentGameIfNeeded({
          ...normalizedCurrent,
          gameHistory: nextHistory,
        })
        nextHistory = archivedCurrent.gameHistory ?? []
      }

      restoredHeroCount = selectedEntry.state.heroes.length

      return normalizeGameState({
        ...selectedEntry.state,
        gameSessionId: selectedEntry.sessionId,
        gameHistory: nextHistory,
      }, selectedEntry.sessionId)
    })

    dialogs.closeInitDialog()
    toast.success(`Archived game restored (${restoredHeroCount} hero${restoredHeroCount !== 1 ? 'es' : ''})`)
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

  const handleEditByStander = (heroId: string) => {
    const hero = gameState?.heroes.find((h) => h.id === heroId)
    if (!hero) return

    dialogs.openByStanderEdit(heroId, hero.byStander)
  }

  const handleSaveTrait = (trait: Trait) => {
    if (!dialogs.editingTrait) return

    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map((hero) => {
        if (hero.id === dialogs.editingTrait!.heroId) {
          const newTraits = [...hero.traits]
          newTraits[dialogs.editingTrait!.traitIndex] = trait
          // Consume action only when successfully saving a new trait
          // We check if we are editing an existing trait or adding a new one
          // If traitIndex points to an existing trait, it's an edit (no cost)
          // But wait, handleGainTrait is called specifically for "Gain Trait" action
          // which implies adding a new one.
          // However, handleEditTrait is also used for editing existing ones.
          // We need to know if this was a "Gain Trait" action.
          // The simplest way is to check if the slot was empty before.
          const wasEmpty = !hero.traits[dialogs.editingTrait!.traitIndex]
          
          let updatedHero = { ...hero, traits: newTraits }
          
          if (wasEmpty) {
             updatedHero = consumeAction(updatedHero)
          }
          
          return updatedHero
        }
        return hero
      }) || [],
    }))

    dialogs.closeTraitEdit()
    toast.success('Trait saved')
  }

  const handleSaveByStander = (byStander: Trait) => {
    if (!dialogs.editingByStander) return

    setGameState((current) => ({
      ...current,
      heroes: current?.heroes.map((hero) => 
        hero.id === dialogs.editingByStander!.heroId 
          ? { ...hero, byStander } 
          : hero
      ) || [],
    }))

    dialogs.closeByStanderEdit()
    toast.success('Bystander saved')
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

  const handleDevourComplete = (heroId: string, hungerGained: number, wasSuccessful: boolean, enemiesDevoured: number) => {
    setGameState((current) => ({
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
    }))
    dialogs.closeDevourDialog()

    // Track devour roll stat
    incrementStat('devourRolls')
  }

  const handleGainTrait = (heroId: string) => {
    const hero = gameState?.heroes.find(h => h.id === heroId)
    if (!hero) return

    const availableSlotIndex = [0, 1].find(idx => !hero.traits[idx])

    if (availableSlotIndex !== undefined) {
      // Open edit dialog without consuming action yet
      handleEditTrait(heroId, availableSlotIndex)
    } else {
      // No slots available
      // Even if we replace, it might be considered a "Gain Trait" action?
      // For now, let's stick to the logic that you can only gain if you have a slot.
      // If the user wants to replace, they should probably delete one first?
      // Or we can allow opening the dialog on a filled slot to replace it, 
      // but that's "Edit Trait", not "Gain Trait".
      // The "Gain Trait" button in UI usually implies getting a new one.
      
      // If we want to support replacing, we would need to ask the user which one to replace.
      // But the current UI logic finds the first available slot.
      
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
          archivedGames={gameState?.gameHistory ?? []}
          onRestoreArchived={handleRestoreArchivedGame}
          onClose={() => {}}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="font-rajdhani font-bold text-4xl uppercase tracking-tight text-accent">
              Marvel Zombies
            </h1>
            <p className="text-muted-foreground">Hero Turn Tracker</p>
            {!user && (
              <button
                onClick={signIn}
                className="text-sm text-muted-foreground hover:text-accent transition-colors underline underline-offset-4 cursor-pointer"
              >
                Sign in to sync across devices
              </button>
            )}
          </div>
        </div>
        <ConflictResolutionDialog conflict={conflict} onResolve={resolveConflict} />
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
          profileOpen={profileOpen}
          onProfileOpenChange={setProfileOpen}
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
          syncStatus={syncStatus}
          stats={stats}
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
          archivedGames={gameState?.gameHistory ?? []}
          onRestoreArchived={handleRestoreArchivedGame}
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

      <ConflictResolutionDialog conflict={conflict} onResolve={resolveConflict} />
    </div>
  )
}

export default App
