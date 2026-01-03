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

export interface GameState {
  heroes: Hero[]
}
