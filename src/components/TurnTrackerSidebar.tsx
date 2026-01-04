import { Card } from '@/components/ui/card'
import { GameState } from "@/lib/GameState"
import { Hero } from "@/lib/Hero"
import { ArrowRight, Check, Circle } from '@phosphor-icons/react'

interface TurnTrackerSidebarProps {
  gameState: GameState
  onUpdateHero: (hero: Hero) => void
}



export function TurnTrackerSidebar({ gameState, onUpdateHero }: TurnTrackerSidebarProps) {

  const currentRound = gameState.currentRound
  const currentTurn = gameState.currentTurn
  const heroes = gameState.heroes || []


  // Calculate hero status (Done, Active, Pending)
  const getHeroStatus = (heroId: string) => {
    if (!currentRound) return 'pending'

    if (currentTurn?.heroId === heroId) {
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
            Heroes
          </h3>
          <div className="space-y-2">
            {heroes.map((hero) => {
              const status = getHeroStatus(hero.id)
              return (
                <div
                  key={hero.id}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors ${status === 'active'
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
                  <span className={`text-sm font-medium truncate ${status === 'active' ? 'text-accent' : ''
                    }`}>
                    {hero.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

    
       
      </div>
    </aside>
  )
}
