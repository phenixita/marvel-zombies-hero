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
  powers: Power[]
}

export interface Turn {
  heroId: string
  startTime: number
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
}
