import { useState } from 'react'
import { Trait } from '@/lib/Trait'

/**
 * Custom hook to manage all dialog states in the app
 */
export function useGameDialogs() {
  const [editingTrait, setEditingTrait] = useState<{
    heroId: string
    traitIndex: number
    trait: Trait | null
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

  return {
    // Trait editing
    editingTrait,
    setEditingTrait,
    openTraitEdit: (heroId: string, traitIndex: number, trait: Trait | null) => {
      setEditingTrait({ heroId, traitIndex, trait })
    },
    closeTraitEdit: () => setEditingTrait(null),
    
    // Keyboard shortcuts help
    showKeyboardHelp,
    openKeyboardHelp: () => setShowKeyboardHelp(true),
    closeKeyboardHelp: () => setShowKeyboardHelp(false),
    
    // Game initialization
    showInitDialog,
    openInitDialog: () => setShowInitDialog(true),
    closeInitDialog: () => setShowInitDialog(false),
    
    // Start turn dialog
    showStartTurnDialog,
    openStartTurnDialog: () => setShowStartTurnDialog(true),
    closeStartTurnDialog: () => setShowStartTurnDialog(false),
    
    // Attack dialog
    attackingHeroId,
    openAttackDialog: (heroId: string) => setAttackingHeroId(heroId),
    closeAttackDialog: () => setAttackingHeroId(null),
    
    // Devour dialog
    devouringHeroId,
    openDevourDialog: (heroId: string) => setDevouringHeroId(heroId),
    closeDevourDialog: () => setDevouringHeroId(null),
    
    // Phase confirmation
    phaseConfirmation,
    setPhaseConfirmation,
    closePhaseConfirmation: () => setPhaseConfirmation(null),
  }
}
