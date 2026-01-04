import { Hero } from './Hero'
import { LEVEL_THRESHOLDS, MAX_HEALTH, MIN_HEALTH, MAX_HUNGER, MIN_HUNGER, BASE_ACTIONS, LEVEL_7_ACTIONS, LEVEL_7_THRESHOLD } from './constants'

/**
 * Utility functions for hero management
 */

/**
 * Get the color class for a hero's level
 */
export function getLevelColor(level: number): string {
  if (level <= LEVEL_THRESHOLDS.BLUE.max) return LEVEL_THRESHOLDS.BLUE.color
  if (level <= LEVEL_THRESHOLDS.YELLOW.max) return LEVEL_THRESHOLDS.YELLOW.color
  if (level <= LEVEL_THRESHOLDS.ORANGE.max) return LEVEL_THRESHOLDS.ORANGE.color
  return LEVEL_THRESHOLDS.RED.color
}

/**
 * Get the category name for a hero's level
 */
export function getLevelCategory(level: number): string {
  if (level <= LEVEL_THRESHOLDS.BLUE.max) return LEVEL_THRESHOLDS.BLUE.category
  if (level <= LEVEL_THRESHOLDS.YELLOW.max) return LEVEL_THRESHOLDS.YELLOW.category
  if (level <= LEVEL_THRESHOLDS.ORANGE.max) return LEVEL_THRESHOLDS.ORANGE.category
  return LEVEL_THRESHOLDS.RED.category
}

/**
 * Clamp health value within valid bounds
 */
export function clampHealth(health: number): number {
  return Math.max(MIN_HEALTH, Math.min(MAX_HEALTH, health))
}

/**
 * Clamp hunger value within valid bounds
 */
export function clampHunger(hunger: number): number {
  return Math.max(MIN_HUNGER, Math.min(MAX_HUNGER, hunger))
}

/**
 * Check if a hero is ravenous (hunger at maximum)
 */
export function isRavenous(hero: Hero): boolean {
  return hero.hunger >= MAX_HUNGER
}

/**
 * Get the number of available actions for a hero based on level
 */
export function getMaxActions(level: number): number {
  return level >= LEVEL_7_THRESHOLD ? LEVEL_7_ACTIONS : BASE_ACTIONS
}

/**
 * Create a new hero with default values
 */
export function createHero(name: string): Hero {
  return {
    id: crypto.randomUUID(),
    name,
    health: MAX_HEALTH,
    hunger: MIN_HUNGER,
    level: 0,
    baseAttackValue: 2,
    precision: 3,
    traits: [],
    availableActions: BASE_ACTIONS,
  }
}
