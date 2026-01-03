import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { GameState } from "@/lib/GameState"
import { Hero } from "@/lib/Hero"
import { ArrowRight, Check, Circle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

interface TurnTrackerSidebarProps {
  gameState: GameState
  onUpdateHero: (hero: Hero) => void
}

interface ChecklistState {
  actions: boolean
  hunger: boolean
  level: boolean
}

export function TurnTrackerSidebar({ gameState, onUpdateHero }: TurnTrackerSidebarProps) {
  const [checklist, setChecklist] = useState<ChecklistState>({
    actions: false,
    hunger: false,
    level: false,
  })

  const currentRound = gameState.currentRound
  const currentTurn = gameState.currentTurn
  const heroes = gameState.heroes || []

  // Reset checklist when active hero changes
  useEffect(() => {
    setChecklist({ actions: false, hunger: false, level: false })
  }, [currentTurn?.heroId])

  // Calculate hero status (Done, Active, Pending)
  const getHeroStatus = (heroId: string) => {
    if (!currentRound || !currentTurn) return 'pending'
    
    if (currentTurn.heroId === heroId) {
      return 'active'
    }
    
    // Check if hero has already taken their turn this round
    const hasTakenTurn = currentRound.turns.some(turn => turn.heroId === heroId)
    return hasTakenTurn ? 'done' : 'pending'
  }

  // Get active hero
  const activeHero = heroes.find(h => h.id === currentTurn?.heroId)

  // Get level color category
  const getLevelColor = (level: number): string => {
    if (level <= 6) return 'bg-blue-500'
    if (level <= 21) return 'bg-yellow-500'
    if (level <= 42) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getLevelCategory = (level: number): string => {
    if (level <= 6) return 'Blue'
    if (level <= 21) return 'Yellow'
    if (level <= 42) return 'Orange'
    return 'Red'
  }

  const handleLevelChange = (value: number[]) => {
    if (!activeHero) return
    const newLevel = Math.max(0, Math.min(43, value[0]))
    onUpdateHero({ ...activeHero, level: newLevel })
  }

  return (
    <aside className="w-72 border-r border-border bg-card/30 hidden lg:flex lg:flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Round Indicator */}
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Round</p>
            <p className="text-4xl font-rajdhani font-bold text-accent">
              {currentRound?.number || 0}
            </p>
          </div>
        </Card>

        {/* Hero Turn List */}
        <div className="space-y-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Turn Order
          </h3>
          <div className="space-y-2">
            {heroes.map((hero) => {
              const status = getHeroStatus(hero.id)
              return (
                <div
                  key={hero.id}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                    status === 'active'
                      ? 'bg-accent/20 border border-accent/50'
                      : status === 'done'
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-muted/30 border border-border'
                  }`}
                >
                  {status === 'done' && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" weight="bold" />
                  )}
                  {status === 'active' && (
                    <ArrowRight className="w-4 h-4 text-accent flex-shrink-0" weight="bold" />
                  )}
                  {status === 'pending' && (
                    <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" weight="bold" />
                  )}
                  <span className={`text-sm font-medium truncate ${
                    status === 'active' ? 'text-accent' : ''
                  }`}>
                    {hero.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Hero Panel */}
        {activeHero && (
          <Card className="p-4 space-y-4 bg-accent/5 border-accent/30">
            <div>
              <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Active Hero
              </h3>
              <p className="font-rajdhani font-bold text-xl uppercase text-accent">
                {activeHero.name}
              </p>
            </div>

            {/* Current Phase Indicator */}
            {currentTurn?.phase && currentTurn.phase !== 'IDLE' && (
              <div className="bg-accent/10 px-3 py-2 rounded-md border border-accent/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                  Current Phase
                </p>
                <p className="font-rajdhani font-bold text-lg uppercase text-accent">
                  {currentTurn.phase === 'START' && 'Starting Turn'}
                  {currentTurn.phase === 'ACTIONS' && 'Actions Phase'}
                  {currentTurn.phase === 'END' && 'Ending Turn'}
                </p>
              </div>
            )}

            {/* Turn Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider">
                Turn Reminders
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={checklist.actions}
                    onCheckedChange={(checked) =>
                      setChecklist(prev => ({ ...prev, actions: checked === true }))
                    }
                  />
                  <span className="text-sm">Execute Actions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={checklist.hunger}
                    onCheckedChange={(checked) =>
                      setChecklist(prev => ({ ...prev, hunger: checked === true }))
                    }
                  />
                  <span className="text-sm">Update Hunger</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={checklist.level}
                    onCheckedChange={(checked) =>
                      setChecklist(prev => ({ ...prev, level: checked === true }))
                    }
                  />
                  <span className="text-sm">Update Level</span>
                </label>
              </div>
            </div>

            {/* Level Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider">
                  Level
                </h4>
                <Badge className={`${getLevelColor(activeHero.level)} text-white border-0`}>
                  {getLevelCategory(activeHero.level)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-2xl font-rajdhani font-bold min-w-[3ch] text-center">
                  {activeHero.level}
                </span>
                <div className="flex-1">
                  <Slider
                    value={[activeHero.level]}
                    onValueChange={handleLevelChange}
                    min={0}
                    max={43}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Level Range Reference */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">0-6</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">7-21</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-muted-foreground">22-42</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">43</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* No Active Turn Message */}
        {!activeHero && !currentRound && (
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Start a turn to begin tracking
            </p>
          </Card>
        )}
      </div>
    </aside>
  )
}
