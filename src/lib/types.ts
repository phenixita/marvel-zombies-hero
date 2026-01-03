export interface Power {
  id: string
  title: string
  description: string
}

export interface Hero {
  id: string
  name: string
  health: number
  hunger: number
  level: number
  baseAttackValue: number
  powers: Power[]
  availableActions: number
}

export type TurnPhase = 'IDLE' | 'START' | 'ACTIONS' | 'END'

export interface Turn {
  heroId: string
  startTime: number
  phase: TurnPhase
  actionsTaken: number
}

export interface Round {
  number: number
  turns: Turn[]
  startTime: number
  endTime?: number
}

export interface GameState {
  heroes: Hero[]
  currentRound?: Round
  currentTurn?: Turn
  isAutomaticMode?: boolean
  gameOver?: boolean
}
