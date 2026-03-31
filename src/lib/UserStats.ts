export interface UserStats {
  gamesPlayed: number
  heroesCreated: number
  devourRolls: number
}

export const DEFAULT_USER_STATS: UserStats = {
  gamesPlayed: 0,
  heroesCreated: 0,
  devourRolls: 0,
}
