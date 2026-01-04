import { Hero } from './Hero'
import { Round } from './Round'
import { Turn } from './Turn'
import { getMaxActions, clampHunger, clampHealth } from './heroUtils'
import { RAVENOUS_HUNGER_LEVEL } from './constants'

/**
 * Game logic utilities for turn and round management
 */

/**
 * Check if a new round should start
 */
export function shouldStartNewRound(currentRound: Round | undefined, totalHeroes: number): boolean {
  return !currentRound || currentRound.turns.length >= totalHeroes
}

/**
 * Get available heroes for starting a turn (excludes heroes who already played in current round)
 */
export function getAvailableHeroes(heroes: Hero[], currentRound?: Round): Hero[] {
  if (!currentRound) return heroes
  
  const playedHeroIds = currentRound.turns.map(t => t.heroId)
  const availableHeroes = heroes.filter(h => !playedHeroIds.includes(h.id))
  
  // If all heroes have played, return all heroes (new round starting)
  return availableHeroes.length === 0 ? heroes : availableHeroes
}

/**
 * Create a new turn for a hero
 */
export function createTurn(heroId: string): Turn {
  return {
    heroId,
    startTime: Date.now(),
    phase: 'START',
    actionsTaken: 0,
  }
}

/**
 * Create a new round
 */
export function createRound(previousRound: Round | undefined, firstTurn: Turn): Round {
  const now = Date.now()
  
  // Close previous round if it exists
  if (previousRound) {
    previousRound.endTime = now
  }
  
  return {
    number: (previousRound?.number || 0) + 1,
    turns: [firstTurn],
    startTime: now,
  }
}

/**
 * Process start turn phase - increment hunger
 */
export function processStartPhase(hero: Hero): {
  newHunger: number
  hungerIncreased: boolean
} {
  const newHunger = clampHunger(hero.hunger + 1)
  const hungerIncreased = newHunger !== hero.hunger
  
  return { newHunger, hungerIncreased }
}

/**
 * Process end turn phase - apply ravenous damage if applicable
 */
export function processEndPhase(hero: Hero): {
  newHealth: number
  isGameOver: boolean
  wasRavenous: boolean
} {
  const wasRavenous = hero.hunger >= RAVENOUS_HUNGER_LEVEL
  
  if (wasRavenous) {
    const newHealth = clampHealth(hero.health - 1)
    const isGameOver = newHealth === 0
    return { newHealth, isGameOver, wasRavenous }
  }
  
  return { newHealth: hero.health, isGameOver: false, wasRavenous }
}

/**
 * Reset available actions for a hero at turn start
 */
export function resetHeroActions(hero: Hero): Hero {
  return {
    ...hero,
    availableActions: getMaxActions(hero.level),
  }
}

/**
 * Consume an action from a hero
 */
export function consumeAction(hero: Hero): Hero {
  return {
    ...hero,
    availableActions: Math.max(0, hero.availableActions - 1),
  }
}
